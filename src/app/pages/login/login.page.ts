import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { IONIC } from '../../shared/ionic';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  imports: [FormsModule, IONIC],
})
export class LoginPage {
  modo: 'login' | 'registro' = 'login';
  nombre = ''; email = ''; password = ''; error = '';

  constructor(private auth: AuthService, private nav: NavController) {}

  async enviar() {
    this.error = '';
    const email = this.email.trim().toLowerCase();
    if (!email || this.password.length < 4) {
      this.error = 'Escribe tu correo y una contraseña de mínimo 4 caracteres';
      return;
    }
    if (this.modo === 'registro') {
      if (!this.nombre.trim()) { this.error = 'Escribe tu nombre'; return; }
      const err = await this.auth.registrar(this.nombre.trim(), email, this.password);
      if (err) { this.error = err; return; }
    } else if (!(await this.auth.login(email, this.password))) {
      this.error = 'Correo o contraseña incorrectos';
      return;
    }
    this.nav.navigateRoot('/tabs/inicio'); // entra a la app
  }
}
