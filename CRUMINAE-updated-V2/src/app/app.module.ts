
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {
  RouteReuseStrategy,
  RouterModule
} from '@angular/router';

import { CommonModule } from '@angular/common';

import {
  IonicRouteStrategy,
  provideIonicAngular,
  IonApp,
  IonRouterOutlet,
  IonMenu,
  IonContent,
  IonList,
  IonListHeader,
  IonMenuToggle,
  IonItem,
  IonIcon,
  IonLabel,
  IonBadge
} from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

@NgModule({
  declarations: [
    AppComponent
  ],

  imports: [
    BrowserModule,
    CommonModule,
    RouterModule,
    AppRoutingModule,

    IonApp,
    IonRouterOutlet,
    IonMenu,
    IonContent,
    IonList,
    IonListHeader,
    IonMenuToggle,
    IonItem,
    IonIcon,
    IonLabel,
    IonBadge
  ],

  providers: [
    provideIonicAngular(),
    {
      provide: RouteReuseStrategy,
      useClass: IonicRouteStrategy
    }
  ],

  bootstrap: [
    AppComponent
  ]
})
export class AppModule {}
