import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActionSheetController, ToastController } from '@ionic/angular';
import { IONIC } from '../../shared/ionic';
import { CrudService } from '../../services/crud';
import { QrService } from '../../services/qr';
import { Cita, Paciente, Medico } from '../../models/medhom';

@Component({
  selector: 'app-citas',
  templateUrl: './citas.page.html',
  imports: [FormsModule, IONIC, DatePipe],
})
export class CitasPage {
  citas: Cita[] = [];
  pacientes: Paciente[] = [];
  medicos: Medico[] = [];
  abierto = false;
  nueva: Partial<Cita> = {};

  // QR
  qrAbierto = false;
  qrImg = '';
  qrCita: Cita | null = null;

  constructor(
    private crud: CrudService, private qr: QrService,
    private sheet: ActionSheetController, private toast: ToastController,
  ) {}

  ionViewWillEnter() { this.cargar(); }

  async cargar(ev?: any) {
    this.citas = (await this.crud.list<Cita>('citas')).sort((a, b) => a.fecha.localeCompare(b.fecha));
    this.pacientes = await this.crud.list<Paciente>('pacientes');
    this.medicos = await this.crud.list<Medico>('medicos');
    ev?.target.complete();
  }

  nombrePaciente(id: number) { return this.pacientes.find(p => p.id === id)?.nombre ?? '—'; }
  nombreMedico(id: number) { return this.medicos.find(m => m.id === id)?.nombre ?? '—'; }

  abrir() { this.nueva = { estado: 'pendiente', fecha: '', motivo: '' }; this.abierto = true; }

  async guardar() {
    const n = this.nueva;
    if (!n.pacienteId || !n.medicoId || !n.fecha) return;
    await this.crud.add<Cita>('citas', n as Omit<Cita, 'id'>);
    this.abierto = false;
    this.cargar();
  }

  // Swipe a la derecha: completar. Swipe a la izquierda: cancelar / eliminar
  async cambiarEstado(c: Cita, estado: Cita['estado']) {
    c.estado = estado;
    await this.crud.update<Cita>('citas', c);
  }
  async eliminar(c: Cita) { await this.crud.remove('citas', c.id); this.cargar(); }

  // ---------- QR ----------
  // Muestra el QR de una cita
  async verQR(c: Cita) {
    this.qrCita = c;
    this.qrImg = await this.qr.generar(c.id);
    this.qrAbierto = true;
  }

  // Pregunta si se escanea con la cámara o desde la galería
  async menuEscaner() {
    const hoja = await this.sheet.create({
      header: 'Escanear QR de la cita',
      buttons: [
        { text: 'Usar la cámara', handler: () => { this.escanear('camara'); } },
        { text: 'Elegir imagen de la galería', handler: () => { this.escanear('galeria'); } },
        { text: 'Cancelar', role: 'cancel' },
      ],
    });
    await hoja.present();
  }

  async escanear(origen: 'camara' | 'galeria') {
    try {
      const texto = await this.qr.leer(origen);
      if (!texto || !texto.startsWith(QrService.PREFIJO)) {
        return this.avisar('No se detectó un QR de cita de MedHom', 'danger');
      }
      const id = Number(texto.replace(QrService.PREFIJO, ''));
      const c = await this.crud.get<Cita>('citas', id);
      if (!c) return this.avisar('Esa cita no existe en este dispositivo', 'danger');
      if (c.estado === 'completada') return this.avisar('Esa cita ya estaba completada', 'medium');
      if (c.estado === 'cancelada') return this.avisar('Esa cita está cancelada', 'danger');

      await this.cambiarEstado(c, 'completada');
      await this.cargar();
      this.avisar(`Cita de ${this.nombrePaciente(c.pacienteId)} completada`, 'success');
    } catch (e) {
      console.log('Escaneo cancelado', e); // el usuario cerró la cámara o la galería
    }
  }

  private async avisar(mensaje: string, color: string) {
    const t = await this.toast.create({ message: mensaje, duration: 3000, color });
    t.present();
  }
}
