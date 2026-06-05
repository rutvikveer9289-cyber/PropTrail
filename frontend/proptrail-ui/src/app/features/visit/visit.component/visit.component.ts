import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { VisitService } from '../../../core/services/visit.service';
import { Visit } from '../../../core/models/visit';
import { BrokerService } from '../../../core/services/broker.service';
import { PropertyService } from '../../../core/services/property.service';
import { LeadService } from '../../../core/services/lead.service';
import { ToastService } from '../../../core/services/toast.service';
import { LoaderService } from '../../../core/services/loader.service';

@Component({
  selector: 'app-visit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './visit.component.html',
  styleUrls: ['./visit.component.scss']
})

export class VisitComponent implements OnInit {

  visits: Visit[] = [];
  filteredVisits: Visit[] = [];
  confirmationMessage = '';
  selectedLeadMobile = '';

  // Phase 6 - Advanced Filters
  searchQuery = '';
  filterStatus = '';
  filterOutcome = '';
  filterRating: number | null = null;

  get scheduledCount(): number {
    return this.visits.filter(v => (v.status || 'Scheduled') === 'Scheduled').length;
  }

  get completedCount(): number {
    return this.visits.filter(v => v.status === 'Completed').length;
  }

  brokers: any[] = [];
  leads: any[] = [];
  properties: any[] = [];

  editing = false;
  showForm = false;


  visit: Visit = {
    brokerId: 0,
    leadId: 0,
    propertyId: 0,
    visitDate: new Date().toISOString().slice(0, 16),
    status: 'Scheduled',
    notes: '',
    clientFeedback: '',
    clientRating: 5,
    feedbackStatus: 'Pending'
  };

  constructor(
    private visitService: VisitService,
    private brokerService: BrokerService,
    private leadService: LeadService,
    private propertyService: PropertyService,
    private toastService: ToastService,
    private loaderService: LoaderService
  ) { }

  ngOnInit() {
    this.loadVisits();
    this.loadBrokers();
    this.loadLeads();
    this.loadProperties();
  }

  loadVisits() {
    this.loaderService.show();
    this.visitService.getVisits().subscribe({
      next: (data) => {
        this.visits = data;
        this.filterVisits();
        this.loaderService.hide();
      },
      error: (err) => {
        console.error(err);
        this.loaderService.hide();
        this.toastService.showError('Failed to load site visits list.');
      }
    });
  }

  filterVisits() {
    let result = [...this.visits];

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(v => {
        const broker = this.getBrokerName(v.brokerId).toString().toLowerCase();
        const lead = this.getLeadName(v.leadId).toString().toLowerCase();
        const prop = this.getPropertyName(v.propertyId).toString().toLowerCase();
        return broker.includes(q) || lead.includes(q) || prop.includes(q);
      });
    }

    if (this.filterStatus) {
      result = result.filter(v => v.status === this.filterStatus);
    }

    if (this.filterOutcome) {
      result = result.filter(v => v.feedbackStatus === this.filterOutcome);
    }

    if (this.filterRating !== null && this.filterRating !== undefined && String(this.filterRating) !== '') {
      result = result.filter(v => v.clientRating === Number(this.filterRating));
    }

    this.filteredVisits = result;
  }

  clearFilters() {
    this.searchQuery = '';
    this.filterStatus = '';
    this.filterOutcome = '';
    this.filterRating = null;
    this.filterVisits();
  }

  loadBrokers() {
    this.brokerService.getBrokers().subscribe({
      next: (data) => {
        this.brokers = (data as any[]).map(b => ({
          ...b,
          brokerId: b.brokerId ?? b.id
        }));
      },
      error: (err) => console.error(err)
    });
  }

  loadLeads() {
    this.leadService.getLeads().subscribe({
      next: (data) => {
        this.leads = (data as any[]).map(l => ({
          ...l,
          leadId: l.leadId ?? l.id
        }));
      },
      error: (err) => console.error(err)
    });
  }

  loadProperties() {
    this.propertyService.getProperties().subscribe({
      next: (data) => {
        this.properties = (data as any[]).map(p => ({
          ...p,
          propertyId: p.propertyId ?? p.id
        }));
      },
      error: (err) => console.error(err)
    });
  }

  saveVisit() {
    if (!this.visit.visitDate) {
      this.toastService.showWarning('Please select a visit date/time.');
      return;
    }

    if (!this.visit.brokerId || this.visit.brokerId <= 0 ||
        !this.visit.leadId || this.visit.leadId <= 0 ||
        !this.visit.propertyId || this.visit.propertyId <= 0) {
      this.toastService.showWarning('Please select Broker, Lead, and Property.');
      return;
    }

    const payload = {
      brokerId: this.visit.brokerId,
      leadId: this.visit.leadId,
      propertyId: this.visit.propertyId,
      visitDate: this.visit.visitDate,
      status: this.visit.status,
      notes: this.visit.notes,
      clientFeedback: this.visit.clientFeedback || '',
      clientRating: this.visit.clientRating || 5,
      feedbackStatus: this.visit.feedbackStatus || 'Pending'
    };

    this.loaderService.show();
    if (this.editing) {
      this.visitService.updateVisit(this.visit.visitId!, payload as Visit).subscribe({
        next: () => {
          this.generateConfirmationMessage();
          this.loadVisits();
          this.resetForm();
          this.loaderService.hide();
          this.toastService.showSuccess('Visit schedule & feedback updated.');
        },
        error: (err) => {
          console.error(err);
          this.loaderService.hide();
          this.toastService.showError('Error updating site visit.');
        }
      });
    } else {
      this.visitService.addVisit(payload as Visit).subscribe({
        next: () => {
          this.generateConfirmationMessage();
          this.loadVisits();
          this.resetForm();
          this.loaderService.hide();
          this.toastService.showSuccess('Site visit scheduled successfully!');
        },
        error: (err) => {
          console.error(err);
          this.loaderService.hide();
          this.toastService.showError('Error scheduling site visit.');
        }
      });
    }
  }

  editVisit(v: Visit) {
    this.visit = {
      ...v,
      clientFeedback: v.clientFeedback || '',
      clientRating: v.clientRating || 5,
      feedbackStatus: v.feedbackStatus || 'Pending'
    };
    this.editing = true;
    this.showForm = true;
  }

  deleteVisit(id: number) {
    if (!confirm('Are you sure you want to delete this site visit schedule?')) {
      return;
    }

    this.loaderService.show();
    this.visitService.deleteVisit(id).subscribe({
      next: () => {
        this.loadVisits();
        this.loaderService.hide();
        this.toastService.showSuccess('Site visit schedule removed.');
      },
      error: (err) => {
        console.error(err);
        this.loaderService.hide();
        this.toastService.showError('Error deleting site visit.');
      }
    });
  }

  getBrokerName(id: number) {
    const broker = this.brokers.find(b => b.brokerId === id);
    return broker ? `${broker.firstName} ${broker.lastName}` : id;
  }

  getLeadName(id: number) {
    const lead = this.leads.find(l => l.leadId === id);
    return lead ? lead.customerName : id;
  }

  getPropertyName(id: number) {
    const property = this.properties.find(p => p.propertyId === id);
    return property ? property.propertyName : id;
  }

  getLeadMobile(id: number) {
    const lead = this.leads.find(l => l.leadId === id);
    return lead?.mobile ?? '';
  }

  onLeadChange() {
    this.selectedLeadMobile = this.getLeadMobile(this.visit.leadId);
    if (this.confirmationMessage) {
      this.generateConfirmationMessage();
    }
  }

  generateConfirmationMessage() {
    this.selectedLeadMobile = this.getLeadMobile(this.visit.leadId);
    if (!this.selectedLeadMobile) {
      this.toastService.showWarning('Lead mobile number unavailable. Select a lead with a mobile number.');
      this.confirmationMessage = '';
      return;
    }

    const brokerName = this.getBrokerName(this.visit.brokerId);
    const leadName = this.getLeadName(this.visit.leadId);
    const propertyName = this.getPropertyName(this.visit.propertyId);
    const visitDate = this.visit.visitDate
      ? new Date(this.visit.visitDate).toLocaleString()
      : '';

    this.confirmationMessage =
      `Hi ${leadName},\n` +
      `Your visit with ${brokerName} for ${propertyName} is scheduled on ${visitDate}.\n` +
      `Status: ${this.visit.status || 'Pending'}\n` +
      `Notes: ${this.visit.notes || 'None'}\n` +
      `Thank you.`;

    this.toastService.showInfo('WhatsApp visit notification message generated!');
  }

  copyMessage() {
    navigator.clipboard.writeText(this.confirmationMessage);
    this.toastService.showSuccess('Message copied to clipboard.');
  }

  sendWhatsApp() {
    if (!this.selectedLeadMobile) return;
    window.open(
      `https://wa.me/91${this.selectedLeadMobile}?text=${encodeURIComponent(this.confirmationMessage)}`,
      '_blank'
    );
  }

  resetForm() {
    this.visit = {
      brokerId: 0,
      leadId: 0,
      propertyId: 0,
      visitDate: new Date().toISOString().slice(0, 16),
      status: 'Scheduled',
      notes: '',
      clientFeedback: '',
      clientRating: 5,
      feedbackStatus: 'Pending'
    };
    this.editing = false;
    this.confirmationMessage = '';
    this.showForm = false;
  }

  toggleForm() {
    if (this.showForm && !this.editing) {
      this.showForm = false;
    } else {
      this.resetForm();
      this.showForm = true;
    }
  }
}