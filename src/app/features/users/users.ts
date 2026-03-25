import { Component, inject } from '@angular/core';

import { TitleService } from '../../core/services/title.service';

@Component({
  selector: 'app-users',
  imports: [],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users {
  private titleService = inject(TitleService);

  ngOnInit(): void {
    this.titleService.setTitle('Users');
  }
}
