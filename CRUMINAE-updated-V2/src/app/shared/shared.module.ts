import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular/lazy';
import { CookieCardComponent } from './cookie-card.component';
import { PageHeaderComponent } from './page-header.component';
import { PesoPipe } from './peso.pipe';

@NgModule({
  imports: [CommonModule, RouterModule, IonicModule],
  declarations: [CookieCardComponent, PageHeaderComponent, PesoPipe],
  exports: [CookieCardComponent, PageHeaderComponent, PesoPipe],
})
export class SharedModule {}
