import { Component, OnDestroy } from '@angular/core';
import { IONIC } from '../../shared/ionic';
import { IonRange } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import jsQR from 'jsqr';
import { Podcast } from '../../models/podcast';

@Component({
  selector: 'app-multimedia',
  templateUrl: './multimedia.page.html',
imports: [IONIC, IonRange],
})
export class MultimediaPage implements OnDestroy {
  // Para producción: guarda mp3 propios en src/assets/audio/ y usa 'assets/audio/archivo.mp3'
  podcasts: Podcast[] = [
    { id: 1, titulo: 'Hábitos saludables', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
    { id: 2, titulo: 'Cómo dormir mejor', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  ];
  actual: Podcast | null = null;
  audio = new Audio();
  reproduciendo = false;
  progreso = 0;
  foto = '';
  qrTexto = '';

  constructor() {
    this.audio.ontimeupdate = () =>
      (this.progreso = this.audio.duration ? (this.audio.currentTime / this.audio.duration) * 100 : 0);
    this.audio.onended = () => (this.reproduciendo = false);
  }

  // ---------- AUDIO ----------
  reproducir(p: Podcast) {
    if (this.actual?.id !== p.id) { this.audio.src = p.url; this.actual = p; }
    this.audio.play(); this.reproduciendo = true;
  }
  pausar() { this.audio.pause(); this.reproduciendo = false; }
  detener() { this.audio.pause(); this.audio.currentTime = 0; this.reproduciendo = false; }
  buscar(ev: any) { if (this.audio.duration) this.audio.currentTime = (ev.detail.value / 100) * this.audio.duration; }

  // ---------- CÁMARA ----------
  async tomarFoto() {
    const img = await Camera.getPhoto({ quality: 70, resultType: CameraResultType.DataUrl, source: CameraSource.Prompt });
    this.foto = img.dataUrl ?? '';
  }

  // ---------- QR: foto -> canvas -> jsQR ----------
  async escanearQR() {
    const img = await Camera.getPhoto({ quality: 90, resultType: CameraResultType.DataUrl, source: CameraSource.Camera });
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.width; canvas.height = image.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(image, 0, 0);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(data.data, data.width, data.height);
      this.qrTexto = code ? code.data : 'No se detectó ningún QR';
    };
    image.src = img.dataUrl!;
  }

  ngOnDestroy() { this.audio.pause(); }
}
