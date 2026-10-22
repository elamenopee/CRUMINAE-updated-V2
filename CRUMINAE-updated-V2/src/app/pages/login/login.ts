import {
  Component,
  inject,
  OnDestroy
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { IonContent } from '@ionic/angular';

import {
  MultiFactorResolver,
  RecaptchaVerifier,
  multiFactor
} from 'firebase/auth';

import {
  LocalAuthService,
  authMessage
} from '../../core/local-auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    IonContent
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login implements OnDestroy {
  private auth = inject(LocalAuthService);
  private router = inject(Router);

  email = '';
  password = '';
  showPassword = false;

  busy = false;
  error = '';
  notice = '';

  code = '';
  resolver: MultiFactorResolver | null = null;
  factorIndex = 0;
  verificationId = '';
  resendAt = 0;

  private captcha?: RecaptchaVerifier;

  get isSms(): boolean {
    return (
      this.resolver?.hints[this.factorIndex]?.factorId === 'phone'
    );
  }

  private async run(
    action: () => Promise<void>
  ): Promise<void> {
    if (this.busy) return;

    this.busy = true;
    this.error = '';
    this.notice = '';

    try {
      await action();
    } catch (error) {
      this.error = authMessage(error);
    } finally {
      this.busy = false;
    }
  }

  async login(): Promise<void> {
    await this.run(async () => {
      if (!this.email.trim() || !this.password) {
        throw new Error('Enter your email and password.');
      }

      this.resolver = await this.auth.login(
        this.email.trim(),
        this.password
      );

      this.password = '';
      this.showPassword = false;

      if (!this.resolver) {
        await this.finish();
      }
    });
  }

  private async finish(): Promise<void> {
    const user = this.auth.firebase.currentUser;

    const destination =
      user?.emailVerified &&
      multiFactor(user).enrolledFactors.length > 0
        ? '/pages/dashboard'
        : '/security';

    await this.router.navigateByUrl(destination, {
      replaceUrl: true
    });
  }

  async resetPassword(): Promise<void> {
    await this.run(async () => {
      const email = this.email.trim();

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error(
          'Enter your email address above, then click Forgot password.'
        );
      }

      await this.auth.resetPassword(email);

      this.notice =
        'If this address is registered, check your inbox and spam folder for a password reset link.';
    });
  }

  selectFactor(): void {
    this.code = '';
    this.verificationId = '';
    this.error = '';
    this.notice = '';
    this.clearCaptcha();
  }

  async sendSms(): Promise<void> {
    await this.run(async () => {
      if (!this.resolver) return;

      if (Date.now() < this.resendAt) {
        throw new Error(
          'Please wait 60 seconds between SMS requests.'
        );
      }

      this.clearCaptcha();

      this.captcha = this.auth.captcha('login-recaptcha');

      try {
        this.verificationId = await this.auth.loginSms(
          this.resolver,
          this.factorIndex,
          this.captcha
        );

        this.resendAt = Date.now() + 60000;

        this.notice =
          'A verification code was sent to your registered phone.';
      } finally {
        this.clearCaptcha();
      }
    });
  }

  async verify(): Promise<void> {
    await this.run(async () => {
      if (!this.resolver) return;

      if (!/^\d{6}$/.test(this.code)) {
        throw new Error('Enter the six-digit verification code.');
      }

      if (this.isSms && !this.verificationId) {
        throw new Error('Request an SMS code first.');
      }

      await this.auth.verify(
        this.resolver,
        this.factorIndex,
        this.code,
        this.verificationId
      );

      this.code = '';
      this.resolver = null;

      await this.finish();
    });
  }

  back(): void {
    if (this.busy) return;

    this.resolver = null;
    this.code = '';
    this.password = '';
    this.showPassword = false;
    this.factorIndex = 0;
    this.verificationId = '';
    this.error = '';
    this.notice = '';

    this.clearCaptcha();
  }

  private clearCaptcha(): void {
    this.captcha?.clear();
    this.captcha = undefined;
  }

  ionViewWillLeave(): void {
    this.clearCaptcha();
    this.password = '';
    this.code = '';
    this.resolver = null;
  }

  ngOnDestroy(): void {
    this.clearCaptcha();
  }
}