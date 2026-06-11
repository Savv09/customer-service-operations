import { Department } from '../../shared/enums/department.enum';
import { TicketPriority, TicketStatus } from '../../shared/enums/tickets.enum';

export interface Ticket {
  id: string;
  code: string;
  title: string;
  description: string;
  customerId: string;
  assignedManagerId?: string;
  department: Department;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: Date;
  closedAt?: Date;
  assignedAt?: Date;
}
