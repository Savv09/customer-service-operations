import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '../../core/auth/auth.service';
import { UserService } from '../../core/services/user.service';
import { TitleService } from '../../core/services/title.service';

import { RolePipe } from '../pipes/role-pipe';

@Component({
  selector: 'app-header',
  imports: [RolePipe, MatButtonModule, MatMenuModule, MatIconModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  private auhtService = inject(AuthService);
  private userService = inject(UserService);
  private router = inject(Router);
  private titleService = inject(TitleService);

  title = this.titleService.title;

  user = this.userService.user;

  getFullName() {
    return `${this.user()?.firstName} ${this.user()?.lastName}`;
  }

  logout() {
    this.auhtService.logout();
    this.router.navigate(['/', 'login']);
  }
}
