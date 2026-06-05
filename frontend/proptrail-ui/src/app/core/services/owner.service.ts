import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Owner } from '../models/owner';

@Injectable({
  providedIn: 'root',
})
export class OwnerService {
  apiUrl = '/api/Owners';

  constructor(private http: HttpClient) {}

  getOwners(): Observable<Owner[]> {
    return this.http.get<Owner[]>(this.apiUrl);
  }

  getOwner(id: number): Observable<Owner> {
    return this.http.get<Owner>(`${this.apiUrl}/${id}`);
  }

  addOwner(data: Owner): Observable<Owner> {
    return this.http.post<Owner>(this.apiUrl, data);
  }

  updateOwner(id: number, data: Owner): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteOwner(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
