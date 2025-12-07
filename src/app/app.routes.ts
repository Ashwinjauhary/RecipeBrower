import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', loadComponent: () => import('./pages/home/home.component').then(c => c.HomeComponent) },
  { path: 'search', loadComponent: () => import('./pages/search/search.component').then(c => c.SearchComponent) },
  { path: 'recipe/:id', loadComponent: () => import('./pages/details/details.component').then(c => c.DetailsComponent) },
  { path: 'favorites', loadComponent: () => import('./pages/favorites/favorites.component').then(c => c.FavoritesComponent) },
  { path: '**', redirectTo: '/home' }
];
