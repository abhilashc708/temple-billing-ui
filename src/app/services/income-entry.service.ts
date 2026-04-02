import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class IncomeEntryService {


//   private baseUrl = 'http://localhost:8080/api/income';
 private baseUrl = `${environment.apiBaseUrl}/api/income`;

  constructor(private http: HttpClient) {}

  getAll(page: number, size: number, sortBy: string): Observable<any> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sortBy', sortBy);

    return this.http.get<any>(this.baseUrl, { params });
  }

searchIncomes(params: any, page: number, size: number) {
  return this.http.get(`${this.baseUrl}/search`, {
    params: {
      ...params,
      page,
      size,
      sort: 'createdDate,desc'
    }
  });
}

  create(data: any): Observable<any> {
    return this.http.post(this.baseUrl, data);
  }

  update(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  searchIncomeReport(searchData: any): Observable<any[]> {
    return this.http.post<any[]>(`${this.baseUrl}/report/search`, searchData);
  }

syncIncome() {
  return this.http.post(`${this.baseUrl}/sync-income`, {});
}
lastSyncDate() {
  return this.http.get<any>(`${this.baseUrl}/last-sync-date`);
}
}
