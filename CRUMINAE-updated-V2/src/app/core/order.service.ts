import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CartLine, Order } from './models';
import { StorageService } from './storage.service';

export interface Craving { cookieId: string; count: number; }

/** Set to false to start every new install with an empty order history. */
const SEED_DEMO_ORDERS = false;
const DAY = 86400000;

function demoOrders(): Order[] {
  const base = {
    boxSavings: 0, crumbDiscount: 0, deliveryFee: 0, giftFee: 0, crumbsUsed: 0,
    delivery: { mode: 'delivery' as const, date: '', slot: '9:00 – 11:00 AM' }, address: 'Quezon City',
  };
  return [
    { ...base, id: 'CRM-1051', placedAt: Date.now() - 3 * DAY, subtotal: 335, total: 335, crumbsEarned: 33,
      lines: [{ kind: 'cookie', cookieId: 'ube-cheese', qty: 1 }, { kind: 'cookie', cookieId: 'double-dark', qty: 2 }] },
    { ...base, id: 'CRM-1042', placedAt: Date.now() - 9 * DAY, subtotal: 350, total: 350, crumbsEarned: 35,
      lines: [{ kind: 'cookie', cookieId: 'ube-cheese', qty: 2 }, { kind: 'cookie', cookieId: 'classic-choco', qty: 1 }] },
  ];
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private store = inject(StorageService);
  private subject = new BehaviorSubject<Order[]>(this.store.get<Order[]>('orders', SEED_DEMO_ORDERS ? demoOrders() : []));
  readonly orders$ = this.subject.asObservable();

  get orders(): Order[] { return this.subject.value; }

  place(order: Order): void {
    const next = [order, ...this.orders];
    this.subject.next(next);
    this.store.set('orders', next);
  }

  nextId(): string { return 'CRM-' + (1060 + this.orders.length); }

  /**
   * Demo tracking: orders advance through stages in minutes, not hours,
   * so you can watch a new order go from Baking to Delivered.
   * 0 = baking, 1 = on the way / ready, 2 = delivered / picked up
   */
  stage(o: Order, now = Date.now()): number {
    const mins = (now - o.placedAt) / 60000;
    return mins < 1 ? 0 : mins < 3 ? 1 : 2;
  }

  stageLabels(o: Order): string[] {
    return o.delivery.mode === 'pickup' ? ['Baking', 'Ready for pickup', 'Picked up'] : ['Baking', 'On the way', 'Delivered'];
  }

  /** Craving tracker: which cookies the customer orders most. */
  cravings(): Craving[] {
    const counts: Record<string, number> = {};
    const add = (id: string, n: number) => (counts[id] = (counts[id] ?? 0) + n);
    for (const o of this.orders) {
      for (const l of o.lines as CartLine[]) {
        if (l.kind === 'cookie') { add(l.cookieId, l.qty); }
        else { Object.entries(l.picks).forEach(([id, n]) => add(id, n * l.qty)); }
      }
    }
    return Object.entries(counts).map(([cookieId, count]) => ({ cookieId, count })).sort((a, b) => b.count - a.count);
  }
}
