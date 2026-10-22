import { Component, inject } from '@angular/core';
import { interval, startWith } from 'rxjs';
import { CartService } from '../../core/cart.service';
import { Order } from '../../core/models';
import { OrderService } from '../../core/order.service';
import { ProductService } from '../../core/product.service';
import { UiService } from '../../core/ui.service';

@Component({
  selector: 'app-orders',
  templateUrl: 'orders.page.html',
  standalone: false,
})
export class OrdersPage {
  svc = inject(OrderService);
  products = inject(ProductService);
  private cart = inject(CartService);
  private ui = inject(UiService);

  view: 'orders' | 'cravings' = 'orders';
  orders$ = this.svc.orders$;
  /** Re-renders every few seconds so the demo order tracker advances on its own. */
  tick$ = interval(5000).pipe(startWith(1));

  get cravings() { return this.svc.cravings().slice(0, 5); }
  get topCount(): number { return this.cravings[0]?.count ?? 1; }

  summary(o: Order): string {
    return o.lines.map(l => `${l.qty}× ${this.cart.lineName(l)}`).join(', ');
  }

  reorder(o: Order): void {
    if (!this.cart.addLines(o.lines)) {
      this.ui.toast('This order contains unavailable products or products awaiting prices', 'dark', 2000);
      return;
    }
    this.ui.toast(`${o.id} added to your cart`);
  }

  addOne(id: string): void {
    if (!this.cart.addCookie(id)) { return; }
    this.ui.toast(`${this.products.byId(id)?.name} added to cart`);
  }

  reorderTop(): void {
    const available = this.cravings.filter(c => this.products.canPurchase(this.products.byId(c.cookieId))).slice(0, 3);
    if (!available.length) { this.ui.toast('These products are unavailable or awaiting prices'); return; }
    available.forEach(c => this.cart.addCookie(c.cookieId));
    this.ui.toast(`Your top ${available.length} are in the cart`);
  }
}
