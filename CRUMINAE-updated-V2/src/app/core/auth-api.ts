import { Injectable } from '@angular/core';

export type MfaMethod = 'totp' | 'sms';
export interface AuthChallenge {
  challengeId: string;
  methods: MfaMethod[];
  maskedPhone?: string;
}

/** Backend owns passwords, MFA secrets, rate limits, and the secure session cookie. */
@Injectable({ providedIn: 'root' })
export class AuthApi {
  private async post<T>(path: string, body: unknown): Promise<T> {
    let response: Response;
    try {
      response = await fetch(`/api/auth/${path}`, {
        method: 'POST', credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
    } catch {
      throw new Error('Unable to connect. Please check your connection and try again.');
    }
    if (!response.headers.get('content-type')?.includes('application/json')) {
      throw new Error('Secure sign-in is not connected yet. Please contact the administrator.');
    }
    if (!response.ok) {
      throw new Error(response.status === 429
        ? 'Too many attempts. Please wait before trying again.'
        : 'We could not verify your details. Check them and try again.');
    }
    return response.json() as Promise<T>;
  }

  async login(email: string, password: string): Promise<AuthChallenge> {
    const result = await this.post<AuthChallenge>('login', { email, password });
    if (!result.challengeId || !Array.isArray(result.methods) ||
        !result.methods.length || result.methods.some(m => m !== 'totp' && m !== 'sms')) {
      throw new Error('Verification is unavailable. Please contact the administrator.');
    }
    return result;
  }

  sendSms(challengeId: string): Promise<{ retryAfterSeconds: number }> {
    return this.post('mfa/sms', { challengeId });
  }

  async verify(challengeId: string, method: MfaMethod, code: string): Promise<void> {
    const result = await this.post<{ verified: boolean }>('mfa/verify', { challengeId, method, code });
    if (result.verified !== true) throw new Error('Invalid or expired code. Please try again.');
  }
}
