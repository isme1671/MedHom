import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IONIC } from '../../shared/ionic';
import { CrudService } from '../../services/crud';
import { Consulta, Paciente, Medico } from '../../models/medhom';

@Component({
  selector: 'app-consultas',
  templateUrl: './consultas.page.html',
  imports: [FormsModule, IONIC, DatePipe],
})
export class ConsultasPage {
  consultas: Consulta[] = [];
  pacientes: Paciente[] = [];
  medicos: Medico[] = [];
  abierto = false;
  nueva: Partial<Consulta> = {};

  constructor(private crud: CrudService) {}

  ionViewWillEnter() { this.cargar(); }

  async cargar(ev?: any) {
    this.consultas = (await this.crud.list<Consulta>('consultas')).reverse(); // las más nuevas primero
    this.pacientes = await this.crud.list<Paciente>('pacientes');
    this.medicos = await this.crud.list<Medico>('medicos');
    ev?.target.complete();
  }

  nombrePaciente(id: number) { return this.pacientes.find(p => p.id === id)?.nombre ?? '—'; }
  nombreMedico(id: number) { return this.medicos.find(m => m.id === id)?.nombre ?? '—'; }

  abrir() { this.nueva = { diagnostico: '', notas: '' }; this.abierto = true; }

  async guardar() {
    const n = this.nueva;
    if (!n.pacienteId || !n.medicoId || !n.diagnostico?.trim()) return;
    await this.crud.add<Consulta>('consultas', { ...n, fecha: new Date().toISOString() } as Omit<Consulta, 'id'>);
    this.abierto = false;
    this.cargar();
  }
  async eliminar(c: Consulta) { await this.crud.remove('consultas', c.id); this.cargar(); }
}
