import { Component, inject, input, output, ViewChild } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { ManagerPipe } from '../../pipes/manager-pipe';
import { CommonModule } from '@angular/common';
import { TicketPriorityPipe } from '../../pipes/ticket-priority-pipe';
import { TicketStatusPipe } from '../../pipes/ticket-status-pipe';
import { CustomerPipe } from '../../pipes/customer-pipe';
import { TicketPriority, TicketStatus } from '../../enums/tickets.enum';
import { Ticket } from '../../../core/models/ticket.model';
import { Customer, Manager } from '../../../core/models/user.model';
import { TableEvent } from '../../../core/models/table-event.model';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UserService } from '../../../core/services/user.service';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { UserRole } from '../../enums/user-roles.enum';

@Component({
  selector: 'app-table',
  imports: [
    CommonModule,
    MatTableModule,
    ManagerPipe,
    TicketPriorityPipe,
    TicketStatusPipe,
    CustomerPipe,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatMenuModule,
  ],
  templateUrl: './table.html',
  styleUrl: './table.css',
})
export class Table {
  @ViewChild(MatMenuTrigger) statusMenu!: MatMenuTrigger;

  displayedColumns = input<string[]>([]);
  dataSource = input<any>();

  rowSelected = output<Ticket | Manager | Customer>();
  ticketClaimed = output<Ticket>();
  ticketStatusChanged = output<{ ticket: Ticket; status: TicketStatus }>();
  ticketClosed = output<Ticket>();

  private userService = inject(UserService);

  currentUser = this.userService.getCurrentUser$();
  userRole = UserRole;

  ticketPriority = TicketPriority;

  ticketStatus = TicketStatus;
  statusOptions = Object.values(this.ticketStatus).filter((value) => typeof value === 'number');

  getResolutionTime(ticket: Ticket): string {
    if (!ticket.closedAt) return '-';

    const diffMs = new Date(ticket.closedAt).getTime() - new Date(ticket.createdAt).getTime();

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${days}d ${hours}h ${minutes}m`;
  }

  onSelectRow(row: TableEvent) {
    this.rowSelected.emit(row);
  }

  onClaimTicket(ticket: Ticket) {
    this.ticketClaimed.emit(ticket);
  }

  onChangeStatus(ticket: Ticket, status: TicketStatus, trigger: MatMenuTrigger) {
    trigger.closeMenu();
    this.ticketStatusChanged.emit({ ticket, status });
    this.statusMenu.closeMenu();
  }

  onCloseTicket(ticket: Ticket) {
    this.ticketClosed.emit(ticket);
  }
}
