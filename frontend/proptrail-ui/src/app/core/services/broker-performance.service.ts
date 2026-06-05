import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BrokerPerformanceService {
  private apiUrl = '/api/BrokerPerformance';

  constructor(private http: HttpClient) {}

  getLeaderboard(): Observable<any> {
    return this.http.get(`${this.apiUrl}/leaderboard`);
  }

  getComparison(): Observable<any> {
    return this.http.get(`${this.apiUrl}/comparison`);
  }
}
