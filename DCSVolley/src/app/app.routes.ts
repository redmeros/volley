import { Routes } from '@angular/router';
import { canActivateAdmin } from './admin/admin.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'tournaments',
    pathMatch: 'full',
  },
  {
    path: "admin",
    loadComponent: () => import("./admin/admin.page").then((m) => m.AdminPage),
    canActivate: [canActivateAdmin],
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'tournaments',
    loadComponent: () =>
      import('./tournaments/tournaments.page').then((m) => m.TournamentsPage),
  },
  // {
  //   path: '',
  //   redirectTo: 'folder/inbox',
  //   pathMatch: 'full',
  // },
  // {
  //   path: 'folder/:id',
  //   loadComponent: () =>
  //     import('./folder/folder.page').then((m) => m.FolderPage),
  // },
];
