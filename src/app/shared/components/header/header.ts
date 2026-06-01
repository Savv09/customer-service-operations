import { Component, computed, inject, input, output, signal } from '@angular/core';
import { Router } from '@angular/router';

import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '../../../core/auth/auth.service';
import { TitleService } from '../../../core/services/title.service';

import { RolePipe } from '../../pipes/role-pipe';

import { Customer, Manager, User } from '../../../core/models/user.model';

import { UserRole } from '../../enums/user-roles.enum';

@Component({
  selector: 'app-header',
  imports: [RolePipe, MatButtonModule, MatMenuModule, MatIconModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  currentUser = input<User | null>(null);

  userRole = UserRole;

  private titleService = inject(TitleService);
  private router = inject(Router);

  title = this.titleService.getTitle();
  private readonly titleIcons: Record<string, string> = {
    Dashboard: 'dashboard',

    Managers: 'manage_accounts',
    'Manager Details': 'manage_accounts',

    Customers: 'groups',
    'Customer Details': 'groups',

    'Edit Manager': 'edit',
    'Edit Customer': 'edit',

    'New Manager': 'add',
    'New Customer': 'add',

    Tickets: 'assignment',
    'My Tickets': 'assignment',
  };

  titleIcon = computed(() => {
    return this.titleIcons[this.title()] ?? 'dashboard';
  });

  hasBackButton = this.titleService.getHasBackButton();

  get fullName() {
    return `${this.currentUser()?.firstName} ${this.currentUser()?.lastName}`;
  }

  get managerDepartment(): string | null {
    const user = this.currentUser();

    if (this.isManager(user)) {
      return user.department;
    }

    return null;
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

  isManager(user: User | null): user is Manager {
    return user?.role === UserRole.MANAGER;
  }

  navigateBack() {
    const backUrl = this.titleService.getBackButtonUrl();
    this.router.navigate(backUrl());
  }
}
