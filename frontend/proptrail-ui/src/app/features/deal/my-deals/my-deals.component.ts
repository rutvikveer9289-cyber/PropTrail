import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DealService } from '../../../core/services/deal.service';
import { ToastService } from '../../../core/services/toast.service';
import { LoaderService } from '../../../core/services/loader.service';

@Component({
  selector: 'app-my-deals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-deals.component.html',
  styleUrls: ['./my-deals.component.scss']
})
export class MyDealsComponent implements OnInit {
  deals: any[] = [];
  stagesList = ['Inquiry', 'Site Visit', 'Negotiation', 'Agreement', 'Token Money', 'Closed'];

  constructor(
    private dealService: DealService,
    private toastService: ToastService,
    private loaderService: LoaderService
  ) {}

  ngOnInit(): void {
    this.loadMyDeals();
  }

  loadMyDeals() {
    this.loaderService.show();
    this.dealService.getDeals().subscribe({
      next: (data) => {
        this.deals = data;
        this.loaderService.hide();
      },
      error: (err) => {
        console.error(err);
        this.loaderService.hide();
        this.toastService.showError('Failed to load your deals.');
      }
    });
  }

  getStagePercentage(stage: string): number {
    const idx = this.stagesList.indexOf(stage || 'Inquiry');
    if (idx === -1) return 10;
    return Math.round(((idx + 1) / this.stagesList.length) * 100);
  }
}
