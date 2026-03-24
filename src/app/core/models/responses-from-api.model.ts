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
