import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  homeOutline, peopleOutline, calendarOutline, mapOutline, gridOutline, add, trashOutline,
  medkitOutline, pulseOutline, documentTextOutline, receiptOutline, headsetOutline,
  personCircleOutline, logOutOutline, cameraOutline, qrCodeOutline,
} from 'ionicons/icons';
import { StorageService } from './services/storage';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  constructor(private store: StorageService) {
    addIcons({
      homeOutline, peopleOutline, calendarOutline, mapOutline, gridOutline, add, trashOutline,
      medkitOutline, pulseOutline, documentTextOutline, receiptOutline, headsetOutline,
      personCircleOutline, logOutOutline, cameraOutline, qrCodeOutline,
    });
  }

  async ngOnInit() {
    const oscuro = await this.store.get<boolean>('oscuro');
    document.documentElement.classList.toggle('ion-palette-dark', !!oscuro);
  }
}