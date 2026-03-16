import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
private baseUrl = 'http://localhost:8080/api/users';

//  private api = environment.apiBaseUrl + '/api/users';

  constructor(private http: HttpClient) {}

  getUsers(page:number,size:number){
    return this.http.get(`${this.baseUrl}?page=${page}&size=${size}`);
  }

  createUser(data:any){
    return this.http.post(this.baseUrl,data);
  }

  updateUser(id:number,data:any){
    return this.http.put(`${this.baseUrl}/${id}`,data);
  }

  deleteUser(id:number){
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

getMyProfile(){
  return this.http.get<any>(`${this.baseUrl}/me`);
}
updateMyProfile(data:any){
  return this.http.put(`${this.baseUrl}/me`, data);
}

changePassword(data:any){
  return this.http.post(`${this.baseUrl}/change-password`,data);
}

}
