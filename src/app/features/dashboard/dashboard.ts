import { Component, inject, OnInit } from '@angular/core';
import { TitleService } from '../../core/services/title.service';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private titleService = inject(TitleService);
  private userService = inject(UserService);

  currentUser = this.userService.user;

  ngOnInit(): void {
    this.titleService.setTitle('Dashboard');
  }
}
