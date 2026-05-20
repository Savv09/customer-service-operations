import { Pipe, PipeTransform } from '@angular/core';
import { UserRole } from '../enums/user-roles.enum';

@Pipe({
  name: 'role',
})
export class RolePipe implements PipeTransform {
  transform(value: unknown, ...args: unknown[]): unknown {
    switch (value) {
      case UserRole.ADMIN:
        return 'Administrator';
      case UserRole.MANAGER:
        return 'Manager';
      case UserRole.CUSTOMER:
        return 'Client';
    }

    return null;
  }
}
