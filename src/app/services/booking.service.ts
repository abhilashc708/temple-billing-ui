import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  //private baseUrl = 'http://localhost:8080/api/bookings';
  private baseUrl = `${environment.apiBaseUrl}/api/bookings`;

  constructor(private http: HttpClient) {}

  getReceipts(page: number, size: number, sortBy: string): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/receipts?page=${page}&size=${size}&sortBy=${sortBy}`
    );
  }

  saveBatchReceipt(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/batch`, payload);
  }

// Update single booking
  updateBooking(id: number, payload: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/receipts/${id}`, payload);
  }

searchReceipts(params: any, page: number, size: number) {
  return this.http.get(`${this.baseUrl}/receipts/search`, {
    params: {
      ...params,
      page,
      size,
      sort: 'createdDate,desc'
    }
  });
}
downloadReceipt(receiptId: number) {
  return this.http.get(`${this.baseUrl}/receipts/${receiptId}/download`,
    { responseType: 'blob' }   // IMPORTANT
  );
}

  searchBookings(searchData: any): Observable<any[]> {
    return this.http.post<any[]>(`${this.baseUrl}/receipts/report/search`, searchData);
  }
}
