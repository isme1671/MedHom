import { Component, OnDestroy } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { IONIC } from '../../shared/ionic';
import { AuthService } from '../../services/auth';
import { CrudService } from '../../services/crud';
import { ApiService } from '../../services/api';
import { Noticia } from '../../models/noticias';
import { Paciente, Medico, Cita, Consulta, Receta, Factura } from '../../models/medhom';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  imports: [IONIC, DecimalPipe, DatePipe],
})
export class InicioPage implements OnDestroy {
  stats = {
    pacientes: 0, medicos: 0, citasPendientes: 0, citasHoy: 0,
    consultas: 0, recetas: 0, cobrado: 0, porCobrar: 0,
  };
  pctCobrado = 0;
  pendientes: { id: number; fecha: string; paciente: string; medico: string; motivo: string }[] = [];
  ultimas: { id: number; fecha: string; paciente: string; diagnostico: string }[] = [];

  noticias: Noticia[] = [];
  cargando = false;
  error = '';
  private sub: Subscription;

  constructor(
    public auth: AuthService, private crud: CrudService,
    private api: ApiService, private toast: ToastController,
  ) {
    // Cada vez que se guarda, edita o elimina algo en cualquier pantalla, se recalcula el dashboard
    this.sub = this.crud.cambios$.subscribe(() => this.cargarStats());
  }

  ngOnDestroy() { this.sub.unsubscribe(); }

  ionViewWillEnter() {
    this.cargarStats();
    if (!this.noticias.length) this.cargarNoticias();
  }

  async cargarStats() {
    const [pac, med, cit, con, rec, fac] = await Promise.all([
      this.crud.list<Paciente>('pacientes'), this.crud.list<Medico>('medicos'),
      this.crud.list<Cita>('citas'), this.crud.list<Consulta>('consultas'),
      this.crud.list<Receta>('recetas'), this.crud.list<Factura>('facturas'),
    ]);

    // Fecha de hoy en formato local AAAA-MM-DD (igual que el campo de fecha de las citas)
    const d = new Date();
    const hoy = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    const pend = cit.filter(c => c.estado === 'pendiente').sort((a, b) => a.fecha.localeCompare(b.fecha));
    const cobrado = fac.filter(f => f.pagada).reduce((s, f) => s + f.monto, 0);
    const porCobrar = fac.filter(f => !f.pagada).reduce((s, f) => s + f.monto, 0);

    this.stats = {
      pacientes: pac.length, medicos: med.length,
      citasPendientes: pend.length,
      citasHoy: pend.filter(c => c.fecha.startsWith(hoy)).length,
      consultas: con.length, recetas: rec.length,
      cobrado, porCobrar,
    };
    const total = cobrado + porCobrar;
    this.pctCobrado = total ? Math.round((cobrado / total) * 100) : 0;

    const nombreP = (id: number) => pac.find(p => p.id === id)?.nombre ?? '—';
    const nombreM = (id: number) => med.find(m => m.id === id)?.nombre ?? '—';

    this.pendientes = pend.slice(0, 5).map(c => ({
      id: c.id, fecha: c.fecha, paciente: nombreP(c.pacienteId),
      medico: nombreM(c.medicoId), motivo: c.motivo,
    }));
    this.ultimas = [...con].sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 3).map(c => ({
      id: c.id, fecha: c.fecha, paciente: nombreP(c.pacienteId), diagnostico: c.diagnostico,
    }));
  }

  cargarNoticias(ev?: any) {
    this.cargando = !ev;
    this.error = '';
    this.api.getNoticias().subscribe({
      next: n => { this.noticias = n; this.cargando = false; ev?.target.complete(); },
      error: () => { this.error = 'No se pudo cargar. Revisa tu conexión.'; this.cargando = false; ev?.target.complete(); },
    });
  }

  async refrescar(ev: any) { await this.cargarStats(); this.cargarNoticias(ev); }

  // POST a la API
  enviar() {
    this.api.enviarConsulta('Sugerencia MedHom', 'Hola desde la app').subscribe(async r => {
      const t = await this.toast.create({ message: `Enviado (id ${r.id})`, duration: 2000 });
      t.present();
    });
  }
}