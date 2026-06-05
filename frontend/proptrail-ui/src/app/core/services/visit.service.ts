import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { Visit } from '../models/visit';

@Injectable({
  providedIn: 'root'
})
export class VisitService {

  private apiUrl="/api/Visit";

  constructor(private http:HttpClient)
  {
  }

  getVisits():Observable<Visit[]>
  {
    return this.http.get<Visit[]>(this.apiUrl);
  }

  getVisit(id:number):Observable<Visit>
  {
    return this.http.get<Visit>(
      `${this.apiUrl}/${id}`
    );
  }

  addVisit(visit:Visit):Observable<Visit>
  {
    return this.http.post<Visit>(
      this.apiUrl,
      visit
    );
  }

  updateVisit(
      id:number,
      visit:Visit
  ):Observable<any>
  {
    return this.http.put(
      `${this.apiUrl}/${id}`,
      visit
    );
  }

  deleteVisit(id:number):Observable<any>
  {
    return this.http.delete(
      `${this.apiUrl}/${id}`
    );
  }

}