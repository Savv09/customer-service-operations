import { Component, inject } from '@angular/core';

import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { UserService } from '../../core/services/user.service';

import { RolePipe } from '../pipes/role-pipe';

@Component({
  selector: 'app-header',
  imports: [RolePipe, MatButtonModule, MatMenuModule, MatIconModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  private userService = inject(UserService);

  user = this.userService.user;

  getFullName() {
    return `${this.user()?.firstName} ${this.user()?.lastName}`;
  }
}
