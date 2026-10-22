import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private prefix = 'cruminae.';

  get<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(this.prefix + key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  }

  set(key: string, value: unknown): void {
    try { localStorage.setItem(this.prefix + key, JSON.stringify(value)); } catch { /* storage full or blocked */ }
  }

  clearAll(): void {
    try {
      Object.keys(localStorage).filter(k => k.startsWith(this.prefix)).forEach(k => localStorage.removeItem(k));
    } catch { /* ignore */ }
  }
}
