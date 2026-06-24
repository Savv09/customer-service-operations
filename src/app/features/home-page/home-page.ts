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
import { QuickAction } from '../../core/models/home-page-interfaces.model';
import { MessageService } from '../../core/services/message.service';
import { MessageSeverity } from '../../shared/enums/message-severity.enum';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Message } from '../../core/models/message.model';

@Component({
  selector: 'app-home-page',
  imports: [CommonModule, DashboardCard, MatIconModule, Button, MatTooltipModule],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage implements OnInit {
  private titleService = inject(TitleService);
  private userService = inject(UserService);
  private managerService = inject(ManagerService);
  private customerService = inject(CustomerService);
  private ticketService = inject(TicketService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  userRole = UserRole;
  messageSeverity = MessageSeverity;

  currentUser = this.userService.getCurrentUser$();
  customerList = this.customerService.getCustomerList$();

  managerList = this.managerService.getManagerList$();

  ticketList = this.ticketService.getTicketList$();

  messageList = this.messageService.getMessageList$();

  departmentList = computed(() => {
    const departments = [...new Set(this.ticketList().map((ticket) => ticket.department))];

    return departments;
  });

  dashboardCards = computed(() => {
    const role = this.currentUser()?.role;

    switch (role) {
      case UserRole.ADMIN:
        return this.adminCards();

      case UserRole.MANAGER:
        return this.managerCards();

      case UserRole.CUSTOMER:
        return this.customerCards();

      default:
        return [];
    }
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
        (ticket) => ticket.assignedManagerId === undefined && ticket.department === user.department,
      ).length;

      highPriority = this.ticketList().filter(
        (ticket) =>
          ticket.department === user.department &&
          (ticket.priority === TicketPriority.HIGH || ticket.priority === TicketPriority.URGENT) &&
          (ticket.assignedManagerId === undefined || ticket.assignedManagerId === user.id),
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

  customerCards = computed(() => {
    const customerTicktes = this.ticketList().filter(
      (ticket) => ticket.customerId === this.currentUser()?.id,
    );

    const openTickets = customerTicktes.filter(
      (ticket) => ticket.status === TicketStatus.OPEN && ticket.assignedManagerId === undefined,
    ).length;

    const assignedTickets = customerTicktes.filter(
      (ticket) => ticket.assignedManagerId !== undefined && ticket.status !== TicketStatus.CLOSED,
    ).length;

    const ongoingTickets = customerTicktes.filter(
      (ticket) => ticket.status === TicketStatus.IN_PROGRESS,
    ).length;
    const resolvedTickets = customerTicktes.filter(
      (ticket) => ticket.status === TicketStatus.RESOLVED,
    ).length;

    const closedTickets = customerTicktes.filter(
      (ticket) => ticket.status === TicketStatus.CLOSED,
    ).length;

    const cards = [
      { label: 'open tickets', value: openTickets },
      { label: 'assigned tickets', value: assignedTickets },
      { label: 'ongoing tickets', value: ongoingTickets },
      { label: 'resolved tickets', value: resolvedTickets },
      { label: 'closed tickets', value: closedTickets },
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
          message: `Ticket ${ticket.code.toUpperCase()} has high priority`,
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
          message: `Ticket ${ticket.code.toUpperCase()} has urgent priority`,
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
          message: `Ticket ${ticket.code.toUpperCase()} not updated recently`,
          severity: 'warning',
        });
      }
    });

    return notifications;
  });

  widgetTitle = computed(() => {
    switch (this.currentUser()?.role) {
      case UserRole.ADMIN:
        return 'Tickets by Department';

      case UserRole.MANAGER:
        return 'Notifications';

      default:
        return null;
    }
  });

  quickActions = computed<QuickAction[]>(() => {
    switch (this.currentUser()?.role) {
      case UserRole.ADMIN:
        return [
          {
            label: 'New ticket',
            icon: 'assignment',
            action: () => this.navigateToCreateTicket(),
          },
          {
            label: 'New manager',
            icon: 'manage_accounts',
            action: () => this.navigateToCreateManager(),
          },
          {
            label: 'New customer',
            icon: 'groups',
            action: () => this.navigateToCreateCustomer(),
          },
        ];

      case UserRole.MANAGER:
        return [
          {
            label: 'View tickets',
            icon: 'assignment',
            action: () => this.navigateToTickets(),
          },
        ];

      case UserRole.CUSTOMER:
        return [
          {
            label: 'New ticket',
            icon: 'assignment',
            action: () => this.navigateToCreateTicket(),
          },
          {
            label: 'View tickets',
            icon: 'assignment',
            action: () => this.navigateToTickets(),
          },
        ];

      default:
        return [];
    }
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

  markAsRead(message: Message) {
    const userId = this.currentUser()?.id;

    const readBy = message.readBy.includes(userId as string)
      ? message.readBy
      : [...message.readBy, userId as string];
    const updatedMessage = { ...message, readBy };

    this.messageService
      .markMessageAsRead(updatedMessage)
      .subscribe((res) => this.messageService.updateMessageList$(res));
  }

  archiveMessage(message: Message) {
    const userId = this.currentUser()?.id;

    const archivedBy = message.archivedBy.includes(userId as string)
      ? message.archivedBy
      : [...message.archivedBy, userId as string];

    const updatedMessage = { ...message, archivedBy };

    this.messageService
      .archiveMessage(updatedMessage)
      .subscribe((res) => this.messageService.updateMessageList$(res));
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
