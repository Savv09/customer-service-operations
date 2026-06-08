import { inject, Injectable, signal } from '@angular/core';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { Observable, switchMap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { parseToken } from '../utils/token-parser';

import { UserService } from '../services/user.service';
import { CustomerService } from '../services/customer.service';

import { FirebaseSigninResponse, FirebaseSignupResponse } from './auth-response.model';
import { Customer, Manager } from '../models/user.model';
import { UserRole } from '../../shared/enums/user-roles.enum';
import { ManagerService } from '../services/manager.service';
import { TicketService } from '../services/ticket.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  authenticatedUser = signal<FirebaseSigninResponse | null>(null);

  private APIKey = environment.firebaseConfig.apiKey;

  private httpBackend = inject(HttpBackend);
  private userService = inject(UserService);
  private customerService = inject(CustomerService);
  private managerService = inject(ManagerService);
  private ticketService = inject(TicketService);
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

  registerUser(newUser: Partial<Customer | Manager>, userRole: UserRole) {
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

          if (userRole === UserRole.MANAGER) {
            return this.managerService.createManager(newUser as Manager, id);
          }

          return this.customerService.createCustomer(newUser as Customer, id);
        }),
      );
  }

  logout() {
    this.authenticatedUser.set(null);
    localStorage.removeItem('token');

    this.customerService.logoutFromApp();
    this.managerService.logoutFromApp();
    this.ticketService.logoutFromApp();

    this.userService.clearCurrentUser$();
  }

  setAuthenticatedUser(loggedUser: FirebaseSigninResponse) {
    this.authenticatedUser.set(loggedUser);
    localStorage.setItem('token', loggedUser.idToken);
  }

  isUserAuthenticated() {
    return this.authenticatedUser() !== null;
  }
}
