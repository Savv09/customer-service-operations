import { Component, inject, input, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { map } from 'rxjs';

import { User } from '../../../core/models/user.model';

import { UserRole } from '../../enums/user-roles.enum';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, MatIconModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  currentUser = input<User | null>(null);

  logoutClicked = output<void>();

  userRole = UserRole;

  private router = inject(Router);

  activePage = toSignal(
    this.router.events.pipe(map(() => this.router.url.split('/')[1] || 'home')),
    { initialValue: 'home' },
  );

  navigateToSelectedPage(selectedPage: string) {
    this.router.navigate(['/', selectedPage]);
  }

  onLogout() {
    this.logoutClicked.emit();
  }
}
