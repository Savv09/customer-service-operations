import { UserFromApi } from '../models/responses-from-api.model';
import { User } from '../models/user.model';

export function formatUserFromFirestore(userFromApi: UserFromApi): User {
  return {
    email: userFromApi.fields.email?.stringValue || '',
    firstName: userFromApi.fields.firstName?.stringValue || '',
    lastName: userFromApi.fields.lastName?.stringValue || '',
    password: userFromApi.fields.Password?.stringValue || '',
    role: userFromApi.fields.Role?.integerValue ? Number(userFromApi.fields.Role.integerValue) : 0,
  };
}
