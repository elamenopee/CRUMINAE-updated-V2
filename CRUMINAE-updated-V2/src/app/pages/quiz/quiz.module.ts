
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular/lazy';
import { SharedModule } from '../../shared/shared.module';
import { QuizPage } from './quiz.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    RouterModule.forChild([
      { path: '', component: QuizPage }
    ])
  ],
  declarations: [QuizPage]
})
export class QuizPageModule {}
