import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { IONIC } from '../../shared/ionic';

@Component({
  selector: 'app-mas',
  templateUrl: './mas.page.html',
  imports: [IONIC],
})
export class MasPage {
  opciones = [
    { titulo: 'Médicos', icono: 'medkit-outline', ruta: '/tabs/medicos' },
    { titulo: 'Consultas', icono: 'pulse-outline', ruta: '/tabs/consultas' },
    { titulo: 'Recetas', icono: 'document-text-outline', ruta: '/tabs/recetas' },
    { titulo: 'Facturación', icono: 'receipt-outline', ruta: '/tabs/facturacion' },
    { titulo: 'Salud (multimedia y QR)', icono: 'headset-outline', ruta: '/tabs/multimedia' },
    { titulo: 'Mi perfil', icono: 'person-circle-outline', ruta: '/tabs/perfil' },
  ];

  constructor(private nav: NavController) {}
  ir(ruta: string) { this.nav.navigateForward(ruta); }
}