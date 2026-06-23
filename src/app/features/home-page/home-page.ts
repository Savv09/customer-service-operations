import { Component, computed, inject, OnInit } from '@angular/core';
import { TitleService } from '../../core/services/title.service';
import { UserService } from '../../core/services/user.service';
import { UserRole } from '../../shared/enums/user-roles.enum';
import { ManagerService } from '../../core/services/manager.service';
import { CustomerService } from '../../core/services/customer.service';
import { TicketService } from '../../core/services/ticket.service';
import { TicketStatus } from '../../shared/enums/tickets.enum';
import { CommonModule } from '@angular/common';
import { Department } from '../../shared/enums/department.enum';
import { DashboardCard } from '../../shared/components/dashboard-card/dashboard-card';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { Button } from '../../shared/components/button/button';

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

  ngOnInit(): void {
    this.titleService.setTitle('Home Page');
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
}
