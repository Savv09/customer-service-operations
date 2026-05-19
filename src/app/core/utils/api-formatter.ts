import { UserRole } from '../../shared/enums/user-roles.enum';
import { UserFromApi } from '../models/responses-from-api.model';
import { Admin, BaseUser, Customer, Manager } from '../models/user.model';

function extractIdFromName(name: string) {
  const nameParts = name.split('/');

  const id = nameParts.pop();

  return id as string;
}

export function mapUserToDomain(user: UserFromApi): BaseUser | Admin | Customer | Manager {
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
      return {
        ...base,
        role: UserRole.MANAGER,
        department: user.fields.department?.stringValue || '',
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

// export function formatBaseUser(response: UserFromApi): BaseUser {
//   const user = response.document;

//   return {
//     id: extractIdFromName(user.name),

//     email: user.fields.email?.stringValue || '',

//     firstName: user.fields.firstName?.stringValue || '',

//     lastName: user.fields.lastName?.stringValue || '',

//     phone: user.fields.phone?.stringValue,

//     role: Number(user.fields.role?.integerValue || 0) as UserRole,

//     createdAt: new Date(user.createTime),
//   };
// }

// export function formatAdminFromFirestore(response: UserFromApi): Admin {
//   const base = formatBaseUser(response);

//   return {
//     ...base,

//     role: UserRole.ADMIN,
//   };
// }

// export function formatManagerFromFirestore(response: UserFromApi): Manager {
//   const base = formatBaseUser(response);
//   const user = response.document;

//   return {
//     ...base,

//     role: UserRole.MANAGER,

//     department: user.fields.department?.stringValue || '',

//     createdBy: user.fields.createdBy?.stringValue || '',
//   };
// }

// export function formatCustomerFromFirestore(response: UserFromApi): Customer {
//   const base = formatBaseUser(response);
//   const user = response.document;

//   return {
//     ...base,

//     role: UserRole.CUSTOMER,

//     company: user.fields.company?.stringValue || '',

//     createdBy: user.fields.createdBy?.stringValue || '',
//   };
// }

// export function formatUser(response: UserFromApi) {
//   const role = Number(response.document.fields.role?.integerValue);

//   switch (role) {
//     case UserRole.ADMIN:
//       return formatAdminFromFirestore(response);

//     case UserRole.CUSTOMER:
//       return formatCustomerFromFirestore(response);

//     case UserRole.MANAGER:
//       return formatManagerFromFirestore(response);

//     default:
//       return formatBaseUser(response);
//   }
// }
