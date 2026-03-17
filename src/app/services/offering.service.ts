import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OfferingService {

//   private baseUrl = 'http://localhost:8080/api/offerings';
private baseUrl = `${environment.apiBaseUrl}/api/offerings`;

  constructor(private http: HttpClient) {}

  getOfferingsByStatus(): Observable<any[]> {
    return this.http
      .get<any>(`${this.baseUrl}/getAllByStatus?page=0&size=100&sortBy=createdDate`)
      .pipe(
        map(response => response.content.filter((o: any) => o.status === 'ACTIVE'))
      );
  }

 getOfferings(page: number, size: number, sortBy: string, search?: string) {

    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sortBy', sortBy);

    if (search) {
      params = params.set('search', search);
    }
    return this.http.get<any>(`${this.baseUrl}`, { params });
  }

searchOffering(params: any, page: number, size: number) {
  return this.http.get(`${this.baseUrl}/search`, {
    params: {
      ...params,
      page,
      size,
      sort: 'createdDate,desc'
    }
  });
}

createOffering(data: any) {
  return this.http.post(`${this.baseUrl}`, data);
}


  // UPDATE
  updateOffering(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, data);
  }

  // DELETE (optional)
  deleteOffering(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

}



