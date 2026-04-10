import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FinanceManagerService {
  private baseUrl = `${environment.apiBaseUrl}/api/finance-master`;

  constructor(private http: HttpClient) {}

  getAll(page: number, size: number, sortBy: string): Observable<any> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sortBy', sortBy);

    return this.http.get<any>(this.baseUrl, { params });
  }

  getAllByType(
    type: string,
    page: number,
    size: number,
    sortBy: string
  ): Observable<any> {
    return this.http.get(
      `${this.baseUrl}?type=${type}&page=${page}&size=${size}&sortBy=${sortBy}`
    );
  }

  searchFinance(params: any, page: number, size: number) {
    return this.http.get(`${this.baseUrl}/search`, {
      params: {
        ...params,
        page,
        size,
        sort: 'createdDate,desc',
      },
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
}
