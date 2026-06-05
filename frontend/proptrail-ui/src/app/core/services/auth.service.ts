import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface UserSession {
  token: string;
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly SESSION_KEY = 'proptrail_user';
  private currentUserSubject = new BehaviorSubject<UserSession | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    // sessionStorage is cleared when the browser tab/window is closed,
    // so the app always starts at the login page on a fresh browser open.
    // The session persists across page refreshes within the same tab.
    const savedUser = sessionStorage.getItem(this.SESSION_KEY);
    if (savedUser) {
      try {
        this.currentUserSubject.next(JSON.parse(savedUser));
      } catch (e) {
        sessionStorage.removeItem(this.SESSION_KEY);
      }
    }
  }

  login(email: string, password: string): Observable<UserSession> {
    return this.http.post<UserSession>('/api/auth/login', { email, password }).pipe(
      tap(user => {
        sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }

  register(userData: any): Observable<any> {
    return this.http.post<any>('/api/auth/register', userData);
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post<any>('/api/auth/forgot-password', { email });
  }

  logout() {
    sessionStorage.removeItem(this.SESSION_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  getUserRole(): string | null {
    return this.currentUserSubject.value ? this.currentUserSubject.value.role : null;
  }

  getCurrentUser(): UserSession | null {
    return this.currentUserSubject.value;
  }
}
