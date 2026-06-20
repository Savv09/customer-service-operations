import { Component, inject, OnInit } from '@angular/core';
import { TitleService } from '../../core/services/title.service';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-home-page',
  imports: [],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage implements OnInit {
  private titleService = inject(TitleService);
  private userService = inject(UserService);

  currentUser = this.userService.getCurrentUser$();

  ngOnInit(): void {
    this.titleService.setTitle('Home Page');
  }
}
