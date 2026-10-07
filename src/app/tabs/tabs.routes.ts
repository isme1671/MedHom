import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      { path: 'inicio', loadComponent: () => import('../pages/inicio/inicio.page').then(m => m.InicioPage) },
      { path: 'pacientes', loadComponent: () => import('../pages/pacientes/pacientes.page').then(m => m.PacientesPage) },
      { path: 'paciente/:id', loadComponent: () => import('../pages/paciente-detalle/paciente-detalle.page').then(m => m.PacienteDetallePage) },
      { path: 'citas', loadComponent: () => import('../pages/citas/citas.page').then(m => m.CitasPage) },
      { path: 'mapa', loadComponent: () => import('../pages/mapa/mapa.page').then(m => m.MapaPage) },
      { path: 'mas', loadComponent: () => import('../pages/mas/mas.page').then(m => m.MasPage) },
      { path: 'medicos', loadComponent: () => import('../pages/medicos/medicos.page').then(m => m.MedicosPage) },
      { path: 'consultas', loadComponent: () => import('../pages/consultas/consultas.page').then(m => m.ConsultasPage) },
      { path: 'recetas', loadComponent: () => import('../pages/recetas/recetas.page').then(m => m.RecetasPage) },
      { path: 'facturacion', loadComponent: () => import('../pages/facturacion/facturacion.page').then(m => m.FacturacionPage) },
      { path: 'multimedia', loadComponent: () => import('../pages/multimedia/multimedia.page').then(m => m.MultimediaPage) },
      { path: 'perfil', loadComponent: () => import('../pages/perfil/perfil.page').then(m => m.PerfilPage) },
      { path: '', redirectTo: '/tabs/inicio', pathMatch: 'full' },
    ],
  },
  { path: '', redirectTo: '/tabs/inicio', pathMatch: 'full' },
];
