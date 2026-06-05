import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { Property } from '../../features/property/models/property';

@Injectable({
providedIn: 'root'
})

export class PropertyService {

apiUrl='/api/property';

constructor(private http:HttpClient){}

getProperties():Observable<Property[]>{
return this.http.get<Property[]>(this.apiUrl);
}

getProperty(id:number){
return this.http.get<Property>(
`${this.apiUrl}/${id}`);
}

addProperty(property:Property){
return this.http.post(
this.apiUrl,
property);
}

updateProperty(id:number,property:Property){
return this.http.put(
`${this.apiUrl}/${id}`,
property);
}

deleteProperty(id:number){
return this.http.delete(
`${this.apiUrl}/${id}`);
}

}