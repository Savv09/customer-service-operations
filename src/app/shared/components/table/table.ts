import { Component, input, output } from '@angular/core';
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
import { ScrollingModule } from '@angular/cdk/scrolling';

@Component({
  selector: 'app-table',
  imports: [
    CommonModule,
    MatTableModule,
    ManagerPipe,
    TicketPriorityPipe,
    TicketStatusPipe,
    CustomerPipe,
    ScrollingModule,
  ],
  templateUrl: './table.html',
  styleUrl: './table.css',
})
export class Table {
  displayedColumns = input<string[]>([]);
  dataSource = input<any>();

  rowSelected = output<Ticket | Manager | Customer>();

  ticketPriority = TicketPriority;
  ticketStatus = TicketStatus;

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
}
