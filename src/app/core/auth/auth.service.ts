import { inject, Injectable, signal } from '@angular/core';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { Observable, switchMap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { parseToken } from '../utils/token-parser';

import { UserService } from '../services/user.service';
import { CustomerService } from '../services/customer.service';

import { FirebaseSigninResponse, FirebaseSignupResponse } from './auth-response.model';
import { Customer } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  authenticatedUser = signal<FirebaseSigninResponse | null>(null);

  private APIKey = environment.firebaseConfig.apiKey;

  private httpBackend = inject(HttpBackend);
  private userService = inject(UserService);
  private customerService = inject(CustomerService);
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

  login(email: string, password: string): Observable<FirebaseSigninResponse> {
    const ignoreInterceptorHttp = new HttpClient(this.httpBackend);

    return ignoreInterceptorHttp.post<FirebaseSigninResponse>(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${this.APIKey}`,
      {
        email,
        password,
        returnSecureToken: true,
      },
    );
  }

  registerUser(newUser: Partial<Customer>) {
    const ignoreInterceptorHttp = new HttpClient(this.httpBackend);

    const password = `${newUser.firstName?.toLowerCase()}.${newUser.lastName?.toLowerCase()}`;
    const body = {
      email: newUser.email,
      password: password,
    };

    return ignoreInterceptorHttp
      .post<FirebaseSignupResponse>(
        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${this.APIKey}`,
        body,
      )
      .pipe(
        switchMap((res) => {
          const id = res.localId;

          return this.customerService.createCustomer(newUser, id);
        }),
      );
  }

  logout() {
    this.authenticatedUser.set(null);
    localStorage.removeItem('token');
    this.customerService.setIsCustomerListLoaded(false);
    this.userService.clearUser();
  }

  setAuthenticatedUser(loggedUser: FirebaseSigninResponse) {
    this.authenticatedUser.set(loggedUser);
    localStorage.setItem('token', loggedUser.idToken);
  }

  isUserAuthenticated() {
    return this.authenticatedUser() !== null;
  }
}
