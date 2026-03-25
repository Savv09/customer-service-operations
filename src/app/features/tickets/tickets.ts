import { Component, inject } from '@angular/core';

import { TitleService } from '../../core/services/title.service';

@Component({
  selector: 'app-tickets',
  imports: [],
  templateUrl: './tickets.html',
  styleUrl: './tickets.css',
})
export class Tickets {
  private titleService = inject(TitleService);

  ngOnInit(): void {
    this.titleService.setTitle('Tickets');
  }
}
