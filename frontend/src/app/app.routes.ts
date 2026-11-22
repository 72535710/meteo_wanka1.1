import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'inicio',
    pathMatch: 'full'
  },
  {
    path: 'inicio',
    loadComponent: () => import('./features/inicio/inicio.component').then(m => m.InicioComponent),
    title: 'Inicio · METEO WANKA 1.1'
  },
  {
    path: 'alertas',
    loadComponent: () => import('./features/alertas/alertas.component').then(m => m.AlertasComponent),
    title: 'Alertas Agroclimáticas · METEO WANKA 1.1'
  },
  {
    path: 'bitacora',
    loadComponent: () => import('./features/bitacora/bitacora.component').then(m => m.BitacoraComponent),
    title: 'Bitácora de Eventos · METEO WANKA 1.1'
  },
  {
    path: 'cultivos',
    loadComponent: () => import('./features/cultivos/cultivos.component').then(m => m.CultivosComponent),
    title: 'Guía de Cultivos · METEO WANKA 1.1'
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin.component').then(m => m.AdminComponent),
    title: 'Administración · METEO WANKA 1.1'
  },
  {
    path: '**',
    redirectTo: 'inicio'
  }
];
