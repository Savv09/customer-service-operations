import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Sidebar } from '../../shared/components/sidebar/sidebar';
import { Header } from '../../shared/components/header/header';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-dashborad-layout',
  imports: [Sidebar, Header, RouterOutlet, MatIconModule],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.css',
})
export class DashboradLayout {
  private userService = inject(UserService);

  user = this.userService.user;
}
