import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { multiFactor, MultiFactorInfo, RecaptchaVerifier, TotpSecret } from 'firebase/auth';
import QRCode from 'qrcode';
import { LocalAuthService, authMessage } from '../../core/local-auth';

@Component({ selector: 'app-security', standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, IonContent],
  templateUrl: './security.html', styleUrls: ['../login/login.scss'] })
export class Security implements OnDestroy {
  auth = inject(LocalAuthService);
  private router = inject(Router);
  loading = true; busy = false; verifiedEmail = false;
  error = ''; notice = ''; phone = ''; consent = false; code = '';
  factors: MultiFactorInfo[] = [];
  secret: TotpSecret | null = null; qr = ''; verificationId = '';
  mode: 'totp' | 'sms' = 'totp';
  private captcha?: RecaptchaVerifier;
  private resendAt = 0; private emailAt = 0;

  async ionViewWillEnter(): Promise<void> {
    this.loading = true;
    try {
      await this.auth.ready;
      if (!this.auth.firebase.currentUser) { await this.router.navigateByUrl('/login'); return; }
      await this.refresh();
    } catch (e) { this.error = authMessage(e); }
    finally { this.loading = false; }
  }
  private async run(action: () => Promise<void>): Promise<void> {
    if (this.busy) return;
    this.busy = true; this.error = ''; this.notice = '';
    try { await action(); } catch (e) { this.error = authMessage(e); }
    finally { this.busy = false; }
  }
  private async refresh(): Promise<void> {
    const user = await this.auth.refresh();
    this.verifiedEmail = !!user?.emailVerified;
    this.factors = user ? [...multiFactor(user).enrolledFactors] : [];
  }
  async checkEmail(): Promise<void> {
    await this.run(async () => {
      await this.refresh();
      this.notice = this.verifiedEmail ? 'Email verified. You can now add a verification method.' : 'Your email is not verified yet. Open the link in your inbox first.';
    });
  }
  async sendEmail(): Promise<void> {
    await this.run(async () => {
      if (Date.now() < this.emailAt) throw new Error('Please wait a minute before requesting another email.');
      await this.auth.sendEmail(); this.emailAt = Date.now() + 60000;
      this.notice = 'Verification email sent. Check your inbox and spam folder.';
    });
  }
  changeMode(): void { this.clearSetup(); this.error = ''; this.notice = ''; }
  async setupTotp(): Promise<void> {
    await this.run(async () => {
      this.clearSetup();
      this.secret = await this.auth.totpSecret();
      // Encode locally; never send the secret to a QR image service.
      this.qr = await QRCode.toDataURL(this.secret.generateQrCodeUrl(this.auth.firebase.currentUser!.email!, 'Cruminae'), { width: 240, margin: 2 });
    });
  }
  async sendSms(): Promise<void> {
    await this.run(async () => {
      if (!this.consent) throw new Error('Please agree to phone verification first.');
      if (!/^\+[1-9]\d{7,14}$/.test(this.phone.trim())) throw new Error('Enter an international phone number, such as +639171234567.');
      if (Date.now() < this.resendAt) throw new Error('Please wait a minute before requesting another SMS.');
      this.clearCaptcha();
      this.captcha = this.auth.captcha('setup-recaptcha');
      try {
        this.verificationId = await this.auth.enrollSmsStart(this.phone.trim(), this.captcha);
        this.resendAt = Date.now() + 60000;
        this.notice = 'Code sent. Enter it below to verify your phone.';
      } finally { this.clearCaptcha(); }
    });
  }
  async enroll(): Promise<void> {
    await this.run(async () => {
      if (!/^\d{6}$/.test(this.code)) throw new Error('Enter a six-digit code.');
      if (this.mode === 'totp') {
        if (!this.secret) throw new Error('Generate your setup key first.');
        await this.auth.enrollTotp(this.secret, this.code);
      } else {
        if (!this.verificationId) throw new Error('Send a phone verification code first.');
        await this.auth.enrollSmsFinish(this.verificationId, this.code);
      }
      this.clearSetup();
      await this.refresh();
      this.notice = 'Verification method added. Sign out and sign in to test it.';
    });
  }
  async logout(): Promise<void> {
    await this.run(async () => { await this.auth.logout(); await this.router.navigateByUrl('/login', { replaceUrl: true }); });
  }
  private clearCaptcha(): void { this.captcha?.clear(); this.captcha = undefined; }
  private clearSetup(): void { this.secret = null; this.qr = ''; this.code = ''; this.verificationId = ''; this.clearCaptcha(); }
  ionViewWillLeave(): void { this.clearSetup(); }
  ngOnDestroy(): void { this.clearSetup(); }
}
