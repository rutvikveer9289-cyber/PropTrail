import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface DealDocument {
  id?: number;
  dealId: number;
  documentName: string;
  stage: string;
  status: string; // e.g. 'Pending', 'Collected', 'Verified'
  fileUrl?: string;
  fileSize?: number;
  uploadedDate?: string;
  downloadCount?: number;
  category?: string;
}

@Injectable({
  providedIn: 'root',
})
export class DealDocumentService {
  apiUrl = '/api/DealDocument';

  constructor(private http: HttpClient) {}

  getAllDocuments(): Observable<DealDocument[]> {
    return this.http.get<DealDocument[]>(this.apiUrl);
  }

  getDocumentsForDeal(dealId: number): Observable<DealDocument[]> {
    return this.http.get<DealDocument[]>(`${this.apiUrl}/deal/${dealId}`);
  }

  addDocument(document: DealDocument): Observable<DealDocument> {
    return this.http.post<DealDocument>(this.apiUrl, document);
  }

  updateDocument(id: number, document: DealDocument): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, document);
  }

  deleteDocument(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  uploadFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/upload`, formData);
  }

  trackDownload(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/download`, {});
  }
}
