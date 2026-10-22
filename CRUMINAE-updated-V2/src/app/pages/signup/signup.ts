
import { Component, inject, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { ContactService } from '../../core/contact.service';
import { validateContact } from '../../core/contact';
import { LocalAuthService, authMessage } from '../../core/local-auth';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './signup.html',
  styleUrls: ['./signup.scss']
})
export class Signup {

  private auth = inject(LocalAuthService);
  private router = inject(Router);

  private contacts = inject(ContactService);
  createdUid = '';
  phone = '';

  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  showPassword = false;
  error = '';

  busy = false;

  async signup(): Promise<void> {
    if (this.busy) return;
    this.error = '';

    if (!this.createdUid && (
      !this.name.trim() ||
      !this.email.trim() ||
      !this.password ||
      !this.confirmPassword ||
      !this.phone.trim()
    )) {
      this.error = 'Please complete all fields.';
      return;
    }

    if (!this.createdUid && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
      this.error = 'Please enter a valid email address.';
      return;
    }

    if (!this.createdUid && this.password.length < 8) {
      this.error = 'Password must be at least 8 characters.';
      return;
    }

    if (!this.createdUid && this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match.';
      return;
    }

    const contactError = validateContact(this.name, this.phone);
    if (contactError) { this.error = contactError; return; }

    this.busy = true;
    try {
      if (!this.createdUid) {
        await this.auth.register(this.name, this.email, this.password);
        this.createdUid = this.auth.firebase.currentUser!.uid;
      }
      if (this.auth.firebase.currentUser?.uid !== this.createdUid) {
        throw new Error('Your session changed. Sign in to your account before continuing.');
      }
      this.password = '';
      this.confirmPassword = '';
      await this.contacts.save(this.name, this.phone);
      await this.router.navigateByUrl('/security', { replaceUrl: true });
    } catch (error) {
      this.error = this.createdUid
        ? 'Your account was created, but contact saving did not finish. Click Save contact and continue to retry. ' + authMessage(error)
        : authMessage(error);
    } finally { this.busy = false; }
  }
}
