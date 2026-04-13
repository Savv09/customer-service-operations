export interface UserFromApi {
  name: string;
  fields: {
    firstName: { stringValue: string };
    Role: { integerValue: string };
    email: { stringValue: string };
    lastName: { stringValue: string };
  };
  createTime: string;
  updateTime: string;
}

export interface CustomerFromApi {
  name: string;
  fields: {
    firstName: { stringValue: string };
    lastName: { stringValue: string };
    email: { stringValue: string };
    company?: { stringValue: string };
    phone?: { stringValue: string };
    createdBy: { stringValue: string };
  };
  createTime: string;
  updateTime: string;
}

export interface CustomerListFromApi {
  documents: CustomerFromApi[];
}
