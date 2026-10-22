import { Injectable, inject } from '@angular/core';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { LocalAuthService } from './local-auth';
import { CustomerContact, normalizeMobile, validateContact } from './contact';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private auth = inject(LocalAuthService);
  async load(): Promise<CustomerContact | null> {
    await this.auth.ready;
    const uid = this.auth.firebase.currentUser?.uid;
    if (!uid) return null;
    const snapshot = await getDoc(doc(db, 'customer_contacts', uid));
    if (this.auth.firebase.currentUser?.uid !== uid || !snapshot.exists()) return null;
    const data = snapshot.data();
    if (typeof data['name'] !== 'string' || typeof data['phone'] !== 'string') return null;
    if (validateContact(data['name'], data['phone'])) return null;
    return { name: data['name'], phone: normalizeMobile(data['phone'])! };
  }
  async save(name: string, phone: string): Promise<void> {
    const error = validateContact(name, phone);
    if (error) throw new Error(error);
    const uid = this.auth.firebase.currentUser?.uid;
    if (!uid) throw new Error('Please sign in to save your contact details.');
    await setDoc(doc(db, 'customer_contacts', uid), {
      name: name.trim(), phone: normalizeMobile(phone), updatedAt: serverTimestamp()
    });
  }
}
