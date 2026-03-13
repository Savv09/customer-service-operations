import { inject, Injectable, signal } from '@angular/core';
import { HttpBackend, HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';
import { parseToken } from '../utils/token-parser';

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
  private userService = inject(UserService);
  private router = inject(Router);

  autoLogin() {
    const token = localStorage.getItem('token');

    if (!token) return;

    const decodedAuthUser = parseToken(token);

    const authResponse = {
      idToken: token,
      email: decodedAuthUser.email,
      localId: decodedAuthUser.user_id,
      refreshToken: '',
      expiresIn: decodedAuthUser.exp,
    };

    this.authenticatedUser.set(authResponse);
    this.userService.getUser(decodedAuthUser.user_id);
    this.router.navigate(['/', 'dashboard']);
  }

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
    this.userService.clearUser();
  }

  setAuthenticatedUser(loggedUser: AuthResponse) {
    this.authenticatedUser.set(loggedUser);
    localStorage.setItem('token', loggedUser.idToken);
  }

  isUserAuthenticated() {
    return this.authenticatedUser() !== null;
  }
}
