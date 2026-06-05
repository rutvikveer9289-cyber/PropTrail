import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LeadService } from '../../../core/services/lead.service';
import { LeadActivityService } from '../../../core/services/lead-activity.service';
import { BrokerService } from '../../../core/services/broker.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-lead-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './lead-detail.component.html',
  styleUrl: './lead-detail.component.scss'
})
export class LeadDetailComponent implements OnInit {
  leadId!: number;
  lead: any = null;
  activities: any[] = [];
  brokers: any[] = [];
  isLoading = true;

  // New activity form
  activityType = 'Call';
  activityNotes = '';
  isSavingActivity = false;

  // AI & Assignment
  isScoring = false;
  isAssigning = false;

  activeTab = 'timeline';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private leadService: LeadService,
    private activityService: LeadActivityService,
    private brokerService: BrokerService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.leadId = +idParam;
      this.loadLeadDetails();
      this.loadActivities();
      this.loadBrokers();
    } else {
      this.toast.showError('Invalid Lead ID');
      this.router.navigate(['/lead']);
    }
  }

  loadLeadDetails(): void {
    this.isLoading = true;
    this.leadService.getLead(this.leadId).subscribe({
      next: (data) => {
        this.lead = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.toast.showError('Failed to load lead details.');
        this.isLoading = false;
      }
    });
  }

  loadActivities(): void {
    this.activityService.getActivitiesForLead(this.leadId).subscribe({
      next: (data) => {
        this.activities = data;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  loadBrokers(): void {
    this.brokerService.getBrokers().subscribe({
      next: (data) => {
        this.brokers = data.filter(b => b.role === 'Broker' || b.role === 'Owner');
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  saveActivity(): void {
    if (!this.activityNotes.trim()) {
      this.toast.showWarning('Please type some interaction notes.');
      return;
    }

    this.isSavingActivity = true;
    const payload = {
      leadId: this.leadId,
      type: this.activityType,
      notes: this.activityNotes,
      timestamp: new Date().toISOString(),
      createdBy: 'Active User'
    };

    this.activityService.addActivity(payload).subscribe({
      next: () => {
        this.toast.showSuccess('Activity logged successfully.');
        this.activityNotes = '';
        this.loadActivities();
        this.loadLeadDetails(); // Refresh last contacted date
        this.isSavingActivity = false;
      },
      error: (err) => {
        console.error(err);
        this.toast.showError('Error logging activity.');
        this.isSavingActivity = false;
      }
    });
  }

  runAIScoring(): void {
    this.isScoring = true;
    this.leadService.predictScoring(this.leadId).subscribe({
      next: (res: any) => {
        this.toast.showSuccess(`AI analysis complete! Score: ${res.leadScore}`);
        this.loadLeadDetails();
        this.loadActivities(); // Status or update changes log
        this.isScoring = false;
      },
      error: (err) => {
        console.error(err);
        this.toast.showError('AI scoring failed.');
        this.isScoring = false;
      }
    });
  }

  autoAssignBroker(): void {
    this.isAssigning = true;
    this.leadService.smartAssign(this.leadId).subscribe({
      next: (res: any) => {
        this.toast.showSuccess(`Assigned to ${res.brokerName}!`);
        this.loadLeadDetails();
        this.loadActivities();
        this.isAssigning = false;
      },
      error: (err) => {
        console.error(err);
        this.toast.showError('Auto-assignment failed.');
        this.isAssigning = false;
      }
    });
  }

  updateLeadStatus(newStatus: string): void {
    if (!this.lead) return;
    const updated = { ...this.lead, status: newStatus };
    this.leadService.updateLead(this.leadId, updated).subscribe({
      next: () => {
        this.toast.showSuccess(`Lead lifecycle stage changed to ${newStatus}`);
        
        // Log activity for stage changes
        const activityPayload = {
          leadId: this.leadId,
          type: 'StatusUpdate',
          notes: `Lifecycle status moved to '${newStatus}'`,
          timestamp: new Date().toISOString(),
          createdBy: 'System'
        };
        this.activityService.addActivity(activityPayload).subscribe(() => this.loadActivities());
        
        this.loadLeadDetails();
      },
      error: (err) => {
        console.error(err);
        this.toast.showError('Failed to update stage.');
      }
    });
  }
}
