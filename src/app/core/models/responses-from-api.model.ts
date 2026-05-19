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
