export interface UserFromApi {
  name: string;
  fields: {
    firstName: { stringValue: string };
    role: { integerValue: string };
    email: { stringValue: string };
    lastName: { stringValue: string };
    phone?: { stringValue: string };
    company?: { stringValue: string };
    createdBy?: { stringValue: string };
    department?: { stringValue: string };
  };
  createTime: string;
  updateTime: string;
}

export interface UserListFromApi {
  document: UserFromApi;
}

export interface TicketFromApi {
  name: string;
  fields: {
    title: { stringValue: string };
    description: { stringValue: string };
    customerId: { stringValue: string };
    assignedManagerId: { stringValue: string };
    department: { stringValue: string };
    priority: { integerValue: number };
    status: { integerValue: number };
    closedAt: { stringValue: string };
  };
  createTime: string;
  updateTime: string;
}

export interface TicketListFromApi {
  documents: TicketFromApi[];
}
