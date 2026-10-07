import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IONIC } from '../../shared/ionic';
import { CrudService } from '../../services/crud';
import { Receta, Medicamento, Paciente, Medico } from '../../models/medhom';

@Component({
  selector: 'app-recetas',
  templateUrl: './recetas.page.html',
  imports: [FormsModule, IONIC, DatePipe],
})
export class RecetasPage {
  recetas: Receta[] = [];
  pacientes: Paciente[] = [];
  medicos: Medico[] = [];
  abierto = false;
  pacienteId?: number;
  medicoId?: number;
  meds: Medicamento[] = [];

  constructor(private crud: CrudService) {}

  ionViewWillEnter() { this.cargar(); }

  async cargar(ev?: any) {
    this.recetas = (await this.crud.list<Receta>('recetas')).reverse();
    this.pacientes = await this.crud.list<Paciente>('pacientes');
    this.medicos = await this.crud.list<Medico>('medicos');
    ev?.target.complete();
  }

  nombrePaciente(id: number) { return this.pacientes.find(p => p.id === id)?.nombre ?? '—'; }
  nombreMedico(id: number) { return this.medicos.find(m => m.id === id)?.nombre ?? '—'; }

  abrir() {
    this.pacienteId = undefined; this.medicoId = undefined;
    this.meds = [{ nombre: '', dosis: '', frecuencia: '' }];
    this.abierto = true;
  }
  agregarMed() { this.meds.push({ nombre: '', dosis: '', frecuencia: '' }); }
  quitarMed(i: number) { this.meds.splice(i, 1); }

  async guardar() {
    const medicamentos = this.meds.filter(m => m.nombre.trim());
    if (!this.pacienteId || !this.medicoId || !medicamentos.length) return;
    await this.crud.add<Receta>('recetas', {
      pacienteId: this.pacienteId, medicoId: this.medicoId,
      fecha: new Date().toISOString(), medicamentos,
    });
    this.abierto = false;
    this.cargar();
  }
  async eliminar(r: Receta) { await this.crud.remove('recetas', r.id); this.cargar(); }
}
