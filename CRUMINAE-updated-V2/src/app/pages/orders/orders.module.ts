import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular/lazy';
import { SharedModule } from '../../shared/shared.module';
import { OrdersPage } from './orders.page';

@NgModule({
  imports: [
    CommonModule, FormsModule, IonicModule, SharedModule,
    RouterModule.forChild([{ path: '', component: OrdersPage }]),
  ],
  declarations: [OrdersPage],
})
export class OrdersPageModule {}
