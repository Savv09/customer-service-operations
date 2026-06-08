import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { UserService } from '../services/user.service';

import { UserRole } from '../../shared/enums/user-roles.enum';

export const roleGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);

  const currentUser = userService.getCurrentUser$()();

  const allowedRoles = route.data?.['roles'] as UserRole[];

  if (!currentUser) {
    router.navigate(['/', 'login']);
  } else {
    if (!allowedRoles.includes(currentUser?.role)) {
      router.navigate(['/']);
      return false;
    }
  }

  return true;
};
