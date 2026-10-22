import { Component, inject, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { LocalAuthService } from '../../core/local-auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login {
  private auth = inject(LocalAuthService);
  private router = inject(Router);

  email = '';
  password = '';
  showPassword = false;
  error = '';

  login(): void {
    this.error = '';

    if (!this.email.trim() || !this.password) {
      this.error = 'Please enter your email and password.';
      return;
    }

    const result = this.auth.login(this.email, this.password);

    if (!result.success) {
      this.error = result.message;
      return;
    }

    this.router.navigateByUrl('/pages/dashboard', {
      replaceUrl: true
    });
  }
}