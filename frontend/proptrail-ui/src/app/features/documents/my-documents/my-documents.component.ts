import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DealDocumentService, DealDocument } from '../../../core/services/deal-document.service';
import { ToastService } from '../../../core/services/toast.service';
import { LoaderService } from '../../../core/services/loader.service';

@Component({
  selector: 'app-my-documents',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-documents.component.html',
  styleUrls: ['./my-documents.component.scss']
})
export class MyDocumentsComponent implements OnInit {
  documents: DealDocument[] = [];

  constructor(
    private documentService: DealDocumentService,
    private toastService: ToastService,
    private loaderService: LoaderService
  ) {}

  ngOnInit(): void {
    this.loadMyDocuments();
  }

  loadMyDocuments() {
    this.loaderService.show();
    this.documentService.getAllDocuments().subscribe({
      next: (data) => {
        this.documents = data;
        this.loaderService.hide();
      },
      error: (err) => {
        console.error(err);
        this.loaderService.hide();
        this.toastService.showError('Failed to load your transaction documents.');
      }
    });
  }

  downloadFile(doc: DealDocument) {
    if (!doc.fileUrl || !doc.id) {
      this.toastService.showWarning('Document file URL is not available.');
      return;
    }

    // Track download event
    this.documentService.trackDownload(doc.id).subscribe({
      next: () => {
        // Open file in new tab
        window.open(doc.fileUrl, '_blank');
        this.loadMyDocuments(); // reload to update download count
      },
      error: (err) => {
        // Fallback: still open it even if tracking fails
        window.open(doc.fileUrl, '_blank');
      }
    });
  }

  formatBytes(bytes?: number): string {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const dm = 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
}
