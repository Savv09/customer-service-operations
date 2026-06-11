import { Department } from '../../shared/enums/department.enum';
import { Ticket } from '../models/ticket.model';

const departmentCodeMap: Record<Department, string> = {
  [Department.CUSTOMER_SUPPORT]: 'CU',
  [Department.TECHNICAL_SUPPORT]: 'TE',
  [Department.SOFTWARE]: 'SO',
  [Department.HARDWARE]: 'HA',
  [Department.NETWORK]: 'NE',
  [Department.DEVOPS]: 'DE',
  [Department.SECURITY]: 'SE',
  [Department.BILLING]: 'BI',
};

export function generateTicketCode(department: Department, ticketList: Ticket[]): string {
  const prefix = departmentCodeMap[department];

  const departmentTickets = ticketList.filter((t) => t.department === department);

  const maxNumber = departmentTickets.reduce((max, ticket) => {
    const match = ticket.code?.match(/\d+$/);
    const num = match ? parseInt(match[0], 10) : 0;
    return Math.max(max, num);
  }, 0);

  const nextNumber = maxNumber + 1;

  const finalNumber = nextNumber.toString().padStart(2, '0');

  return `TK${prefix}${finalNumber}`;
}
