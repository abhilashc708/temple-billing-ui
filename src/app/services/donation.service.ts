import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class DonationService {

  private baseUrl = 'http://localhost:8080/api/donations';

  constructor(private http: HttpClient) {}

  getDonations(page: number, size: number, sortBy: string): Observable<any> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sortBy', sortBy);

    return this.http.get<any>(this.baseUrl, { params });
  }

  createDonation(data: any): Observable<any> {
    return this.http.post(this.baseUrl, data);
  }

  updateDonation(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, data);
  }

  deleteDonation(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
searchDonations(params: any, page: number, size: number) {
  return this.http.get(`${this.baseUrl}/search`, {
    params: {
      ...params,
      page,
      size,
      sort: 'createdDate,desc'
    }
  });
}

  searchDonationsReport(searchData: any): Observable<any[]> {
    return this.http.post<any[]>(`${this.baseUrl}/report/search`, searchData);
  }

}
