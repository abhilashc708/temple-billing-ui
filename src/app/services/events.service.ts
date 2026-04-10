import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EventsService {
  private baseUrl = `${environment.apiBaseUrl}/api/events`;

  constructor(private http: HttpClient) {}

  getEvents(page: number, size: number, sortBy: string) {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sortBy', sortBy);
    return this.http.get<any>(`${this.baseUrl}`, { params });
  }

  // CREATE
  createEvent(data: any): Observable<any> {
    return this.http.post(this.baseUrl, data);
  }

  // UPDATE
  updateEvent(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, data);
  }

  // DELETE
  deleteEvent(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
