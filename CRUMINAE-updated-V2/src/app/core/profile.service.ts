import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Profile } from './models';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private store = inject(StorageService);
  private subject = new BehaviorSubject<Profile>(
    this.store.get<Profile>('profile', { name: '', email: '', phone: '', address: '', avoid: [] })
  );
  readonly profile$ = this.subject.asObservable();

  get profile(): Profile { return this.subject.value; }

  update(p: Profile): void {
    this.subject.next({ ...p });
    this.store.set('profile', p);
  }
}
