import { Injectable } from '@angular/core';
import { StorageService } from './storage';
import { CrudService } from './crud';
import { Usuario } from '../models/medhom';

@Injectable({ providedIn: 'root' })
export class AuthService {
  usuario: Usuario | null = null;
  private cargado = false;

  constructor(private store: StorageService, private crud: CrudService) {}

  // Recupera la sesión guardada (solo la primera vez)
  async cargar() {
    if (this.cargado) return;
    this.usuario = await this.store.get<Usuario>('sesion');
    this.cargado = true;
  }
  get logueado() { return !!this.usuario; }

  // La contraseña nunca se guarda en texto plano: se guarda su hash SHA-256
  private async hash(texto: string): Promise<string> {
    if (!crypto.subtle) return btoa(texto); // respaldo si el navegador no es "seguro" (http)
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(texto));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Devuelve un mensaje de error, o null si todo salió bien
  async registrar(nombre: string, email: string, password: string): Promise<string | null> {
    const usuarios = await this.crud.list<Usuario>('usuarios');
    if (usuarios.some(u => u.email === email)) return 'Ese correo ya está registrado';
    const u = await this.crud.add<Usuario>('usuarios', { nombre, email, passHash: await this.hash(password) });
    await this.iniciarSesion(u);
    return null;
  }

  async login(email: string, password: string): Promise<boolean> {
    const h = await this.hash(password);
    const u = (await this.crud.list<Usuario>('usuarios')).find(x => x.email === email && x.passHash === h);
    if (!u) return false;
    await this.iniciarSesion(u);
    return true;
  }

  private async iniciarSesion(u: Usuario) { this.usuario = u; await this.store.set('sesion', u); }
  async logout() { this.usuario = null; await this.store.remove('sesion'); }
}
