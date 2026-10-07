import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IONIC } from '../../shared/ionic';
import { CrudService } from '../../services/crud';
import { Medico } from '../../models/medhom';

@Component({
  selector: 'app-medicos',
  templateUrl: './medicos.page.html',
  imports: [FormsModule, IONIC],
})
export class MedicosPage {
  medicos: Medico[] = [];
  abierto = false;
  nuevo: Partial<Medico> = {};

  constructor(private crud: CrudService) {}

  ionViewWillEnter() { this.cargar(); }
  async cargar(ev?: any) { this.medicos = await this.crud.list<Medico>('medicos'); ev?.target.complete(); }

  abrir() { this.nuevo = { nombre: '', especialidad: '', telefono: '' }; this.abierto = true; }

  async guardar() {
    if (!this.nuevo.nombre?.trim()) return;
    await this.crud.add<Medico>('medicos', this.nuevo as Omit<Medico, 'id'>);
    this.abierto = false;
    this.cargar();
  }
  async eliminar(m: Medico) { await this.crud.remove('medicos', m.id); this.cargar(); }
}
