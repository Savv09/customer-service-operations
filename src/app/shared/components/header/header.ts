import { Component, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';

import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '../../../core/auth/auth.service';
import { TitleService } from '../../../core/services/title.service';

import { RolePipe } from '../../pipes/role-pipe';
import { UserRole } from '../../enums/user-roles.enum';
import { Customer, User } from '../../../core/models/user.model';

@Component({
  selector: 'app-header',
  imports: [RolePipe, MatButtonModule, MatMenuModule, MatIconModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  currentUser = input<User | null>(null);

  userRole = UserRole;

  private authService = inject(AuthService);
  private titleService = inject(TitleService);
  private router = inject(Router);

  title = this.titleService.getTitle();
  hasBackButton = this.titleService.getHasBackButton();

  get fullName() {
    return `${this.currentUser()?.firstName} ${this.currentUser()?.lastName}`;
  }

  get customerCompany(): string | null {
    const user = this.currentUser();

    if (this.isCustomer(user)) {
      return user.company;
    }

    return null;
  }

  isCustomer(user: User | null): user is Customer {
    return user?.role === UserRole.CUSTOMER;
  }

  navigateBack() {
    const backUrl = this.titleService.getBackButtonUrl();
    this.router.navigate(backUrl());
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/', 'login']);
  }
}
