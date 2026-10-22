import { Component, Input, inject } from '@angular/core';
import { CartService } from '../core/cart.service';

@Component({
  selector: 'app-page-header',
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button *ngIf="backHref" [defaultHref]="backHref" text=""></ion-back-button>
          <ion-menu-button *ngIf="!backHref"></ion-menu-button>
        </ion-buttons>
        <ion-title>{{ title }}</ion-title>
        <ion-buttons slot="end" *ngIf="showCart">
          <ion-button routerLink="/pages/cart" aria-label="Open cart">
            <ion-icon slot="icon-only" name="cart-outline"></ion-icon>
            <ion-badge *ngIf="count$ | async as n" class="cart-badge">{{ n }}</ion-badge>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
  `,
  styles: [`
    ion-toolbar { --background: #F0D6DC; --color: #3F2E22; --border-color: #E3B9C4; }
    ion-title { font-weight: 600; }
    ion-button { position: relative; }
    .cart-badge { position: absolute; top: 2px; right: 0; --background: #C9973F; --color: #fff; font-size: 0.65rem; }
  `],
  standalone: false,
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() backHref?: string;
  @Input() showCart = true;
  count$ = inject(CartService).count$;
}
