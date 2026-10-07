import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
import { BleClient } from '@capacitor-community/bluetooth-le';
import { IONIC } from '../../shared/ionic';
import { StorageService } from '../../services/storage';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  imports: [FormsModule, IONIC],
})
export class PerfilPage implements OnInit {
  perfil = { nombre: '', tipoSangre: '', alergias: '' };
  oscuro = false;
  dispositivos: { nombre: string; id: string; rssi?: number }[] = [];
  buscando = false;
  mensaje = '';

  constructor(
    private store: StorageService, public auth: AuthService, private nav: NavController,
    private zone: NgZone, private cdr: ChangeDetectorRef,
  ) {}

  async ngOnInit() {
    this.perfil = (await this.store.get<any>('perfil')) ?? this.perfil;
    this.oscuro = (await this.store.get<boolean>('oscuro')) ?? false;
  }

  async guardar() { await this.store.set('perfil', this.perfil); this.mensaje = 'Perfil guardado'; }

  async cambiarTema() {
    document.documentElement.classList.toggle('ion-palette-dark', this.oscuro);
    await this.store.set('oscuro', this.oscuro);
  }

  async salir() {
    await this.auth.logout();
    this.nav.navigateRoot('/login');
  }

  // Actualiza la pantalla aunque el aviso llegue desde el plugin nativo
  private actualizar(fn: () => void) {
    this.zone.run(() => { fn(); this.cdr.markForCheck(); });
  }

  // ---------- BLE ----------
  async escanearBLE() {
    this.dispositivos = [];
    this.buscando = true;
    this.mensaje = '';
    try {
      // Debe coincidir con el permiso "neverForLocation" del AndroidManifest
      await BleClient.initialize({ androidNeverForLocation: true });

      if (Capacitor.isNativePlatform()) {
        // Si el Bluetooth está apagado, Android pide encenderlo
        if (!(await BleClient.isEnabled())) await BleClient.enable();

        await BleClient.requestLEScan({}, r => this.actualizar(() => {
          // El mismo dispositivo se reporta muchas veces: se agrega una sola vez
          if (!this.dispositivos.some(d => d.id === r.device.deviceId)) {
            this.dispositivos = [...this.dispositivos, {
              nombre: r.device.name ?? r.localName ?? 'Sin nombre',
              id: r.device.deviceId,
              rssi: r.rssi,
            }];
          }
        }));

        // Escanea 8 segundos y se detiene
        setTimeout(async () => {
          await BleClient.stopLEScan();
          this.actualizar(() => {
            this.buscando = false;
            this.mensaje = this.dispositivos.length
              ? `Se encontraron ${this.dispositivos.length} dispositivo(s)`
              : 'No se encontraron dispositivos BLE cercanos';
          });
        }, 8000);
      } else {
        // En navegador (Chrome): selector de Web Bluetooth
        const d = await BleClient.requestDevice();
        this.dispositivos = [{ nombre: d.name ?? 'Sin nombre', id: d.deviceId }];
        this.buscando = false;
      }
    } catch (e: any) {
      this.actualizar(() => { this.mensaje = 'BLE: ' + (e?.message ?? e); this.buscando = false; });
    }
  }
}

