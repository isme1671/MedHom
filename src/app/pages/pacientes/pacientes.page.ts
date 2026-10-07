import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { IONIC } from '../../shared/ionic';
import { CrudService } from '../../services/crud';
import { Paciente } from '../../models/medhom';

@Component({
  selector: 'app-pacientes',
  templateUrl: './pacientes.page.html',
  imports: [FormsModule, IONIC],
})
export class PacientesPage {
  pacientes: Paciente[] = [];
  filtro = '';
  abierto = false;
  nuevo: Partial<Paciente> = this.vacio();

  constructor(private crud: CrudService, private nav: NavController) {}

  ionViewWillEnter() { this.cargar(); }

  private vacio(): Partial<Paciente> {
    return { nombre: '', cedula: '', fechaNac: '', telefono: '', tipoSangre: '', alergias: '', antecedentes: '' };
  }

  async cargar(ev?: any) {
    this.pacientes = await this.crud.list<Paciente>('pacientes');
    ev?.target.complete();
  }

  // Búsqueda por nombre o cédula
  get filtrados() {
    const f = this.filtro.toLowerCase();
    return this.pacientes.filter(p => (p.nombre + ' ' + p.cedula).toLowerCase().includes(f));
  }

  abrir() { this.nuevo = this.vacio(); this.abierto = true; }

  async guardar() {
    if (!this.nuevo.nombre?.trim()) return;
    await this.crud.add<Paciente>('pacientes', this.nuevo as Omit<Paciente, 'id'>);
    this.abierto = false;
    this.cargar();
  }

  async eliminar(p: Paciente) { await this.crud.remove('pacientes', p.id); this.cargar(); }

  ver(p: Paciente) { this.nav.navigateForward(['/tabs/paciente', p.id]); }
}
