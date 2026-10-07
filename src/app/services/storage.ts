import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private ready: Promise<Storage>;

  constructor(storage: Storage) {
    this.ready = storage.create(); // inicializa la base local
  }

  async set(key: string, value: any) { const s = await this.ready; await s.set(key, value); }
  async get<T>(key: string): Promise<T | null> { const s = await this.ready; return s.get(key); }
  async remove(key: string) { const s = await this.ready; await s.remove(key); }
}