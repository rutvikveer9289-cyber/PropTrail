import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VisitService } from '../../../core/services/visit.service';
import { ToastService } from '../../../core/services/toast.service';
import { LoaderService } from '../../../core/services/loader.service';

@Component({
  selector: 'app-my-visits',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-visits.component.html',
  styleUrls: ['./my-visits.component.scss']
})
export class MyVisitsComponent implements OnInit {
  visits: any[] = [];
  selectedVisit: any = null;
  showFeedbackModal = false;
  rating = 5;
  feedbackText = '';
  
  get upcomingCount(): number {
    return this.visits.filter(v => v.status === 'Scheduled').length;
  }

  constructor(
    private visitService: VisitService,
    private toastService: ToastService,
    private loaderService: LoaderService
  ) {}

  ngOnInit(): void {
    this.loadMyVisits();
  }

  loadMyVisits() {
    this.loaderService.show();
    this.visitService.getVisits().subscribe({
      next: (data) => {
        this.visits = data;
        this.loaderService.hide();
      },
      error: (err) => {
        console.error(err);
        this.loaderService.hide();
        this.toastService.showError('Failed to load your site visits.');
      }
    });
  }

  openFeedbackModal(visit: any) {
    this.selectedVisit = visit;
    this.rating = visit.clientRating || 5;
    this.feedbackText = visit.clientFeedback || '';
    this.showFeedbackModal = true;
  }

  submitFeedback() {
    if (!this.selectedVisit) return;

    this.loaderService.show();
    const updatedVisit = {
      ...this.selectedVisit,
      clientRating: this.rating,
      clientFeedback: this.feedbackText,
      feedbackStatus: 'Interested'
    };

    this.visitService.updateVisit(this.selectedVisit.visitId, updatedVisit).subscribe({
      next: () => {
        this.loaderService.hide();
        this.toastService.showSuccess('Feedback submitted successfully. Thank you!');
        this.showFeedbackModal = false;
        this.loadMyVisits();
      },
      error: (err) => {
        console.error(err);
        this.loaderService.hide();
        this.toastService.showError('Failed to submit feedback.');
      }
    });
  }
}
