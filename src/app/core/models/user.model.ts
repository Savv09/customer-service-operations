import { UserRole } from '../../shared/enums/user-roles.enum';

export interface BaseUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  createdAt: Date;
  role: UserRole;
}

export interface Admin extends BaseUser {
  role: UserRole.ADMIN;
}

export interface Manager extends BaseUser {
  role: UserRole.MANAGER;
  createdBy: string;
  department: string;
}

export interface Customer extends BaseUser {
  role: UserRole.CUSTOMER;
  createdBy: string;
  company: string;
}
