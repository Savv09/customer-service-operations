import { inject, Injectable, signal } from '@angular/core';
import { HttpBackend, HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface AuthResponse {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  authenticatedUser = signal<AuthResponse | null>(null);

  private APIKey = environment.firebaseConfig.apiKey;

  private httpBackend = inject(HttpBackend);

  login(email: string, password: string): Observable<AuthResponse> {
    const ignoreInterceptorHttp = new HttpClient(this.httpBackend);

    return ignoreInterceptorHttp.post<AuthResponse>(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${this.APIKey}`,
      {
        email,
        password,
        returnSecureToken: true,
      },
    );
  }

  logout() {
    this.authenticatedUser.set(null);
    localStorage.removeItem('token');
  }

  setAuthenticatedUser(loggedUser: AuthResponse) {
    this.authenticatedUser.set(loggedUser);
    localStorage.setItem('token', loggedUser.idToken);
  }

  isUserAuthenticated() {
    return this.authenticatedUser() !== null;
  }
}
