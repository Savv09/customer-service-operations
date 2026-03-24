export interface Ticket {
  title: string;
  description: string;
  status: 0 | 1 | 2;
  priority: 0 | 1 | 2;
  customerId: string;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}
