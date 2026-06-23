import { Component, computed, inject, OnInit } from '@angular/core';

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
import { TicketPriority, TicketStatus } from '../../shared/enums/tickets.enum';
import { MatExpansionModule } from '@angular/material/expansion';
import { Table } from '../../shared/components/table/table';
import { TableEvent } from '../../core/models/table-event.model';
import { Manager, User } from '../../core/models/user.model';
import { Ticket } from '../../core/models/ticket.model';
import { SnackbarService } from '../../core/services/snackbar.service';
import { SnackbarMode } from '../../shared/enums/snackbarMode.enum';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { Button } from '../../shared/components/button/button';

@Component({
  selector: 'app-tickets',
  imports: [
    MatTabsModule,
    MatTableModule,
    MatButtonModule,
    CommonModule,
    MatExpansionModule,
    ScrollingModule,
    Table,
    Button,
  ],
  templateUrl: './tickets.html',
  styleUrl: './tickets.css',
})
export class Tickets implements OnInit {
  private userService = inject(UserService);
  private titleService = inject(TitleService);
  private ticketService = inject(TicketService);
  private router = inject(Router);
  private snackbarService = inject(SnackbarService);

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
        (item) =>
          item.department === user.department &&
          item.status === TicketStatus.OPEN &&
          (item.assignedManagerId === user.id || !item.assignedManagerId),
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

  claimTicket(ticket: Ticket) {
    const assignedManagerId = this.currentUser()?.id;
    const assignedAt = new Date();
    const closedAt = undefined;

    const updatedTicket = {
      ...ticket,
      assignedManagerId,
      assignedAt,
      closedAt,
    };

    this.ticketService
      .claimTicket(updatedTicket)
      .subscribe(
        (res) => (
          this.snackbarService.showSnackbar(
            'Ticket status closed succesfully!',
            SnackbarMode.SUCCESS,
          ),
          this.isTicketListLoaded.set(false),
          this.getTickets()
        ),
      );
  }

  changeActiveStatus(event: { ticket: Ticket; status: TicketStatus }) {
    const { ticket, status } = { ...event };

    const closedAt = undefined;

    const updatedTicket = {
      ...ticket,
      status,
      closedAt,
    };

    this.ticketService
      .changeTicketStatus(updatedTicket)
      .subscribe(
        (res) => (
          this.snackbarService.showSnackbar(
            'Ticket status closed succesfully!',
            SnackbarMode.SUCCESS,
          ),
          this.isTicketListLoaded.set(false),
          this.getTickets()
        ),
      );
  }

  closeTicket(ticket: Ticket) {
    const closedAt = new Date();
    const status = TicketStatus.CLOSED;

    const updatedTicket = {
      ...ticket,
      status,
      closedAt,
    };

    this.ticketService
      .closeTicket(updatedTicket)
      .subscribe(
        (res) => (
          this.snackbarService.showSnackbar(
            'Ticket status closed succesfully!',
            SnackbarMode.SUCCESS,
          ),
          this.isTicketListLoaded.set(false),
          this.getTickets()
        ),
      );
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
