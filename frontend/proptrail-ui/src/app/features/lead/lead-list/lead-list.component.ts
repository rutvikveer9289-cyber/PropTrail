import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeadService } from '../../../core/services/lead.service';
import { PropertyService } from '../../../core/services/property.service';
import { ToastService } from '../../../core/services/toast.service';
import { LoaderService } from '../../../core/services/loader.service';
import { Property } from '../../property/models/property';

import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-lead-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './lead-list.component.html',
  styleUrl: './lead-list.component.scss'
})

export class LeadListComponent implements OnInit {

  leads: any[] = [];
  filteredLeads: any[] = [];
  properties: Property[] = [];
  isEditMode = false;
  isLoading = false;
  showForm = false;

  // Phase 6 - Advanced Filters
  searchQuery = '';
  filterStatus = '';
  filterPriority = '';
  sortField = 'customerName';
  sortAsc = true;
  currentPage = 1;
  pageSize = 10;

  get totalPages(): number {
    return Math.ceil(this.filteredLeads.length / this.pageSize);
  }

  get paginatedLeads(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredLeads.slice(start, start + this.pageSize);
  }

  applyFilters(): void {
    let result = [...this.leads];
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(l =>
        l.customerName?.toLowerCase().includes(q) ||
        l.email?.toLowerCase().includes(q) ||
        l.mobile?.includes(q)
      );
    }
    if (this.filterStatus) {
      result = result.filter(l => l.status === this.filterStatus);
    }
    if (this.filterPriority) {
      result = result.filter(l => l.priorityTag === this.filterPriority);
    }
    result.sort((a, b) => {
      const valA = a[this.sortField] ?? '';
      const valB = b[this.sortField] ?? '';
      return this.sortAsc
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
    this.filteredLeads = result;
    this.currentPage = 1;
  }

  toggleSort(field: string): void {
    if (this.sortField === field) {
      this.sortAsc = !this.sortAsc;
    } else {
      this.sortField = field;
      this.sortAsc = true;
    }
    this.applyFilters();
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  selectedLeadForMatching: any = null;
  matchedProperties: Property[] = [];

  lead: any = {
    id: 0,
    customerName: '',
    mobile: '',
    email: '',
    interestedProperty: '',
    status: 'New',
    minBudget: null,
    maxBudget: null,
    preferredLocality: '',
    preferredBhk: null,
    propertyStatusPreference: '',
    priorityTag: 'Warm',
    lastContactedDate: null
  };

  constructor(
    private leadService: LeadService,
    private propertyService: PropertyService,
    private toastService: ToastService,
    private loaderService: LoaderService
  ) {}

  ngOnInit() {
    this.loadLeads();
    this.loadProperties();
  }

  loadLeads() {
    this.isLoading = true;
    this.leadService.getLeads().subscribe({
      next: (data) => {
        this.leads = data;
        this.applyFilters();
        this.isLoading = false;
        this.loaderService.hide();
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        this.loaderService.hide();
        this.toastService.showError('Failed to load buyer leads.');
      }
    });
  }

  loadProperties() {
    this.propertyService.getProperties().subscribe({
      next: (data) => {
        this.properties = data;
      },
      error: (err) => {
        console.error('Failed to load properties:', err);
      }
    });
  }

  addLead() {
    if (!this.lead.customerName || !this.lead.mobile) {
      this.toastService.showWarning('Please enter Customer Name and Mobile Number.');
      return;
    }

    const payload = {
      ...this.lead,
      lastContactedDate: this.lead.lastContactedDate && this.lead.lastContactedDate.toString().trim() !== ''
        ? new Date(this.lead.lastContactedDate).toISOString()
        : null
    };

    this.loaderService.show();
    if (this.isEditMode) {
      this.leadService.updateLead(this.lead.id, payload).subscribe({
        next: () => {
          this.loadLeads();
          this.resetForm();
          this.loaderService.hide();
          this.toastService.showSuccess('Buyer lead updated successfully.');
        },
        error: (err) => {
          console.error(err);
          this.loaderService.hide();
          this.toastService.showError('Error updating lead.');
        }
      });
    } else {
      this.leadService.addLead(payload).subscribe({
        next: () => {
          this.loadLeads();
          this.resetForm();
          this.loaderService.hide();
          this.toastService.showSuccess('New lead captured successfully!');
        },
        error: (err) => {
          console.error(err);
          this.loaderService.hide();
          this.toastService.showError('Error adding lead.');
        }
      });
    }
  }

  editLead(item: any) {
    this.lead = {
      ...item,
      minBudget: item.minBudget || null,
      maxBudget: item.maxBudget || null,
      preferredLocality: item.preferredLocality || '',
      preferredBhk: item.preferredBhk || null,
      propertyStatusPreference: item.propertyStatusPreference || '',
      priorityTag: item.priorityTag || 'Warm',
      lastContactedDate: item.lastContactedDate ? item.lastContactedDate.slice(0, 10) : null
    };
    this.isEditMode = true;
    this.showForm = true;
  }

  deleteLead(id: number) {
    if (!confirm('Are you sure you want to delete this lead?')) {
      return;
    }

    this.loaderService.show();
    this.leadService.deleteLead(id).subscribe({
      next: () => {
        this.loadLeads();
        this.loaderService.hide();
        this.toastService.showSuccess('Lead profile deleted.');
      },
      error: (err) => {
        console.error(err);
        this.loaderService.hide();
        this.toastService.showError('Error deleting lead.');
      }
    });
  }

  showPropertyMatches(lead: any) {
    this.selectedLeadForMatching = lead;

    // Filter properties based on lead preferences
    this.matchedProperties = this.properties.filter(prop => {
      // 1. BHK Check
      if (lead.preferredBhk !== null && lead.preferredBhk !== undefined &&
          prop.bhkCount !== null && prop.bhkCount !== undefined &&
          prop.bhkCount !== lead.preferredBhk) {
        return false;
      }

      // 2. Budget Check
      if (lead.minBudget && prop.price < lead.minBudget) {
        return false;
      }
      if (lead.maxBudget && prop.price > lead.maxBudget) {
        return false;
      }

      // 3. Locality Check
      if (lead.preferredLocality && prop.location) {
        const leadLoc = lead.preferredLocality.trim().toLowerCase();
        const propLoc = prop.location.trim().toLowerCase();
        if (leadLoc && !propLoc.includes(leadLoc)) {
          return false;
        }
      }

      // 4. Property Status Check (Ready / Under Construction)
      if (lead.propertyStatusPreference && prop.status) {
        const leadStatus = lead.propertyStatusPreference.trim().toLowerCase();
        const propStatus = prop.status.trim().toLowerCase();
        if (leadStatus && !propStatus.includes(leadStatus) && !leadStatus.includes(propStatus)) {
          return false;
        }
      }

      return true;
    });

    if (this.matchedProperties.length === 0) {
      this.toastService.showInfo('No property matches found for this lead\'s criteria.');
    } else {
      this.toastService.showSuccess(`Found ${this.matchedProperties.length} property suggestion(s)!`);
    }
  }

  closeMatchingModal() {
    this.selectedLeadForMatching = null;
    this.matchedProperties = [];
  }

  resetForm() {
    this.lead = {
      id: 0,
      customerName: '',
      mobile: '',
      email: '',
      interestedProperty: '',
      status: 'New',
      minBudget: null,
      maxBudget: null,
      preferredLocality: '',
      preferredBhk: null,
      propertyStatusPreference: '',
      priorityTag: 'Warm',
      lastContactedDate: null
    };
    this.isEditMode = false;
  }
}