import { Component, OnDestroy } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonBadge, IonFab, IonFabButton, IonIcon
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { locate } from 'ionicons/icons';
import { Network } from '@capacitor/network';
import { Geolocation } from '@capacitor/geolocation';
import * as L from 'leaflet';

// Arreglo del icono por defecto de Leaflet
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.page.html',
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonBadge, IonFab, IonFabButton, IonIcon],
})
export class MapaPage implements OnDestroy {
  online = true;
  aviso = '';
  private map!: L.Map;
  private listener: any;

  // REEMPLAZA con clínicas reales (Google Maps → clic derecho → copiar coordenadas)
  clinicas = [
    { nombre: 'Clínica Central', lat: 18.4861, lng: -69.9312, info: 'Urgencias 24h' },
    { nombre: 'Centro Médico Norte', lat: 18.5001, lng: -69.9100, info: 'Consultas generales' },
  ];

  constructor() { addIcons({ locate }); }

  async ionViewDidEnter() {
    // --- Red ---
    this.online = (await Network.getStatus()).connected;
    this.listener = await Network.addListener('networkStatusChange', s => (this.online = s.connected));

    // --- Mapa ---
    if (this.map) { this.map.invalidateSize(); return; }
    this.map = L.map('mapa').setView([this.clinicas[0].lat, this.clinicas[0].lng], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(this.map);
    this.clinicas.forEach(c =>
      L.marker([c.lat, c.lng]).addTo(this.map).bindPopup(`<b>${c.nombre}</b><br>${c.info}`));
    setTimeout(() => this.map.invalidateSize(), 300);
  }

  async miUbicacion() {
    try {
      const pos = await Geolocation.getCurrentPosition();
      const { latitude, longitude } = pos.coords;
      L.circleMarker([latitude, longitude], { radius: 9, color: '#2563eb' }).addTo(this.map).bindPopup('Estás aquí').openPopup();
      this.map.setView([latitude, longitude], 15);
      this.revisarCercania(latitude, longitude);
    } catch { this.aviso = 'No se pudo obtener la ubicación (revisa permisos).'; }
  }

  // "Geofencing" simple: avisa si estás a menos de 300 m de una clínica
  private revisarCercania(lat: number, lng: number) {
    this.aviso = '';
    for (const c of this.clinicas) {
      const d = this.distancia(lat, lng, c.lat, c.lng);
      if (d < 300) this.aviso = `Estás a ${Math.round(d)} m de ${c.nombre}`;
    }
  }
  // Fórmula de Haversine (distancia en metros)
  private distancia(la1: number, lo1: number, la2: number, lo2: number) {
    const R = 6371000, r = Math.PI / 180;
    const a = Math.sin((la2 - la1) * r / 2) ** 2 +
      Math.cos(la1 * r) * Math.cos(la2 * r) * Math.sin((lo2 - lo1) * r / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
  }

  ngOnDestroy() { this.listener?.remove(); }
}