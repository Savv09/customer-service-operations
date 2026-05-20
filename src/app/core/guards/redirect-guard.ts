import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { UserService } from '../services/user.service';

import { UserRole } from '../../shared/enums/user-roles.enum';

export const redirectGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);

  const currentUser = userService.user();

  if (!currentUser) {
    return router.navigate(['/', 'login']);
  }

  switch (currentUser.role) {
    case UserRole.ADMIN:
      return router.navigate(['/', 'customers']);

    case UserRole.MANAGER:
      return router.navigate(['/', 'customers']);

    case UserRole.CUSTOMER:
      return router.navigate(['/', 'tickets']);

    default:
      return router.navigate(['/', 'login']);
  }

  return true;
};
