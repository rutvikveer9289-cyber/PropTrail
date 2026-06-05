import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BrokerService {

  apiUrl = '/api/Broker';

  constructor(private http: HttpClient) {}

  getBrokers() {
    return this.http.get<any[]>(this.apiUrl);
  }

  addBroker(data: any) {
    return this.http.post(this.apiUrl, data);
  }

  updateBroker(id: number, data: any) {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteBroker(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}