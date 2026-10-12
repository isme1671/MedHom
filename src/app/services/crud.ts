import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { StorageService } from './storage';

@Injectable({ providedIn: 'root' })
export class CrudService {
  
  private cambios = new Subject<string>();
  cambios$ = this.cambios.asObservable();

  constructor(private store: StorageService) {}

  private async guardar(col: string, lista: any[]) {
    await this.store.set(col, lista);
    this.cambios.next(col);
  }

  
  async list<T>(col: string): Promise<T[]> { return (await this.store.get<T[]>(col)) ?? []; }

  // READ: un elemento por id
  async get<T extends { id: number }>(col: string, id: number): Promise<T | undefined> {
    return (await this.list<T>(col)).find(x => x.id === id);
  }


  async add<T extends { id: number }>(col: string, item: Omit<T, 'id'>): Promise<T> {
    const lista = await this.list<T>(col);
    const nuevo = { ...item, id: Date.now() } as unknown as T;
    lista.push(nuevo);
    await this.guardar(col, lista);
    return nuevo;
  }

  // UPDATE
  async update<T extends { id: number }>(col: string, item: T) {
    const lista = (await this.list<T>(col)).map(x => (x.id === item.id ? item : x));
    await this.guardar(col, lista);
  }

  // DELETE
  async remove<T extends { id: number }>(col: string, id: number) {
    const lista = (await this.list<T>(col)).filter(x => x.id !== id);
    await this.guardar(col, lista);
  }
}
