import { Component, computed, inject, OnInit, signal } from '@angular/core';

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
import { Router } from '@angular/router';
import { ManagerPipe } from '../../shared/pipes/manager-pipe';
import { CustomerPipe } from '../../shared/pipes/customer-pipe';
import { TicketPriorityPipe } from '../../shared/pipes/ticket-priority-pipe';
import { TicketStatusPipe } from '../../shared/pipes/ticket-status-pipe';
import { TicketPriority, TicketStatus } from '../../shared/enums/tickets.enum';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'app-tickets',
  imports: [
    MatTabsModule,
    MatTableModule,
    MatIcon,
    MatButtonModule,
    CommonModule,
    ManagerPipe,
    CustomerPipe,
    TicketPriorityPipe,
    TicketStatusPipe,
    MatExpansionModule,
  ],
  templateUrl: './tickets.html',
  styleUrl: './tickets.css',
})
export class Tickets implements OnInit {
  private userService = inject(UserService);
  private titleService = inject(TitleService);
  private ticketService = inject(TicketService);
  private router = inject(Router);

  ticketStatus = TicketStatus;
  ticketPriority = TicketPriority;

  currentUser = this.userService.getCurrentUser$();
  userRole = UserRole;

  ticketList = this.ticketService.getTicketList$();
  departmentList = computed(() => {
    const departments = [...new Set(this.ticketList().map((ticket) => ticket.department))];

    return departments;
  });

  isTicketListLoaded = this.ticketService.getIsTicketListLoaded();

  // filter = signal<string>('');
  // filteredData = computed(() => {
  //   const filter = this.filter().trim().toLowerCase();

  //   if (!filter) return this.ticketList();

  //   return this.ticketList().filter((ticket) => ticket.title.toLowerCase().includes(filter));
  // });

  readonly panelOpenState = signal(false);

  columnToDisplay = ['code', 'createdAt', 'assignedTo', 'status', 'priority'];

  ngOnInit(): void {
    this.setTitleByUser();
    this.titleService.setHasBackButton(false);
    this.getTickets();
  }

  setTitleByUser() {
    const userRole = this.currentUser()?.role;
    this.titleService.setTitle(userRole === UserRole.CUSTOMER ? 'My Tickets' : 'Tickets');
  }

  getTickets() {
    if (!this.isTicketListLoaded()) {
      this.ticketService
        .getTicketList()
        .subscribe((res) => this.ticketService.updateTicketList$(res));
    }
  }

  navigateToCreateTicket() {
    this.router.navigate(['/', 'tickets', 'new']);
  }

  navigateToDetails(ticket: Ticket) {
    this.router.navigate(['/', 'tickets', ticket.id]);
  }
}
