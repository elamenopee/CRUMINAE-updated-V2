import { Component, inject } from '@angular/core';
import { CartLine } from '../../core/models';
import { CartService } from '../../core/cart.service';
import { ProductService } from '../../core/product.service';

@Component({
  selector: 'app-cart',
  templateUrl: 'cart.page.html',
  styleUrls: ['cart.page.scss'],
  standalone: false,
})
export class CartPage {
  cart = inject(CartService);
  products = inject(ProductService);

  lines$ = this.cart.lines$;
  totals$ = this.cart.totals$;

  trackLine(_: number, l: CartLine): string {
    return l.kind === 'box' ? l.id : l.cookieId;
  }

  lineImage(l: CartLine): string | null {
    if (l.kind === 'box') {
      return null;
    }

    const cookie = this.products.byId(l.cookieId);

    return cookie?.image ?? null;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }
}
