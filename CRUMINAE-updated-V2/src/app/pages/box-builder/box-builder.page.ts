import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BOX_SIZES, Cookie } from '../../core/models';
import { CartService } from '../../core/cart.service';
import { ProductService } from '../../core/product.service';
import { UiService } from '../../core/ui.service';

@Component({
  selector: 'app-box-builder',
  templateUrl: 'box-builder.page.html',
  standalone: false,
})
export class BoxBuilderPage {
  products = inject(ProductService);
  private cart = inject(CartService);
  private router = inject(Router);
  private ui = inject(UiService);

  sizes = BOX_SIZES;
  size = 12;
  picks: Record<string, number> = {};

  get picked(): number { return Object.values(this.picks).reduce((a, b) => a + b, 0); }
  get remaining(): number { return this.size - this.picked; }
  get full(): boolean { return this.remaining === 0; }
  get base(): number {
    return Object.entries(this.picks).reduce((s, [id, n]) => s + (this.products.byId(id)?.price ?? 0) * n, 0);
  }
  get total(): number { return this.cart.boxPrice(this.base, this.size); }
  get saved(): number { return this.base - this.total; }
  get discountPct(): number { return Math.round((this.sizes.find(s => s.size === this.size)?.discount ?? 0) * 100); }
  get giftMode(): boolean { return this.cart.draft.gift.enabled; }
  get available(): Cookie[] { return this.products.cookies.filter(c => this.products.canPurchase(c)); }

  qty(c: Cookie): number { return this.picks[c.id] ?? 0; }

  inc(c: Cookie): void {
    if (this.products.canPurchase(c) && this.remaining > 0) { this.picks[c.id] = this.qty(c) + 1; }
  }

  dec(c: Cookie): void {
    const n = this.qty(c) - 1;
    n > 0 ? (this.picks[c.id] = n) : delete this.picks[c.id];
  }

  onSizeChange(): void {
    // Drop picks if the new box is smaller than what's already chosen.
    if (this.picked > this.size) { this.picks = {}; }
  }

  surprise(): void {
    this.picks = {};
    const all = this.available;
    if (!all.length) { return; }
    for (let i = 0; i < this.size; i++) { this.inc(all[Math.floor(Math.random() * all.length)]); }
  }

  reset(): void { this.picks = {}; }

  addToCart(): void {
    if (!this.full) { return; }
    if (!this.cart.addBox(this.size, this.picks)) { return; }
    this.ui.toast(`Box of ${this.size} added to cart`);
    this.picks = {};
    this.router.navigateByUrl(this.giftMode ? '/pages/checkout' : '/pages/cart');
  }
}
