import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Dashboard {
  totalBrokers: number;
  totalLeads: number;
  totalProperties: number;
  totalVisits: number;
  totalDeals: number;
  totalRevenue: number;
  wonDeals: number;
  openDeals: number;
  lostDeals: number;
  recentLeads: string[];
  recentVisits: string[];
  recentDeals: string[];
  monthlyRevenue: number[];
  leadStatusData: number[];
  activeLeads: number;
  scheduledVisits: number;
  monthlyVisits: number[];
}

export interface FollowUpReminder {
  id: number;
  customerName: string;
  mobile: string;
  status: string;
  priorityTag: string;
  followUpDate: string;
  followUpNotes: string;
  brokerName: string;
  daysOverdue: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private apiUrl = '/api/dashboard';

  constructor(private http: HttpClient) { }

  getDashboard(): Observable<Dashboard> {
    return this.http.get<Dashboard>(this.apiUrl);
  }

  getFilteredSummary(filter: string): Observable<Dashboard> {
    return this.http.post<Dashboard>(
      `${this.apiUrl}/filtered-summary`,
      { filter: filter }
    );
  }

  getFollowUpReminders(): Observable<FollowUpReminder[]> {
    return this.http.get<FollowUpReminder[]>(`${this.apiUrl}/followup-reminders`);
  }
}