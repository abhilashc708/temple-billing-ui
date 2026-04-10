import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private router = inject(Router);
  private apiUrl = `${environment.apiBaseUrl}/api/auth/login`;
  private http = inject(HttpClient);

  login(username: string, password: string): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(this.apiUrl, {
      username,
      password,
    });
  }

  storeToken(token: string, username: string) {
    localStorage.setItem('jwtToken', token);

    const payload = JSON.parse(atob(token.split('.')[1]));
    localStorage.setItem('role', payload.role);
    localStorage.setItem('name', payload.name);
    // store username
    localStorage.setItem('username', username);

    // store first letter for avatar
    localStorage.setItem('avatar', payload.name.charAt(0).toUpperCase());
  }

  getUserRole() {
    return localStorage.getItem('role');
  }

  getToken(): string | null {
    return localStorage.getItem('jwtToken');
  }
  logout() {
    localStorage.removeItem('jwtToken'); // Remove the token
  }

  constructor() {}
}
