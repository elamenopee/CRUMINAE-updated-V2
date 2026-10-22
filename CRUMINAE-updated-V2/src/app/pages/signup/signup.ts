
import { Component, inject, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { LocalAuthService } from '../../core/local-auth';

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

  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  showPassword = false;
  error = '';

  signup(): void {
    this.error = '';

    if (
      !this.name.trim() ||
      !this.email.trim() ||
      !this.password ||
      !this.confirmPassword
    ) {
      this.error = 'Please complete all fields.';
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
      this.error = 'Please enter a valid email address.';
      return;
    }

    if (this.password.length < 8) {
      this.error = 'Password must be at least 8 characters.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match.';
      return;
    }

    const result = this.auth.register(
      this.name,
      this.email,
      this.password
    );

    if (!result.success) {
      this.error = result.message;
      return;
    }

    this.router.navigateByUrl('/pages/dashboard', {
      replaceUrl: true
    });
  }
}
