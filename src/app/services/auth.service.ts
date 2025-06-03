import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiBaseUrl;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  login(email: string, password: string): Observable<{ accessToken: string }> {
    return this.http.post<{ accessToken: string }>(`${this.apiUrl}api/auth/login`, { email, password })
      .pipe(
        tap(response => {
          if (isPlatformBrowser(this.platformId) && response?.accessToken) {
            localStorage.setItem('token', response.accessToken);
          }
        })
      );
  }

  register(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}api/auth/register`, { email, password });
  }

  getUsers(params: any): Observable<any> {
    const queryParams = {
      search: params.search || '',
      page: params.page || '1',
      pageSize: params.pageSize || '10',
      sort: params.sort || 'asc'
    };

    return this.http.get(`${this.apiUrl}api/auth/users`, { params: queryParams });
  }
}