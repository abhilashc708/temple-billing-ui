import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class LayoutService {
//    private baseUrl = 'http://localhost:8080/api/dashboard';
 private baseUrl = `${environment.apiBaseUrl}/api/dashboard`;

    constructor(private http: HttpClient) {}

getDashboardSummary(){
  return this.http.get<any>(`${this.baseUrl}/today`);
}
}
