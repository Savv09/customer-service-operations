import { Department } from '../../shared/enums/department.enum';
import { TicketPriority, TicketStatus } from '../../shared/enums/tickets.enum';
import { Customer } from './user.model';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  createdBy: Customer;
  assignedManagerId?: string;
  department: Department;
  priority: TicketPriority;
  status: TicketStatus;
  closedAt?: string;
  createdAt: Date;
}
