import { Injectable, inject } from '@angular/core';
import { ToastController } from '@ionic/angular/lazy';

@Injectable({ providedIn: 'root' })
export class UiService {
  private toastCtrl = inject(ToastController);

  async toast(message: string, color: 'dark' | 'success' | 'danger' = 'dark', duration = 1500) {
    const t = await this.toastCtrl.create({ message, duration, color, position: 'bottom' });
    await t.present();
  }
}
