import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DealService } from '../../../core/services/deal.service';
import { BrokerService } from '../../../core/services/broker.service';
import { LeadService } from '../../../core/services/lead.service';
import { PropertyService } from '../../../core/services/property.service';
import { DealDocumentService, DealDocument } from '../../../core/services/deal-document.service';
import { ToastService } from '../../../core/services/toast.service';
import { LoaderService } from '../../../core/services/loader.service';

@Component({
  selector: 'app-deal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './deal.component.html',
  styleUrls: ['./deal.component.scss']
})

export class DealComponent implements OnInit {

  deals: any[] = [];
  brokers: any[] = [];
  leads: any[] = [];
  properties: any[] = [];

  editing = false;
  showForm = false;

  // Kanban view additions
  viewMode: 'table' | 'kanban' = 'kanban';
  draggedDeal: any = null;

  // Phase 6 - Advanced Filters
  searchQuery = '';
  filterStatus = '';
  filterStage = '';
  filterMinAmount: number | null = null;
  filterMaxAmount: number | null = null;
  filteredDeals: any[] = [];
  selectedDeal: any = null;
  dealDocuments: DealDocument[] = [];

  getDealsByStage(stage: string): any[] {
    return this.filteredDeals.filter(d => d.stage === stage);
  }

  onDragStart(event: DragEvent, deal: any): void {
    this.draggedDeal = deal;
    event.dataTransfer?.setData('text/plain', deal.dealId.toString());
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(event: DragEvent, targetStage: string): void {
    event.preventDefault();
    if (!this.draggedDeal) return;

    if (this.draggedDeal.stage !== targetStage) {
      const dealData = {
        ...this.draggedDeal,
        stage: targetStage
      };

      this.loaderService.show();
      this.dealService.updateDeal(this.draggedDeal.dealId, dealData).subscribe({
        next: () => {
          this.loadDeals();
          this.loaderService.hide();
          this.toastService.showSuccess(`Deal moved to stage: ${targetStage}`);
          this.draggedDeal = null;
        },
        error: (err) => {
          console.error(err);
          this.loaderService.hide();
          this.toastService.showError('Failed to move deal stage.');
          this.draggedDeal = null;
        }
      });
    } else {
      this.draggedDeal = null;
    }
  }
  
  newDocumentName = '';
  newDocumentStage = 'Inquiry';

  stages: string[] = [
    'Inquiry',
    'Site Visit',
    'Negotiation',
    'Token Money',
    'Agreement',
    'Registration',
    'Commission Received'
  ];

  deal: any = {
    dealId: 0,
    brokerId: 0,
    leadId: 0,
    propertyId: 0,
    dealAmount: 0,
    dealDate: '',
    status: 'Open',
    stage: 'Inquiry'
  };

  constructor(
    private dealService: DealService,
    private brokerService: BrokerService,
    private leadService: LeadService,
    private propertyService: PropertyService,
    private dealDocumentService: DealDocumentService,
    private toastService: ToastService,
    private loaderService: LoaderService
  ) { }

  ngOnInit() {
    this.loadDeals();
    this.loadBrokers();
    this.loadLeads();
    this.loadProperties();
  }

  loadDeals() {
    this.loaderService.show();
    this.dealService.getDeals().subscribe({
      next: (data) => {
        this.deals = data;
        this.filterDeals();
        // Refresh selected deal details if loaded
        if (this.selectedDeal) {
          const updated = this.deals.find(d => d.dealId === this.selectedDeal.dealId);
          if (updated) {
            this.selectedDeal = updated;
          }
        }
        this.loaderService.hide();
      },
      error: (err) => {
        console.error(err);
        this.loaderService.hide();
        this.toastService.showError('Failed to load active deals list.');
      }
    });
  }

  filterDeals() {
    let result = [...this.deals];

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(d => {
        const lead = this.getLeadName(d.leadId).toString().toLowerCase();
        const prop = this.getPropertyName(d.propertyId).toString().toLowerCase();
        const broker = this.getBrokerName(d.brokerId).toString().toLowerCase();
        return lead.includes(q) || prop.includes(q) || broker.includes(q);
      });
    }

    if (this.filterStatus) {
      result = result.filter(d => d.status === this.filterStatus);
    }

    if (this.filterStage) {
      result = result.filter(d => d.stage === this.filterStage);
    }

    if (this.filterMinAmount !== null && this.filterMinAmount !== undefined && String(this.filterMinAmount) !== '') {
      result = result.filter(d => d.dealAmount >= Number(this.filterMinAmount));
    }

    if (this.filterMaxAmount !== null && this.filterMaxAmount !== undefined && String(this.filterMaxAmount) !== '') {
      result = result.filter(d => d.dealAmount <= Number(this.filterMaxAmount));
    }

    this.filteredDeals = result;
  }

  clearFilters() {
    this.searchQuery = '';
    this.filterStatus = '';
    this.filterStage = '';
    this.filterMinAmount = null;
    this.filterMaxAmount = null;
    this.filterDeals();
  }

  loadBrokers() {
    this.brokerService.getBrokers().subscribe({
      next: (data) => {
        this.brokers = data;
      },
      error: (err) => console.error(err)
    });
  }

  loadLeads() {
    this.leadService.getLeads().subscribe({
      next: (data) => {
        this.leads = data;
      },
      error: (err) => console.error(err)
    });
  }

  loadProperties() {
    this.propertyService.getProperties().subscribe({
      next: (data) => {
        this.properties = data;
      },
      error: (err) => console.error(err)
    });
  }

  getBrokerName(id: number) {
    const broker = this.brokers.find(b => b.id === id);
    return broker ? `${broker.firstName} ${broker.lastName}` : id;
  }

  getLeadName(id: number) {
    const lead = this.leads.find(l => l.id === id);
    return lead ? lead.customerName : id;
  }

  getPropertyName(id: number) {
    const property = this.properties.find(p => p.id === id);
    return property ? property.propertyName : id;
  }

  selectDeal(d: any) {
    this.selectedDeal = d;
    this.loadDealDocuments(d.dealId);
  }

  loadDealDocuments(dealId: number) {
    this.dealDocumentService.getDocumentsForDeal(dealId).subscribe({
      next: (docs) => {
        this.dealDocuments = docs;
      },
      error: (err) => {
        console.error('Failed to load documents:', err);
      }
    });
  }

  changeStage(newStage: string) {
    if (!this.selectedDeal) return;

    const dealData = {
      ...this.selectedDeal,
      stage: newStage
    };

    this.loaderService.show();
    this.dealService.updateDeal(this.selectedDeal.dealId, dealData).subscribe({
      next: () => {
        this.loadDeals();
        this.loaderService.hide();
        this.toastService.showSuccess(`Deal stage updated to: ${newStage}`);
      },
      error: (err) => {
        console.error(err);
        this.loaderService.hide();
        this.toastService.showError('Failed to update deal stage.');
      }
    });
  }

  addChecklistItem() {
    if (!this.selectedDeal || !this.newDocumentName.trim()) return;

    const newDoc: DealDocument = {
      dealId: this.selectedDeal.dealId,
      documentName: this.newDocumentName.trim(),
      stage: this.newDocumentStage,
      status: 'Pending'
    };

    this.loaderService.show();
    this.dealDocumentService.addDocument(newDoc).subscribe({
      next: () => {
        this.loadDealDocuments(this.selectedDeal.dealId);
        this.newDocumentName = '';
        this.loaderService.hide();
        this.toastService.showSuccess('Checklist requirement added.');
      },
      error: (err) => {
        console.error('Failed to add document checklist:', err);
        this.loaderService.hide();
        this.toastService.showError('Failed to add required document.');
      }
    });
  }

  updateDocStatus(doc: DealDocument, newStatus: string) {
    const updated = {
      ...doc,
      status: newStatus
    };

    this.dealDocumentService.updateDocument(doc.id!, updated).subscribe({
      next: () => {
        this.loadDealDocuments(this.selectedDeal.dealId);
        this.toastService.showSuccess(`Document updated to: ${newStatus}`);
      },
      error: (err) => {
        console.error('Failed to update document status:', err);
        this.toastService.showError('Error updating document status.');
      }
    });
  }

  deleteChecklistItem(id: number) {
    if (!confirm('Are you sure you want to remove this required document from the checklist?')) return;

    this.loaderService.show();
    this.dealDocumentService.deleteDocument(id).subscribe({
      next: () => {
        this.loadDealDocuments(this.selectedDeal.dealId);
        this.loaderService.hide();
        this.toastService.showSuccess('Document requirement removed.');
      },
      error: (err) => {
        console.error('Failed to delete document checklist:', err);
        this.loaderService.hide();
        this.toastService.showError('Error removing document checklist item.');
      }
    });
  }

  saveDeal() {
    const dealData = {
      ...this.deal,
      dealDate: this.deal.dealDate && this.deal.dealDate.trim() !== ''
        ? new Date(this.deal.dealDate).toISOString()
        : null
    };

    this.loaderService.show();
    if (this.editing) {
      this.dealService.updateDeal(this.deal.dealId, dealData).subscribe({
        next: () => {
          this.loadDeals();
          this.loaderService.hide();
          this.toastService.showSuccess('Deal updated successfully.');
          this.resetForm();
        },
        error: (err) => {
          console.log(err);
          this.loaderService.hide();
          this.toastService.showError('Update deal details failed.');
        }
      });
    } else {
      this.dealService.addDeal(dealData).subscribe({
        next: () => {
          this.loadDeals();
          this.loaderService.hide();
          this.toastService.showSuccess('New Deal Pipeline created!');
          this.resetForm();
        },
        error: (err) => {
          console.log(err);
          this.loaderService.hide();
          this.toastService.showError('Creation of deal failed.');
        }
      });
    }
  }

  editDeal(d: any) {
    this.deal = { 
      ...d,
      dealDate: d.dealDate ? d.dealDate.slice(0, 10) : ''
    };
    this.editing = true;
    this.showForm = true;
  }

  deleteDeal(id: number) {
    if (!confirm('Are you sure you want to delete this Deal entry?')) {
      return;
    }

    this.loaderService.show();
    this.dealService.deleteDeal(id).subscribe({
      next: () => {
        this.loadDeals();
        if (this.selectedDeal && this.selectedDeal.dealId === id) {
          this.selectedDeal = null;
          this.dealDocuments = [];
        }
        this.loaderService.hide();
        this.toastService.showSuccess('Deal record deleted.');
      },
      error: (err) => {
        console.error(err);
        this.loaderService.hide();
        this.toastService.showError('Error deleting deal.');
      }
    });
  }

  resetForm() {
    this.deal = {
      dealId: 0,
      brokerId: 0,
      leadId: 0,
      propertyId: 0,
      dealAmount: 0,
      dealDate: '',
      status: 'Open',
      stage: 'Inquiry'
    };
    this.editing = false;
    this.showForm = false;
  }

}