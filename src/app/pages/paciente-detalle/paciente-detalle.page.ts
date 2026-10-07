import { Component } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Camera } from '@capacitor/camera';
import { IONIC } from '../../shared/ionic';
import { CrudService } from '../../services/crud';
import { Paciente, Consulta, Receta, Factura, Medico } from '../../models/medhom';

@Component({
  selector: 'app-paciente-detalle',
  templateUrl: './paciente-detalle.page.html',
  imports: [FormsModule, IONIC, DatePipe, DecimalPipe],
})
export class PacienteDetallePage {
  p: Paciente | null = null;
  consultas: Consulta[] = [];
  recetas: Receta[] = [];
  facturas: Factura[] = [];
  medicos: Medico[] = [];
  vista: 'consultas' | 'recetas' | 'facturas' = 'consultas';
  mensaje = '';

  constructor(private route: ActivatedRoute, private crud: CrudService) {}

  async ionViewWillEnter() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.p = (await this.crud.get<Paciente>('pacientes', id)) ?? null;
    // Historia clínica = todo lo que pertenece a este paciente
    this.consultas = (await this.crud.list<Consulta>('consultas')).filter(x => x.pacienteId === id);
    this.recetas = (await this.crud.list<Receta>('recetas')).filter(x => x.pacienteId === id);
    this.facturas = (await this.crud.list<Factura>('facturas')).filter(x => x.pacienteId === id);
    this.medicos = await this.crud.list<Medico>('medicos');
  }

  nombreMedico(id: number) { return this.medicos.find(m => m.id === id)?.nombre ?? '—'; }

  get edad(): string {
    if (!this.p?.fechaNac) return '';
    const n = new Date(this.p.fechaNac), h = new Date();
    let e = h.getFullYear() - n.getFullYear();
    const m = h.getMonth() - n.getMonth();
    if (m < 0 || (m === 0 && h.getDate() < n.getDate())) e--;
    return e + ' años';
  }

  async guardar() {
    if (!this.p) return;
    await this.crud.update<Paciente>('pacientes', this.p);
    this.mensaje = 'Cambios guardados';
  }

  // Foto del paciente con la cámara
  async foto() {
    if (!this.p) return;
    try {
      const r = await Camera.takePhoto({ quality: 60, targetWidth: 400, targetHeight: 400 });
      // thumbnail es base64 (persiste); si no existe se usa webPath
      this.p.foto = r.thumbnail ? 'data:image/jpeg;base64,' + r.thumbnail : r.webPath;
      await this.guardar();
    } catch (e) { console.log('Foto cancelada', e); }
  }
}
