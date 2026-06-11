import { Pipe, PipeTransform } from '@angular/core';
import { TicketStatus } from '../enums/tickets.enum';

@Pipe({
  name: 'ticketStatus',
})
export class TicketStatusPipe implements PipeTransform {
  transform(value: TicketStatus): string {
    switch (value) {
      case TicketStatus.CLOSED:
        return 'Closed';
      case TicketStatus.IN_PROGRESS:
        return 'In progress';
      case TicketStatus.OPEN:
        return 'Open';
      case TicketStatus.RESOLVED:
        return 'Resolved';
    }
  }
}
