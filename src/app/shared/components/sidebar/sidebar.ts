import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserRole } from '../../enums/user-roles.enum';
import { User } from '../../../core/models/user.model';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  currentUser = input<User | null>(null);

  userRole = UserRole;

  private router = inject(Router);

  activePage = toSignal(
    this.router.events.pipe(map(() => this.router.url.split('/')[1] || 'customers')),
    { initialValue: 'customers' },
  );

  navigateToSelectedPage(selectedPage: string) {
    this.router.navigate(['/', selectedPage]);
  }
}
