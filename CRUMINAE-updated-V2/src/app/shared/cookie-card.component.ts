import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { Cookie } from '../core/models';
import { CartService } from '../core/cart.service';
import { FavoritesService } from '../core/favorites.service';
import { ProductService } from '../core/product.service';
import { UiService } from '../core/ui.service';

@Component({
  selector: 'app-cookie-card',
  templateUrl: 'cookie-card.component.html',
  styleUrls: ['cookie-card.component.scss'],
  standalone: false,
})
export class CookieCardComponent implements OnChanges {
  @Input({ required: true }) cookie!: Cookie;
  @Input() compact = false;
  imageFailed = false;
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['cookie']) { this.imageFailed = false; }
  }
  get purchasable(): boolean { return this.products.canPurchase(this.cookie); }

  fav = inject(FavoritesService);
  private cart = inject(CartService);
  private products = inject(ProductService);
  private ui = inject(UiService);

  get fresh() { return this.products.freshness(this.cookie); }

  add(): void {
    if (!this.cart.addCookie(this.cookie.id)) { return; }
    this.ui.toast(`${this.cookie.name} added to cart`);
  }

  toggleFav(): void {
    const was = this.fav.has(this.cookie.id);
    this.fav.toggle(this.cookie.id);
    this.ui.toast(was ? 'Removed from favorites' : 'Saved to favorites', 'dark', 1000);
  }
}
