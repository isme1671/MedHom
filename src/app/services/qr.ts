import { Injectable } from '@angular/core';
import { Camera } from '@capacitor/camera';
import { toDataURL } from 'qrcode';
import jsQR from 'jsqr';

@Injectable({ providedIn: 'root' })
export class QrService {
  // Todo QR de MedHom empieza con este texto, seguido del id de la cita
  static readonly PREFIJO = 'MEDHOM-CITA:';

  // Genera la imagen del QR (en base64) para una cita
  generar(idCita: number): Promise<string> {
    return toDataURL(QrService.PREFIJO + idCita, { width: 300, margin: 2 });
  }

  // Obtiene una foto (cámara o galería) y devuelve el texto del QR, o null si no encuentra ninguno
  async leer(origen: 'camara' | 'galeria'): Promise<string | null> {
    let url: string | undefined;
    if (origen === 'camara') {
      url = (await Camera.takePhoto({ quality: 90 })).webPath;
    } else {
      const { results } = await Camera.chooseFromGallery({ quality: 90 });
      url = results[0]?.webPath;
    }
if (!url) return null; // no se obtuvo ninguna imagen
    const img = await this.cargarImagen(url);
    // Se reduce la imagen para que jsQR trabaje rápido
    const escala = Math.min(1, 1200 / Math.max(img.width, img.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.width * escala);
    canvas.height = Math.round(img.height * escala);
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const datos = ctx.getImageData(0, 0, canvas.width, canvas.height);
    return jsQR(datos.data, datos.width, datos.height)?.data ?? null;
  }

  private cargarImagen(url: string): Promise<HTMLImageElement> {
    return new Promise((ok, fallo) => {
      const i = new Image();
      i.onload = () => ok(i);
      i.onerror = fallo;
      i.src = url;
    });
  }
}
