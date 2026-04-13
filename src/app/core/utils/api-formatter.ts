import { Customer } from '../models/customer.model';
import { CustomerFromApi, UserFromApi } from '../models/responses-from-api.model';
import { User } from '../models/user.model';

export function formatUserFromFirestore(userFromApi: UserFromApi): User {
  return {
    email: userFromApi.fields.email?.stringValue || '',
    firstName: userFromApi.fields.firstName?.stringValue || '',
    lastName: userFromApi.fields.lastName?.stringValue || '',
    role: userFromApi.fields.Role?.integerValue ? Number(userFromApi.fields.Role.integerValue) : 0,
    createdAt: new Date(userFromApi.createTime),
  };
}

export function formatCustomerFromFirestore(customerFromApi: CustomerFromApi): Customer {
  return {
    firstName: customerFromApi.fields.firstName.stringValue,
    lastName: customerFromApi.fields.lastName.stringValue,
    email: customerFromApi.fields.email.stringValue,
    company: customerFromApi.fields.company?.stringValue || undefined,
    phone: customerFromApi.fields.phone?.stringValue || undefined,
    createdBy: customerFromApi.fields.createdBy.stringValue,
    createdAt: new Date(customerFromApi.createTime),
  };
}
