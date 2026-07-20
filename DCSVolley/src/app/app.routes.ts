import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'tournaments',
    pathMatch: 'full',
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
