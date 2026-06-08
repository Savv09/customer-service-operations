import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

import { Sidebar } from '../../shared/components/sidebar/sidebar';
import { Header } from '../../shared/components/header/header';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/auth/auth.service';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { ManagerService } from '../../core/services/manager.service';
import { CustomerService } from '../../core/services/customer.service';
import { TicketService } from '../../core/services/ticket.service';

@Component({
  selector: 'app-dashborad-layout',
  imports: [Sidebar, Header, RouterOutlet, MatIconModule, CommonModule],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.css',
})
export class DashboradLayout implements OnInit {
  private router = inject(Router);

  private userService = inject(UserService);
  private authService = inject(AuthService);
  private managerService = inject(ManagerService);
  private customerService = inject(CustomerService);
  private ticketService = inject(TicketService);

  private dialog = inject(MatDialog);

  isLoading = signal<boolean>(false);
  isInitApplicationFailed = signal<boolean>(false);

  currentUser = this.userService.getCurrentUser$();

  ngOnInit(): void {
    this.initApplication();
  }

  initApplication() {
    this.isLoading.set(true);

    forkJoin({
      managers: this.managerService.getManagerList(),
      customers: this.customerService.getCustomerList(),
      // tickets: this.ticketService.getTicketList(),
    }).subscribe({
      next: ({ managers, customers }) => {
        this.isInitApplicationFailed.set(false);

        this.managerService.updateManagerList$(managers);
        this.customerService.updateCustomerList$(customers);
        // this.ticketService.updateTicketList$(tickets);

        this.isLoading.set(false);
      },
      error: () => {
        this.isInitApplicationFailed.set(true);
      },
    });
  }

  onLogout() {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Logout',
        message: 'Are you sure you want to logout?',
        confirmText: 'Yes',
        cancelText: 'No',
      },
      panelClass: 'custom-dialog',
      position: {
        left: '40%',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.authService.logout();
        this.router.navigate(['/', 'login']);
      }
    });
  }
}
