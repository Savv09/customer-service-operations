import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { finalize } from 'rxjs';

import { AuthResponse, AuthService } from '../auth.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  isLoginFailed = signal(false);
  isLoading = signal(false);

  private authService = inject(AuthService);
  private userService = inject(UserService);

  private fb = inject(FormBuilder);
  private router = inject(Router);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  login() {
    if (this.loginForm.valid) {
      this.isLoading.set(true);

      const email = this.loginForm.value.email as string;
      const password = this.loginForm.value.password as string;

      this.authService
        .login(email, password)
        .pipe(finalize(() => this.isLoading.set(false)))
        .subscribe({
          next: (res) => this.setActiveUser(res),
          error: (err) => this.handleLoginError(err),
        });
    }
  }

  // Todo: Handling errors in a dedicated service
  handleLoginError(err: any) {
    this.isLoginFailed.set(true);
  }

  setActiveUser(res: AuthResponse) {
    this.authService.setAuthenticatedUser(res);

    this.userService.getUser(res.localId);

    this.router.navigate(['/', 'dashboard']);
  }
}
