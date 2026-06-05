import { TicketFromApi, UserFromApi } from '../models/responses-from-api.model';
import { Admin, BaseUser, Customer, Manager } from '../models/user.model';

import { UserRole } from '../../shared/enums/user-roles.enum';
import { Department } from '../../shared/enums/department.enum';
import { TicketPriority, TicketStatus } from '../../shared/enums/tickets.enum';
import { Ticket } from '../models/ticket.model';

function extractIdFromName(name: string) {
  const nameParts = name.split('/');

  const id = nameParts.pop();

  return id as string;
}

export function mapUserFromApi(user: UserFromApi): BaseUser | Admin | Customer | Manager {
  const role = Number(user.fields.role?.integerValue);

  const base: BaseUser = {
    id: extractIdFromName(user.name),
    email: user.fields.email?.stringValue || '',
    firstName: user.fields.firstName?.stringValue || '',
    lastName: user.fields.lastName?.stringValue || '',
    phone: user.fields.phone?.stringValue,
    role,
    createdAt: new Date(user.createTime),
  };

  switch (role) {
    case UserRole.CUSTOMER:
      return {
        ...base,
        role: UserRole.CUSTOMER,
        company: user.fields.company?.stringValue || '',
        createdBy: user.fields.createdBy?.stringValue || '',
      };

    case UserRole.MANAGER:
      const departmentValue = user.fields.department?.stringValue;

      return {
        ...base,
        role: UserRole.MANAGER,
        department: Object.values(Department).includes(departmentValue as Department)
          ? (departmentValue as Department)
          : Department.CUSTOMER_SUPPORT,
        createdBy: user.fields.createdBy?.stringValue || '',
      };

    case UserRole.ADMIN:
      return {
        ...base,
        role: UserRole.ADMIN,
      };

    default:
      return base;
  }
}

export function mapTicketFromApi(ticket: TicketFromApi): Ticket {
  const departmentValue = ticket.fields.department?.stringValue;

  return {
    id: extractIdFromName(ticket.name),
    title: ticket.fields.title?.stringValue || '',
    description: ticket.fields.description?.stringValue || '',
    customerId: ticket.fields.customerId.stringValue || '',
    assignedManagerId: ticket.fields.assignedManagerId?.stringValue || undefined,
    department: isDepartment(departmentValue) ? departmentValue : Department.CUSTOMER_SUPPORT,
    priority: Number(ticket.fields.priority?.integerValue || 0) as TicketPriority,
    status: Number(ticket.fields.status?.integerValue || 0) as TicketStatus,
    closedAt: ticket.fields.closedAt.stringValue || '',
    createdAt: new Date(ticket.createTime),
  };
}

function isDepartment(value: any): value is Department {
  return Object.values(Department).includes(value);
}
