import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardService, Dashboard } from '../../core/services/dashboard.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  dashboardData?: Dashboard;
  loading = true;
  error = '';
  today = new Date();

  // Computed values
  dealConversionRate = 0;
  averageRevenuePerDeal = 0;
  leadEngagementRate = 0;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.dashboardService.getDashboard().subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.calculateMetrics();
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load report data', err);
        this.error = 'Unable to fetch report data. Please check backend API logs.';
        this.loading = false;
      }
    });
  }

  calculateMetrics(): void {
    if (!this.dashboardData) return;

    const data = this.dashboardData;

    // Deal Conversion Rate (Won Deals / Total Deals closed/outcome-defined)
    const totalDeals = data.wonDeals + data.openDeals + data.lostDeals;
    this.dealConversionRate = totalDeals > 0 ? (data.wonDeals / totalDeals) * 100 : 0;

    // Average Revenue Per Deal
    this.averageRevenuePerDeal = data.wonDeals > 0 ? data.totalRevenue / data.wonDeals : 0;

    // Lead Engagement Rate (Visits planned relative to Lead count)
    this.leadEngagementRate = data.totalLeads > 0 ? (data.totalVisits / data.totalLeads) * 100 : 0;
  }

  exportCSV(): void {
    if (!this.dashboardData) return;

    const data = this.dashboardData;
    const csvContent = [
      ['PropTrail - Business Performance Report'],
      ['Generated On', this.today.toLocaleString()],
      [],
      ['Metric', 'Value'],
      ['Total Properties Listings', data.totalProperties],
      ['Total Registered Leads', data.totalLeads],
      ['Active Discussion Leads', data.activeLeads],
      ['Total Visits Planned', data.totalVisits],
      ['Active Scheduled Visits', data.scheduledVisits],
      ['Won Deals', data.wonDeals],
      ['Open Deals', data.openDeals],
      ['Lost Deals', data.lostDeals],
      ['Total Revenue (INR)', data.totalRevenue],
      ['Deal Conversion Rate (%)', this.dealConversionRate.toFixed(2)],
      ['Avg Revenue per Won Deal (INR)', this.averageRevenuePerDeal.toFixed(2)],
      ['Lead Engagement Ratio (%)', this.leadEngagementRate.toFixed(2)]
    ].map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `PropTrail_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  printReport(): void {
    window.print();
  }
}
