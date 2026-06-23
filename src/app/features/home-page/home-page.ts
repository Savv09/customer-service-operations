import { Component, computed, inject, OnInit } from '@angular/core';
import { TitleService } from '../../core/services/title.service';
import { UserService } from '../../core/services/user.service';
import { UserRole } from '../../shared/enums/user-roles.enum';
import { ManagerService } from '../../core/services/manager.service';
import { CustomerService } from '../../core/services/customer.service';
import { TicketService } from '../../core/services/ticket.service';
import { TicketPriority, TicketStatus } from '../../shared/enums/tickets.enum';
import { CommonModule } from '@angular/common';
import { Department } from '../../shared/enums/department.enum';
import { DashboardCard } from '../../shared/components/dashboard-card/dashboard-card';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { Button } from '../../shared/components/button/button';
import { Manager, User } from '../../core/models/user.model';
import { Ticket } from '../../core/models/ticket.model';
import { TicketNotification } from '../../core/models/ticket-notifications.model';

@Component({
  selector: 'app-home-page',
  imports: [CommonModule, DashboardCard, MatIconModule, Button],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage implements OnInit {
  private titleService = inject(TitleService);
  private userService = inject(UserService);
  private managerService = inject(ManagerService);
  private customerService = inject(CustomerService);
  private ticketService = inject(TicketService);
  private router = inject(Router);

  userRole = UserRole;

  currentUser = this.userService.getCurrentUser$();
  customerList = this.customerService.getCustomerList$();

  managerList = this.managerService.getManagerList$();

  ticketList = this.ticketService.getTicketList$();

  departmentList = computed(() => {
    const departments = [...new Set(this.ticketList().map((ticket) => ticket.department))];

    return departments;
  });

  adminCards = computed(() => {
    const managers = this.managerList().length;
    const customers = this.managerList().length;

    const openTickets = this.ticketList().filter(
      (ticket) => ticket.status === TicketStatus.OPEN,
    ).length;
    const closedTickets = this.ticketList().filter(
      (ticket) => ticket.status === TicketStatus.CLOSED,
    ).length;

    const todayTickets = this.ticketList().filter((ticket) => {
      const createdAt = ticket.createdAt;

      return (
        createdAt.getFullYear() === new Date().getFullYear() &&
        createdAt.getMonth() === new Date().getMonth() &&
        createdAt.getDate() === new Date().getDate()
      );
    }).length;

    const cards = [
      { label: 'open tickets', value: openTickets },
      { label: 'closed tickets', value: closedTickets },
      { label: 'tickets today', value: todayTickets },
      { label: 'managers', value: managers },
      { label: 'customers', value: customers },
    ];

    return cards;
  });

  managerCards = computed(() => {
    const user = this.currentUser();

    let notAssignedTickets = 0;
    let highPriority = 0;

    if (this.isManager(user)) {
      notAssignedTickets = this.ticketList().filter(
        (ticket) => ticket.assignedManagerId === '' && ticket.department === user.department,
      ).length;

      highPriority = this.ticketList().filter(
        (ticket) =>
          ticket.department === user.department &&
          (ticket.priority === TicketPriority.HIGH || ticket.priority === TicketPriority.URGENT) &&
          (ticket.assignedManagerId === '' || ticket.assignedManagerId === user.id),
      ).length;
    }

    const assignedTickets = this.ticketList().filter(
      (ticket) => ticket.assignedManagerId === this.currentUser()?.id,
    ).length;

    const waitingCustomer = this.ticketList().filter(
      (ticket) =>
        ticket.status === TicketStatus.RESOLVED &&
        ticket.assignedManagerId === this.currentUser()?.id,
    ).length;

    const overdueTickets = this.ticketList().filter(
      (ticket) =>
        ticket.assignedManagerId === this.currentUser()?.id && this.isTicketOverdue(ticket),
    ).length;

    const cards = [
      { label: 'not assigned', value: notAssignedTickets },
      { label: 'my tickets', value: assignedTickets },
      { label: 'high priority', value: highPriority },
      { label: 'waiting customer', value: waitingCustomer },
      { label: 'overdue', value: overdueTickets },
    ];

    return cards;
  });

  notifications = computed(() => {
    const user = this.currentUser();

    let department = Department.CUSTOMER_SUPPORT;

    if (this.isManager(user)) {
      department = user.department;
    }

    const managerTickets = this.ticketList().filter((ticket) => {
      return (
        (ticket.assignedManagerId === this.currentUser()?.id || ticket.assignedManagerId === '') &&
        ticket.department === department
      );
    });
    const notifications: TicketNotification[] = [];
    const now = new Date();

    managerTickets.forEach((ticket) => {
      if (this.isTicketOverdue(ticket)) {
        notifications.push({
          ticketId: ticket.id,
          message: `Ticket ${ticket.code.toUpperCase()} is overdue`,
          severity: 'danger',
        });
      }

      if (
        ticket.priority === TicketPriority.HIGH &&
        ticket.status !== TicketStatus.CLOSED &&
        ticket.status !== TicketStatus.RESOLVED
      ) {
        notifications.push({
          ticketId: ticket.id,
          message: `Ticket ${ticket.code.toUpperCase()} High Priority`,
          severity: 'warning',
        });
      }
      if (
        ticket.priority === TicketPriority.URGENT &&
        ticket.status !== TicketStatus.CLOSED &&
        ticket.status !== TicketStatus.RESOLVED
      ) {
        notifications.push({
          ticketId: ticket.id,
          message: `Ticket ${ticket.code.toUpperCase()} Urgent Priority`,
          severity: 'danger',
        });
      }

      const daysSinceCreation =
        (now.getTime() - new Date(ticket.createdAt).getTime()) / (1000 * 60 * 60 * 24);

      if (daysSinceCreation >= 5 && ticket.status === TicketStatus.OPEN) {
        notifications.push({
          ticketId: ticket.id,
          message: `Ticket ${ticket.code.toUpperCase()} waiting ${Math.floor(daysSinceCreation)} days`,
          severity: 'warning',
        });
      }

      const daysSinceUpdate =
        (now.getTime() - new Date(ticket.updatedAt).getTime()) / (1000 * 60 * 60 * 24);

      if (
        daysSinceUpdate >= 3 &&
        ticket.status !== TicketStatus.CLOSED &&
        ticket.status !== TicketStatus.RESOLVED
      ) {
        notifications.push({
          ticketId: ticket.id,
          message: `Ticket ${ticket.code.toUpperCase()} Not updated recently`,
          severity: 'warning',
        });
      }
    });

    return notifications;
  });

  ngOnInit(): void {
    this.titleService.setTitle('Home Page');
  }

  isManager(user: User | null | undefined): user is Manager {
    return user != null;
  }

  isTicketOverdue(ticket: Ticket): boolean {
    if (ticket.status === TicketStatus.CLOSED || ticket.status === TicketStatus.RESOLVED) {
      return false;
    }

    const now = Date.now();
    const createdAt = new Date(ticket.createdAt).getTime();

    const elapsedHours = (now - createdAt) / (1000 * 60 * 60);

    switch (ticket.priority) {
      case TicketPriority.LOW:
        return elapsedHours > 24 * 7;

      case TicketPriority.MEDIUM:
        return elapsedHours > 24 * 3;

      case TicketPriority.HIGH:
        return elapsedHours > 24;

      case TicketPriority.URGENT:
        return elapsedHours > 4;

      default:
        return false;
    }
  }

  getTicketsByDepartment(department: Department) {
    return this.ticketList().filter((ticket) => ticket.department === department).length;
  }

  navigateToCreateManager() {
    this.router.navigate(['/', 'managers', 'new']);
  }

  navigateToCreateCustomer() {
    this.router.navigate(['/', 'customers', 'new']);
  }

  navigateToCreateTicket() {
    this.router.navigate(['/', 'tickets', 'new']);
  }

  navigateToTickets() {
    this.router.navigate(['/', 'tickets']);
  }

  navigateToTicketDetails(ticketdId: string) {
    this.router.navigate(['/', 'tickets', ticketdId]);
  }
}
