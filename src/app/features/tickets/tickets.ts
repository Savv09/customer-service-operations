import { Component, computed, inject, OnInit, signal } from '@angular/core';

import { TitleService } from '../../core/services/title.service';
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
import { Table } from '../../shared/components/table/table';
import { TableEvent } from '../../core/models/table-event.model';
import { Manager, User } from '../../core/models/user.model';

@Component({
  selector: 'app-tickets',
  imports: [
    MatTabsModule,
    MatTableModule,
    MatIcon,
    MatButtonModule,
    CommonModule,
    MatExpansionModule,
    Table,
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

  managerOpenTickets = computed(() => {
    const user = this.currentUser();

    if (user?.role !== UserRole.MANAGER) {
      return [];
    }

    if (this.isManager(user)) {
      return this.ticketList().filter(
        (item) => item.department === user.department && item.status === TicketStatus.OPEN,
      );
    }

    return [];
  });

  ticketList = this.ticketService.getTicketList$();
  departmentList = computed(() => {
    const departments = [...new Set(this.ticketList().map((ticket) => ticket.department))];

    return departments;
  });

  isTicketListLoaded = this.ticketService.getIsTicketListLoaded();

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

  navigateToDetails(ticket: TableEvent) {
    this.router.navigate(['/', 'tickets', ticket.id]);
  }

  isManager(user: User | null | undefined): user is Manager {
    return user?.role === UserRole.MANAGER;
  }
}
