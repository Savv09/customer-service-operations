import { Routes } from '@angular/router';
import { Login } from './core/auth/login/login';
import { authGuard } from './core/guards/auth-guard';
import { DashboradLayout } from './layout/dashboard-layout/dashboard-layout';
import { CrudMode } from './shared/enums/crud.enum';
import { roleGuard } from './core/guards/role-guard';
import { UserRole } from './shared/enums/user-roles.enum';
import { redirectGuard } from './core/guards/redirect-guard';

export const routes: Routes = [
  { path: 'login', component: Login },
  {
    path: '',
    component: DashboradLayout,
    canActivate: [authGuard],
    children: [
      { path: '', canActivate: [redirectGuard], children: [] },
      {
        path: 'customers',
        canActivate: [roleGuard],
        data: {
          roles: [UserRole.ADMIN, UserRole.MANAGER],
        },
        children: [
          {
            path: '',
            loadComponent: () => import('./features/customers/customers').then((c) => c.Customers),
          },
          {
            path: 'new',
            loadComponent: () =>
              import('./features/customers/customer-detail/customer-detail').then(
                (c) => c.CustomerDetail,
              ),
            data: { mode: CrudMode.CREATE },
          },
          {
            path: ':customerId/edit',
            loadComponent: () =>
              import('./features/customers/customer-detail/customer-detail').then(
                (c) => c.CustomerDetail,
              ),
            data: { mode: CrudMode.EDIT },
          },
          {
            path: ':customerId',
            loadComponent: () =>
              import('./features/customers/customer-detail/customer-detail').then(
                (c) => c.CustomerDetail,
              ),
            data: { mode: CrudMode.READ },
          },
        ],
      },
      {
        path: 'tickets',
        canActivate: [roleGuard],
        data: {
          roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.CUSTOMER],
        },
        children: [
          {
            path: '',
            loadComponent: () => import('./features/tickets/tickets').then((c) => c.Tickets),
          },
          {
            path: ':ticketId',
            loadComponent: () =>
              import('./features/tickets/ticket-detail/ticket-detail').then((c) => c.TicketDetail),
          },
        ],
      },
      {
        path: 'managers',
        canActivate: [roleGuard],
        data: {
          roles: [UserRole.ADMIN],
        },
        children: [
          {
            path: '',
            loadComponent: () => import('./features/managers/managers').then((c) => c.Managers),
          },
          {
            path: ':userId',
            loadComponent: () =>
              import('./features/managers/manager-detail/manager-detail').then(
                (c) => c.ManagerDetail,
              ),
          },
        ],
      },
    ],
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  {
    path: '**',
    redirectTo: 'login',
  },
];
