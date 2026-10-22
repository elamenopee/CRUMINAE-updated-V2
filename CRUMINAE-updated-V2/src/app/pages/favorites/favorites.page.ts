import { Component, inject } from '@angular/core';
import { map } from 'rxjs';
import { CartService } from '../../core/cart.service';
import { FavoritesService } from '../../core/favorites.service';
import { Cookie } from '../../core/models';
import { ProductService } from '../../core/product.service';
import { UiService } from '../../core/ui.service';

@Component({
  selector: 'app-favorites',
  templateUrl: 'favorites.page.html',
  standalone: false,
})
export class FavoritesPage {
  private products = inject(ProductService);
  private cart = inject(CartService);
  private ui = inject(UiService);

  favorites$ = inject(FavoritesService).ids$.pipe(
    map(ids => ids.map(id => this.products.byId(id)).filter((c): c is Cookie => !!c))
  );

  addAll(list: Cookie[]): void {
    list.forEach(c => this.cart.addCookie(c.id));
    this.ui.toast(`${list.length} favorites added to cart`);
  }
}
