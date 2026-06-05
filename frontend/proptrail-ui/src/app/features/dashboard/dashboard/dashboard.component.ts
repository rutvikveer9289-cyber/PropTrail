import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  Chart,
  ChartConfiguration,
  registerables
} from 'chart.js';

import { BaseChartDirective } from 'ng2-charts';

import {
  DashboardService,
  Dashboard,
  FollowUpReminder
} from '../../../core/services/dashboard.service';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {

  dashboardData?: Dashboard;
  dashboardError = '';
  isLoading = true;

  filterOptions = ['Today', 'ThisMonth', 'AllTime'];
  selectedFilter = 'AllTime';

  // Animated KPI values
  animatedProperties = 0;
  animatedLeads      = 0;
  animatedVisits     = 0;
  animatedDeals      = 0;
  animatedRevenue    = 0;

  followUpReminders: FollowUpReminder[] = [];

  private animTimers: any[] = [];

  // ── Chart configs ───────────────────────────────────────────
  pieChartType: 'pie' = 'pie';
  pieChartData: ChartConfiguration<'pie'>['data'] = {
    labels: ['Won', 'Open', 'Lost'],
    datasets: [{ data: [0, 0, 0], backgroundColor: ['#16a34a', '#2563eb', '#ef4444'], borderWidth: 2, borderColor: '#fff' }]
  };
  pieChartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, padding: 12, font: { size: 11, family: 'Inter' } } } }
  };

  barChartType: 'bar' = 'bar';
  barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{ label: 'Revenue (₹)', data: [0,0,0,0,0,0], backgroundColor: 'rgba(37,99,235,0.8)', borderRadius: 6, borderSkipped: false }]
  };
  barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11, family: 'Inter' } } },
      y: { grid: { color: '#f1f5f9' }, ticks: { font: { size: 11, family: 'Inter' } } }
    }
  };

  leadChartType: 'doughnut' = 'doughnut';
  leadChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['New', 'Contacted', 'Closed'],
    datasets: [{ data: [0,0,0], backgroundColor: ['#06b6d4', '#f59e0b', '#16a34a'], borderWidth: 2, borderColor: '#fff' }]
  };
  leadChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true, maintainAspectRatio: false, cutout: '65%',
    plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, padding: 12, font: { size: 11, family: 'Inter' } } } }
  };

  visitsChartType: 'line' = 'line';
  visitsChartData: ChartConfiguration<'line'>['data'] = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Visits',
      data: [0,0,0,0,0,0],
      borderColor: '#06b6d4',
      backgroundColor: 'rgba(6,182,212,0.1)',
      fill: true, tension: 0.4,
      pointBackgroundColor: '#06b6d4',
      pointRadius: 4, pointHoverRadius: 6
    }]
  };
  visitsChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11, family: 'Inter' } } },
      y: { grid: { color: '#f1f5f9' }, ticks: { font: { size: 11, family: 'Inter' }, stepSize: 1 } }
    }
  };

  constructor(
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
    this.loadFollowUpReminders();
  }

  ngOnDestroy(): void {
    this.animTimers.forEach(t => clearInterval(t));
  }

  loadDashboard(): void {
    this.isLoading = true;
    this.dashboardError = '';

    this.dashboardService.getFilteredSummary(this.selectedFilter).subscribe({
      next: (data) => this.applyData(data),
      error: () => {
        this.dashboardService.getDashboard().subscribe({
          next: (data) => this.applyData(data),
          error: () => {
            this.isLoading = false;
            this.dashboardError = 'Unable to load dashboard data. Check backend API.';
            this.cdr.detectChanges();
          }
        });
      }
    });
  }

  private applyData(data: Dashboard): void {
    this.dashboardData = data;
    this.isLoading = false;

    // Animate KPI numbers (snappier, faster duration)
    this.animateValue('animatedProperties', 0, data.totalProperties, 300);
    this.animateValue('animatedLeads',      0, data.activeLeads,     350);
    this.animateValue('animatedVisits',     0, data.scheduledVisits, 400);
    this.animateValue('animatedDeals',      0, data.wonDeals,        450);
    this.animateValue('animatedRevenue',    0, data.totalRevenue,    500);

    // Charts
    this.pieChartData = {
      labels: ['Won', 'Open', 'Lost'],
      datasets: [{ data: [data.wonDeals, data.openDeals, data.lostDeals], backgroundColor: ['#16a34a', '#2563eb', '#ef4444'], borderWidth: 2, borderColor: '#fff' }]
    };
    this.barChartData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{ label: 'Revenue (₹)', data: data.monthlyRevenue, backgroundColor: 'rgba(37,99,235,0.8)', borderRadius: 6, borderSkipped: false }]
    };
    this.leadChartData = {
      labels: ['New', 'Contacted', 'Closed'],
      datasets: [{ data: [...data.leadStatusData], backgroundColor: ['#06b6d4', '#f59e0b', '#16a34a'], borderWidth: 2, borderColor: '#fff' }]
    };
    this.visitsChartData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Visits',
        data: data.monthlyVisits || [0,0,0,0,0,0],
        borderColor: '#06b6d4', backgroundColor: 'rgba(6,182,212,0.1)',
        fill: true, tension: 0.4, pointBackgroundColor: '#06b6d4', pointRadius: 4
      }]
    };
    this.cdr.detectChanges();
  }

  private animateValue(prop: string, start: number, end: number, duration: number): void {
    const steps = 25;
    const step = (end - start) / steps;
    let current = start;
    let count = 0;
    const timer = setInterval(() => {
      count++;
      current += step;
      (this as any)[prop] = Math.round(current);
      this.cdr.detectChanges();
      if (count >= steps) {
        (this as any)[prop] = end;
        clearInterval(timer);
        this.cdr.detectChanges();
      }
    }, duration / steps);
    this.animTimers.push(timer);
  }

  onFilterChange(): void {
    this.loadDashboard();
  }

  loadFollowUpReminders(): void {
    this.dashboardService.getFollowUpReminders().subscribe({
      next: (data) => { 
        this.followUpReminders = data; 
        this.cdr.detectChanges();
      },
      error: (err) => console.warn('Follow-up reminders unavailable:', err)
    });
  }

  formatCurrency(val: number): string {
    if (val >= 10000000) return '₹' + (val / 10000000).toFixed(1) + 'Cr';
    if (val >= 100000)   return '₹' + (val / 100000).toFixed(1) + 'L';
    return '₹' + val.toLocaleString('en-IN');
  }
}