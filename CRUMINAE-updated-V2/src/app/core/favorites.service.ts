import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private store = inject(StorageService);
  private subject = new BehaviorSubject<string[]>(this.store.get<string[]>('favorites', []));
  readonly ids$ = this.subject.asObservable();

  get ids(): string[] { return this.subject.value; }
  has(id: string): boolean { return this.subject.value.includes(id); }

  toggle(id: string): void {
    const next = this.has(id) ? this.ids.filter(x => x !== id) : [...this.ids, id];
    this.subject.next(next);
    this.store.set('favorites', next);
  }
}
