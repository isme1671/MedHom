import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Noticia } from '../models/noticias';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private url = 'https://jsonplaceholder.typicode.com/posts'; // API de prueba
  constructor(private http: HttpClient) {}

  // GET: lista de "noticias de salud"
  getNoticias(): Observable<Noticia[]> {
    return this.http.get<any[]>(this.url).pipe(
      map(posts => posts.slice(0, 15).map(p => ({
        id: p.id,
        titulo: p.title,
        resumen: p.body,
        fecha: new Date(),
      })))
    );
  }

  // POST: enviar una consulta al servidor
  enviarConsulta(asunto: string, mensaje: string): Observable<any> {
    return this.http.post(this.url, { title: asunto, body: mensaje, userId: 1 });
  }
}
