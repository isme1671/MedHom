import { Component } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertController, ToastController } from '@ionic/angular';
import { IONIC } from '../../shared/ionic';
import { CrudService } from '../../services/crud';
import { Factura, Paciente } from '../../models/medhom';

@Component({
  selector: 'app-facturacion',
  templateUrl: './facturacion.page.html',
  imports: [FormsModule, IONIC, DatePipe, DecimalPipe],
})
export class FacturacionPage {
  facturas: Factura[] = [];
  pacientes: Paciente[] = [];
  abierto = false;
  nueva: Partial<Factura> = {};
  filtro: 'todas' | 'pendientes' | 'cobradas' = 'todas';

  constructor(
    private crud: CrudService,
    private alertCtrl: AlertController,
    private toast: ToastController,
  ) {}

  ionViewWillEnter() { this.cargar(); }

  async cargar(ev?: any) {
    this.facturas = (await this.crud.list<Factura>('facturas')).reverse();
    this.pacientes = await this.crud.list<Paciente>('pacientes');
    ev?.target.complete();
  }

  nombrePaciente(id: number) { return this.pacientes.find(p => p.id === id)?.nombre ?? '—'; }

  // Lista según el filtro elegido
  get lista() {
    return this.facturas.filter(f =>
      this.filtro === 'todas' || (this.filtro === 'pendientes' ? !f.pagada : f.pagada));
  }
  get pendientes() { return this.facturas.filter(f => !f.pagada); }
  get pendiente() { return this.pendientes.reduce((s, f) => s + f.monto, 0); }
  get cobrado() { return this.facturas.filter(f => f.pagada).reduce((s, f) => s + f.monto, 0); }

  abrir() { this.nueva = { concepto: '' }; this.abierto = true; }

  async guardar() {
    const n = this.nueva;
    const monto = Number(n.monto);
    if (!n.pacienteId || !n.concepto?.trim() || !(monto > 0)) return;
    await this.crud.add<Factura>('facturas', {
      pacienteId: n.pacienteId, concepto: n.concepto, monto,
      fecha: new Date().toISOString(), pagada: false,
    });
    this.abierto = false;
    this.cargar();
  }

  // ---------- COBRO ----------
  // Muestra una alerta con el método de pago. Devuelve el método elegido, o null si se cancela.
  private async pedirMetodo(titulo: string, mensaje: string): Promise<string | null> {
    const alerta = await this.alertCtrl.create({
      header: titulo,
      message: mensaje,
      inputs: ['Efectivo', 'Tarjeta', 'Transferencia'].map((m, i) => ({
        type: 'radio' as const, label: m, value: m, checked: i === 0,
      })),
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Cobrar', role: 'confirm' },
      ],
    });
    await alerta.present();
    const { role, data } = await alerta.onDidDismiss();
    return role === 'confirm' ? data.values : null;
  }

  private async marcarPagada(f: Factura, metodo: string) {
    f.pagada = true;
    f.metodoPago = metodo;
    f.fechaPago = new Date().toISOString();
    await this.crud.update<Factura>('facturas', f);
  }

  private async avisar(mensaje: string) {
    const t = await this.toast.create({ message: mensaje, duration: 2500 });
    t.present();
  }

  // Cobrar UNA factura
  async cobrar(f: Factura) {
    const metodo = await this.pedirMetodo('Cobrar factura', `${f.concepto} · RD$ ${f.monto.toFixed(2)}`);
    if (!metodo) return;
    await this.marcarPagada(f, metodo);
    await this.cargar();
    this.avisar(`Factura cobrada (${metodo})`);
  }

  // Cobrar TODO lo pendiente
  async cobrarTodo() {
    const pend = this.pendientes;
    if (!pend.length) return;
    const metodo = await this.pedirMetodo(
      'Cobrar todo lo pendiente',
      `${pend.length} factura(s) · RD$ ${this.pendiente.toFixed(2)}`,
    );
    if (!metodo) return;
    for (const f of pend) await this.marcarPagada(f, metodo);
    await this.cargar();
    this.avisar(`${pend.length} factura(s) cobradas (${metodo})`);
  }

  async eliminar(f: Factura) { await this.crud.remove('facturas', f.id); this.cargar(); }
}