import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular/lazy';
import { SharedModule } from '../../shared/shared.module';
import { BoxBuilderPage } from './box-builder.page';

@NgModule({
  imports: [
    CommonModule, FormsModule, IonicModule, SharedModule,
    RouterModule.forChild([{ path: '', component: BoxBuilderPage }]),
  ],
  declarations: [BoxBuilderPage],
})
export class BoxBuilderPageModule {}
