import { Pipe, PipeTransform } from '@angular/core';
import { TicketPriority } from '../enums/tickets.enum';

@Pipe({
  name: 'ticketPriorityPipe',
})
export class TicketPriorityPipe implements PipeTransform {
  transform(value: unknown, ...args: unknown[]): unknown {
    switch (value) {
      case TicketPriority.LOW:
        return 'Low';
      case TicketPriority.MEDIUM:
        return 'Medium';
      case TicketPriority.HIGH:
        return 'High';
      case TicketPriority.URGENT:
        return 'Urgent';
    }
    return null;
  }
}
