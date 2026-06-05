import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root',
})
export class DealService {
  private apiUrl = '/api/Deal';

  constructor(
    private http: HttpClient
  ) { }

  getDeals(): Observable<any[]> {
    return this.http.get<any[]>
      (this.apiUrl);
  }


  addDeal(deal: any): Observable<any> {
    return this.http.post<any>
      (this.apiUrl, deal);
  }

  updateDeal(
    id: number,
    deal: any):
    Observable<any> {
    return this.http.put(
      `${this.apiUrl}/${id}`,
      deal
    );

  }
  deleteDeal(
    id: number):
    Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/${id}`
    );
  }

}


