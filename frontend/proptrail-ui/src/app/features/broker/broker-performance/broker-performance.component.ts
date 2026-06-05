import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BrokerPerformanceService } from '../../../core/services/broker-performance.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-broker-performance',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './broker-performance.component.html',
  styleUrl: './broker-performance.component.scss'
})
export class BrokerPerformanceComponent implements OnInit {
  leaderboard: any[] = [];
  comparisonData: any = null;
  isLoading = true;

  constructor(
    private performanceService: BrokerPerformanceService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.performanceService.getLeaderboard().subscribe({
      next: (leaderboard: any[]) => {
        this.leaderboard = leaderboard;
        this.loadComparison();
      },
      error: (err: any) => {
        console.error(err);
        this.toast.showError('Failed to load performance leaderboard.');
        this.isLoading = false;
      }
    });
  }

  loadComparison(): void {
    this.performanceService.getComparison().subscribe({
      next: (comp: any) => {
        this.comparisonData = comp;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  getTotalRevenue(): number {
    return this.leaderboard.reduce((sum, b) => sum + (b.revenueGenerated || 0), 0);
  }

  getAverageConversion(): number {
    if (!this.leaderboard.length) return 0;
    const sum = this.leaderboard.reduce((acc, b) => acc + (b.conversionPercentage || 0), 0);
    return Math.round(sum / this.leaderboard.length);
  }

  getMaxRevenueVal(): number {
    if (!this.comparisonData || !this.comparisonData.monthlyRevenue || !this.comparisonData.monthlyRevenue.length) return 1;
    return Math.max(...this.comparisonData.monthlyRevenue.map((m: any) => m.revenue), 1);
  }

  getMaxCommVal(): number {
    if (!this.comparisonData || !this.comparisonData.monthlyRevenue || !this.comparisonData.monthlyRevenue.length) return 1;
    return Math.max(...this.comparisonData.monthlyRevenue.map((m: any) => m.commission), 1);
  }
}
