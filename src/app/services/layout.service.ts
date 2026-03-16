import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class LayoutService {
   private baseUrl = 'http://localhost:8080/api/dashboard';

    constructor(private http: HttpClient) {}

getDashboardSummary(){
  return this.http.get<any>(`${this.baseUrl}/today`);
}
}
