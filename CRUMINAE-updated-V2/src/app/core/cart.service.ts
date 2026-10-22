import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import {
  BOX_SIZES, BoxLine, CartLine, CheckoutDraft, DELIVERY_FEE, FREE_DELIVERY_OVER,
} from './models';
import { ProductService } from './product.service';
import { StorageService } from './storage.service';

export interface CartTotals { subtotal: number; boxSavings: number; net: number; }

@Injectable({ providedIn: 'root' })
export class CartService {
  private store = inject(StorageService);
  private products = inject(ProductService);
  private subject = new BehaviorSubject<CartLine[]>(this.store.get<CartLine[]>('cart', []));

  readonly lines$ = this.subject.asObservable();
  readonly count$ = this.lines$.pipe(map(ls => ls.reduce((n, l) => n + l.qty, 0)));
  readonly totals$ = this.lines$.pipe(map(ls => this.totals(ls)));

  /** Checkout choices that carry across pages (e.g. Gift Mode turned on from the dashboard). */
  draft: CheckoutDraft = this.freshDraft();

  get lines(): CartLine[] { return this.subject.value; }

  addCookie(cookieId: string, qty = 1): boolean {
    if (!this.products.canPurchase(this.products.byId(cookieId))) { return false; }
    const lines = [...this.lines];
    const existing = lines.find(l => l.kind === 'cookie' && l.cookieId === cookieId);
    if (existing) { existing.qty += qty; } else { lines.push({ kind: 'cookie', cookieId, qty }); }
    this.save(lines);
    return true;
  }

  addBox(size: number, picks: Record<string, number>, qty = 1): boolean {
    if (!this.linePurchasable({ kind: 'box', id: '', size, picks, qty })) { return false; }
    const id = 'box-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    this.save([...this.lines, { kind: 'box', id, size, picks: { ...picks }, qty }]);
    return true;
  }

  /** Used by Reorder: merges past order lines back into the cart. */
  addLines(lines: CartLine[]): boolean {
    if (!lines.length || !lines.every(line => this.linePurchasable(line))) { return false; }
    for (const l of lines) {
      if (l.kind === 'cookie') { this.addCookie(l.cookieId, l.qty); }
      else { this.addBox(l.size, l.picks, l.qty); }
    }
    return true;
  }

  /** Prevent stale or unpriced catalogue items from being reordered or checked out. */
  linePurchasable(line: CartLine): boolean {
    if (line.kind === 'cookie') { return this.products.canPurchase(this.products.byId(line.cookieId)); }
    const picks = Object.entries(line.picks);
    return BOX_SIZES.some(box => box.size === line.size) && picks.length > 0 &&
      picks.every(([id, count]) => Number.isInteger(count) && count > 0 && this.products.canPurchase(this.products.byId(id))) &&
      picks.reduce((sum, [, count]) => sum + count, 0) === line.size;
  }

  get readyForCheckout(): boolean {
    return this.lines.length > 0 && this.lines.every(line => this.linePurchasable(line));
  }

  setQty(line: CartLine, qty: number): void {
    if (qty <= 0) { this.remove(line); return; }
    line.qty = qty;
    this.save([...this.lines]);
  }

  remove(line: CartLine): void { this.save(this.lines.filter(l => l !== line)); }
  clear(): void { this.save([]); }

  // ---- pricing helpers ----

  boxBase(line: BoxLine): number {
    return Object.entries(line.picks).reduce((sum, [id, n]) => sum + (this.products.byId(id)?.price ?? 0) * n, 0);
  }

  boxPrice(base: number, size: number): number {
    const d = BOX_SIZES.find(b => b.size === size)?.discount ?? 0;
    return Math.round(base * (1 - d));
  }

  unitPrice(line: CartLine): number {
    if (line.kind === 'cookie') { return this.products.byId(line.cookieId)?.price ?? 0; }
    return this.boxPrice(this.boxBase(line), line.size);
  }

  lineTotal(line: CartLine): number { return this.unitPrice(line) * line.qty; }

  lineName(line: CartLine): string {
    return line.kind === 'cookie' ? (this.products.byId(line.cookieId)?.name ?? 'Cookie') : `Box of ${line.size}`;
  }

  lineEmoji(line: CartLine): string {
    return line.kind === 'cookie' ? (this.products.byId(line.cookieId)?.emoji ?? '🍪') : '🎁';
  }

  lineDetail(line: CartLine): string {
    if (line.kind === 'cookie') { return 'Single cookie'; }
    return Object.entries(line.picks)
      .map(([id, n]) => `${n}× ${this.products.byId(id)?.name ?? id}`)
      .join(', ');
  }

  totals(lines: CartLine[]): CartTotals {
    let subtotal = 0, net = 0;
    for (const l of lines) {
      const base = l.kind === 'cookie' ? this.unitPrice(l) : this.boxBase(l);
      subtotal += base * l.qty;
      net += this.unitPrice(l) * l.qty;
    }
    return { subtotal, boxSavings: subtotal - net, net };
  }

  deliveryFee(net: number, mode: 'delivery' | 'pickup'): number {
    return mode === 'pickup' || net >= FREE_DELIVERY_OVER || net === 0 ? 0 : DELIVERY_FEE;
  }

  startGift(): void { this.draft.gift.enabled = true; }
  resetDraft(): void { this.draft = this.freshDraft(); }

  private freshDraft(): CheckoutDraft {
    return {
      gift: { enabled: false, to: '', from: '', message: '', card: 'thanks' },
      delivery: { mode: 'delivery', date: '', slot: '' },
      crumbBlocks: 0,
    };
  }

  private save(lines: CartLine[]): void {
    this.subject.next(lines);
    this.store.set('cart', lines);
  }
}
