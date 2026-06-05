import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LeadService {

  apiUrl = '/api/Lead';

  constructor(private http: HttpClient) { }

  getLeads(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getLead(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  addLead(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  updateLead(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteLead(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  predictScoring(leadId: number): Observable<any> {
    return this.http.post(`/api/ai/predict-scoring/${leadId}`, {});
  }

  smartAssign(leadId: number): Observable<any> {
    return this.http.post(`/api/ai/smart-assign/${leadId}`, {});
  }
}
