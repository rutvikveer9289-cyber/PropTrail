import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LeadActivityService {
  private apiUrl = '/api/LeadActivity';

  constructor(private http: HttpClient) {}

  getActivitiesForLead(leadId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/lead/${leadId}`);
  }

  addActivity(activity: any): Observable<any> {
    return this.http.post(this.apiUrl, activity);
  }
}
