import { Component, computed, inject, signal } from '@angular/core';

import { TitleService } from '../../core/services/title.service';
import { Ticket } from '../../core/models/ticket.model';

@Component({
  selector: 'app-tickets',
  imports: [],
  templateUrl: './tickets.html',
  styleUrl: './tickets.css',
})
export class Tickets {
  ticketList = signal<Ticket[]>([]);

  filter = signal<string>('');
  filteredData = computed(() => {
    const filter = this.filter().trim().toLowerCase();

    if (!filter) return this.ticketList();

    return this.ticketList().filter((ticket) => ticket.title.toLowerCase().includes(filter));
  });

  columnToDisplay = ['title', 'createdBy', 'department', 'edit'];

  private titleService = inject(TitleService);

  ngOnInit(): void {
    this.titleService.setTitle('Tickets');
  }
}
