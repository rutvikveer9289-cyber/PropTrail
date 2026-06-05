import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DealDocumentService, DealDocument } from '../../core/services/deal-document.service';
import { DealService } from '../../core/services/deal.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-documents-hub',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './documents-hub.component.html',
  styleUrl: './documents-hub.component.scss'
})
export class DocumentsHubComponent implements OnInit {
  documents: DealDocument[] = [];
  filteredDocuments: DealDocument[] = [];
  deals: any[] = [];
  isLoading = true;

  selectedDealId: number = 0;
  selectedCategory = 'KYC';
  isUploading = false;

  filterCategory = '';
  filterStatus = '';
  searchQuery = '';

  constructor(
    private docService: DealDocumentService,
    private dealService: DealService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadDocuments();
    this.loadDeals();
  }

  loadDocuments(): void {
    this.isLoading = true;
    this.docService.getAllDocuments().subscribe({
      next: (docs: DealDocument[]) => {
        this.documents = docs;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.toast.showError('Failed to load transaction documents.');
        this.isLoading = false;
      }
    });
  }

  loadDeals(): void {
    this.dealService.getDeals().subscribe({
      next: (deals: any[]) => {
        this.deals = deals;
      },
      error: (err: any) => console.error(err)
    });
  }

  applyFilters(): void {
    let result = [...this.documents];

    if (this.filterCategory) {
      result = result.filter(d => d.category === this.filterCategory);
    }

    if (this.filterStatus) {
      result = result.filter(d => d.status === this.filterStatus);
    }

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(d => d.documentName?.toLowerCase().includes(q));
    }

    this.filteredDocuments = result;
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (!file) return;

    if (this.selectedDealId === 0) {
      this.toast.showWarning('Please associate the document with a Deal Pipeline ID.');
      return;
    }

    this.isUploading = true;
    this.docService.uploadFile(file).subscribe({
      next: (res: any) => {
        const payload: DealDocument = {
          dealId: this.selectedDealId,
          documentName: file.name,
          stage: 'Inquiry',
          status: 'Collected',
          fileUrl: res.fileUrl,
          fileSize: res.fileSize,
          category: this.selectedCategory
        };

        this.docService.addDocument(payload).subscribe({
          next: () => {
            this.toast.showSuccess('Document uploaded and registered successfully!');
            this.loadDocuments();
            this.isUploading = false;
          },
          error: (err: any) => {
            console.error(err);
            this.toast.showError('Metadata registration failed.');
            this.isUploading = false;
          }
        });
      },
      error: (err: any) => {
        console.error(err);
        this.toast.showError('File upload failed.');
        this.isUploading = false;
      }
    });
  }

  downloadFile(doc: DealDocument): void {
    if (!doc.fileUrl) {
      this.toast.showWarning('No file URL associated with this document.');
      return;
    }

    this.docService.trackDownload(doc.id!).subscribe({
      next: () => {
        doc.downloadCount = (doc.downloadCount || 0) + 1;
        window.open(doc.fileUrl, '_blank');
      },
      error: (err: any) => console.error(err)
    });
  }

  verifyDocument(doc: DealDocument): void {
    const updated = { ...doc, status: 'Verified' };
    this.docService.updateDocument(doc.id!, updated).subscribe({
      next: () => {
        this.toast.showSuccess('Document marked as Verified.');
        this.loadDocuments();
      },
      error: (err: any) => {
        console.error(err);
        this.toast.showError('Verification failed.');
      }
    });
  }

  formatBytes(bytes: number): string {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getDealClientName(dealId: number): string {
    const deal = this.deals.find(d => d.dealId === dealId);
    if (!deal) return `Deal #${dealId}`;
    return deal.lead ? deal.lead.customerName : `Client (Deal #${dealId})`;
  }

  getVerifiedCount(): number {
    return this.documents.filter(d => d.status === 'Verified').length;
  }

  getTotalDownloads(): number {
    return this.documents.reduce((acc, d) => acc + (d.downloadCount || 0), 0);
  }
}
