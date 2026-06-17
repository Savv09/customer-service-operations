import { Component, input, output } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { ManagerPipe } from '../../pipes/manager-pipe';
import { CommonModule } from '@angular/common';
import { TicketPriorityPipe } from '../../pipes/ticket-priority-pipe';
import { TicketStatusPipe } from '../../pipes/ticket-status-pipe';
import { CustomerPipe } from '../../pipes/customer-pipe';
import { TicketPriority } from '../../enums/tickets.enum';
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

  onSelectRow(row: TableEvent) {
    this.rowSelected.emit(row);
  }
}
