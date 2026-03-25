import { Routes } from '@angular/router';
import { Login } from './core/auth/login/login';
import { authGuard } from './core/guards/auth-guard';
import { DashboradLayout } from './layout/dashboard-layout/dashboard-layout';

export const routes: Routes = [
  { path: 'login', component: Login },
  {
    path: '',
    component: DashboradLayout,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'customers', pathMatch: 'full' },
      {
        path: 'customers',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/customers/customers').then((c) => c.Customers),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./features/customers/customer-detail/customer-detail').then(
                (c) => c.CustomerDetail,
              ),
          },
        ],
      },
      {
        path: 'tickets',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/tickets/tickets').then((c) => c.Tickets),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./features/tickets/ticket-detail/ticket-detail').then((c) => c.TicketDetail),
          },
        ],
      },
      {
        path: 'users',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/users/users').then((c) => c.Users),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./features/users/user-detail/user-detail').then((c) => c.UserDetail),
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
