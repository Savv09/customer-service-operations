import { Component, computed, inject, signal } from '@angular/core';

import { TitleService } from '../../core/services/title.service';
import { Ticket } from '../../core/models/ticket.model';
import { UserService } from '../../core/services/user.service';
import { UserRole } from '../../shared/enums/user-roles.enum';

@Component({
  selector: 'app-tickets',
  imports: [],
  templateUrl: './tickets.html',
  styleUrl: './tickets.css',
})
export class Tickets {
  private userService = inject(UserService);
  private titleService = inject(TitleService);

  user = this.userService.user;

  ticketList = signal<Ticket[]>([]);

  filter = signal<string>('');
  filteredData = computed(() => {
    const filter = this.filter().trim().toLowerCase();

    if (!filter) return this.ticketList();

    return this.ticketList().filter((ticket) => ticket.title.toLowerCase().includes(filter));
  });

  columnToDisplay = ['title', 'createdBy', 'department', 'edit'];

  ngOnInit(): void {
    this.setTitleByUser();
  }

  setTitleByUser() {
    const userRole = this.user()?.role;
    this.titleService.setTitle(userRole === UserRole.CUSTOMER ? 'My Tickets' : 'Tickets');
  }
}
