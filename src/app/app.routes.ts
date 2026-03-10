import { Routes } from '@angular/router';
import { Login } from './core/auth/login/login';
import { DashboradLayout } from './core/layout/dashborad-layout/dashborad-layout';

export const routes: Routes = [
  { path: 'login', component: Login },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./core/layout/dashborad-layout/dashborad-layout').then((c) => c.DashboradLayout),
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
