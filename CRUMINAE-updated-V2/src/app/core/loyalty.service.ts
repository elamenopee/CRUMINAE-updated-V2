import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { StorageService } from './storage.service';

export interface CrumbEntry { date: number; text: string; delta: number; }
export interface LoyaltyState { balance: number; lifetime: number; history: CrumbEntry[]; }
export interface Tier { name: string; min: number; emoji: string; }

export const TIERS: Tier[] = [
  { name: 'Plain Dough', min: 0, emoji: '🥣' },
  { name: 'Butter Crumb', min: 300, emoji: '🧈' },
  { name: 'Golden Batch', min: 800, emoji: '🏅' },
];

@Injectable({ providedIn: 'root' })
export class LoyaltyService {
  private store = inject(StorageService);
  private subject = new BehaviorSubject<LoyaltyState>(
    this.store.get<LoyaltyState>('loyalty', {
      balance: 50, lifetime: 50,
      history: [{ date: Date.now(), text: 'Welcome gift', delta: 50 }],
    })
  );
  readonly state$ = this.subject.asObservable();

  get state(): LoyaltyState { return this.subject.value; }

  earn(points: number, text: string): void {
    if (points <= 0) { return; }
    const s = this.state;
    this.save({ balance: s.balance + points, lifetime: s.lifetime + points, history: [{ date: Date.now(), text, delta: points }, ...s.history].slice(0, 30) });
  }

  redeem(points: number, text: string): void {
    if (points <= 0) { return; }
    const s = this.state;
    this.save({ ...s, balance: Math.max(0, s.balance - points), history: [{ date: Date.now(), text, delta: -points }, ...s.history].slice(0, 30) });
  }

  tier(lifetime = this.state.lifetime): Tier {
    return [...TIERS].reverse().find(t => lifetime >= t.min) ?? TIERS[0];
  }

  nextTier(lifetime = this.state.lifetime): Tier | undefined {
    return TIERS.find(t => t.min > lifetime);
  }

  /** 0-100 progress toward the next tier. */
  progress(lifetime = this.state.lifetime): number {
    const cur = this.tier(lifetime), next = this.nextTier(lifetime);
    if (!next) { return 100; }
    return Math.round(((lifetime - cur.min) / (next.min - cur.min)) * 100);
  }

  private save(s: LoyaltyState): void {
    this.subject.next(s);
    this.store.set('loyalty', s);
  }
}
