export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  phone?: string;
  createdAt: Date;
  createdBy: string;
}
