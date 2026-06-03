import { Component, computed, inject, signal } from '@angular/core';

import { TitleService } from '../../core/services/title.service';
import { Ticket } from '../../core/models/ticket.model';
import { UserService } from '../../core/services/user.service';
import { UserRole } from '../../shared/enums/user-roles.enum';
import { MatTabsModule } from '@angular/material/tabs';
import { TicketService } from '../../core/services/ticket.service';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tickets',
  imports: [MatTabsModule, MatTableModule, MatIcon, MatButtonModule, CommonModule, ScrollingModule],
  templateUrl: './tickets.html',
  styleUrl: './tickets.css',
})
export class Tickets {
  private userService = inject(UserService);
  private titleService = inject(TitleService);
  private ticketService = inject(TicketService);
  private router = inject(Router);

  currentUser = this.userService.user;
  userRole = UserRole;

  ticketList = signal<Ticket[]>([]);
  departmentList = computed(() => {
    const departments = [...new Set(this.ticketList().map((ticket) => ticket.department))];

    return departments;
  });

  filter = signal<string>('');
  filteredData = computed(() => {
    const filter = this.filter().trim().toLowerCase();

    if (!filter) return this.ticketList();

    return this.ticketList().filter((ticket) => ticket.title.toLowerCase().includes(filter));
  });

  columnToDisplay = ['code', 'createdBy', 'assignedTo', 'status', 'priority'];

  ngOnInit(): void {
    this.setTitleByUser();
    this.titleService.setHasBackButton(false);
  }

  setTitleByUser() {
    const userRole = this.currentUser()?.role;
    this.titleService.setTitle(userRole === UserRole.CUSTOMER ? 'My Tickets' : 'Tickets');
  }

  getTickets() {
    this.ticketService.getTicketList();
    this.ticketList = this.ticketService.getTicketList$();
  }

  navigateToCreateTicket() {
    this.router.navigate(['/', 'tickets', 'new']);
  }

  navigateToDetails(ticket: Ticket) {
    this.router.navigate(['/', 'tickets', ticket.id]);
  }
}
