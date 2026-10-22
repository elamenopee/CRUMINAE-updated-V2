import { Injectable, NgZone, inject } from '@angular/core';
import {
  getAuth, onAuthStateChanged, createUserWithEmailAndPassword,
  signInWithEmailAndPassword, signOut, updateProfile, sendEmailVerification,
  sendPasswordResetEmail, multiFactor, getMultiFactorResolver,
  MultiFactorError, MultiFactorResolver, TotpMultiFactorGenerator,
  PhoneAuthProvider, PhoneMultiFactorGenerator, RecaptchaVerifier,
  TotpSecret, User
} from 'firebase/auth';
import { firebaseApp } from './firebase';

export interface LocalUser { id: string; name: string; email: string; }
export function authMessage(error: unknown): string {
  const code = (error as { code?: string })?.code;
  const messages: Record<string, string> = {
    'auth/invalid-credential': 'Incorrect email or password.',
    'auth/wrong-password': 'Incorrect email or password.',
    'auth/user-not-found': 'Incorrect email or password.',
    'auth/email-already-in-use': 'This email is already registered. Sign in instead.',
    'auth/invalid-email': 'Enter a valid email address.',
    'auth/weak-password': 'Choose a stronger password with at least 8 characters.',
    'auth/too-many-requests': 'Too many attempts. Please wait before trying again.',
    'auth/invalid-verification-code': 'That code is incorrect. Try the latest code.',
    'auth/code-expired': 'This code expired. Request another code.',
    'auth/session-expired': 'Verification expired. Start again.',
    'auth/invalid-multi-factor-session': 'Your verification session expired. Sign in again.',
    'auth/requires-recent-login': 'For security, sign out and sign in again before adding a factor.',
    'auth/unverified-email': 'Verify your email before setting up two-step verification.',
    'auth/operation-not-allowed': 'This sign-in method is not enabled in Firebase yet.',
    'auth/unauthorized-domain': 'This domain must be added to Firebase Authentication authorized domains.',
    'auth/invalid-phone-number': 'Use international format, for example +639171234567.',
    'auth/quota-exceeded': 'SMS quota reached. Try an authenticator or contact the administrator.',
    'auth/captcha-check-failed': 'The security check failed. Please try again.',
    'auth/network-request-failed': 'Connection failed. Check your internet and try again.',
    'auth/second-factor-already-in-use': 'This verification method is already registered.'
  };
  return (code && messages[code]) || (code
    ? `Authentication could not complete (${code}). Please try again.`
    : error instanceof Error ? error.message : 'Something went wrong. Please try again.');
}

// Compatibility name retained so existing menu and profile imports continue to work.
// This service no longer reads or writes demo accounts or password storage.
@Injectable({ providedIn: 'root' })
export class LocalAuthService {
  readonly firebase = getAuth(firebaseApp);
  private zone = inject(NgZone);
  private user: User | null = null;
  readonly ready = this.firebase.authStateReady();

  constructor() {
    onAuthStateChanged(this.firebase, user => this.zone.run(() => { this.user = user; }));
  }
  get currentUser(): LocalUser | null {
    const user = this.user;
    return user ? { id: user.uid, name: user.displayName || '', email: user.email || '' } : null;
  }
  get isLoggedIn(): boolean { return this.user !== null; }
  async register(name: string, email: string, password: string): Promise<void> {
    const result = await createUserWithEmailAndPassword(this.firebase, email.trim(), password);
    await updateProfile(result.user, { displayName: name.trim() });
    this.user = result.user;
    // Email delivery has a separate retry action on /security, so a delivery
    // failure never makes a successfully created account appear to have failed.
  }
  async login(email: string, password: string): Promise<MultiFactorResolver | null> {
    try {
      await signInWithEmailAndPassword(this.firebase, email.trim(), password);
      return null;
    } catch (error) {
      if ((error as { code?: string }).code === 'auth/multi-factor-auth-required') {
        return getMultiFactorResolver(this.firebase, error as MultiFactorError);
      }
      throw error;
    }
  }
  async logout(): Promise<void> { await signOut(this.firebase); this.user = null; }
  async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(this.firebase, email.trim());
  }
  async sendEmail(): Promise<void> {
    const user = this.firebase.currentUser;
    if (!user) throw new Error('Sign in first.');
    await sendEmailVerification(user);
  }
  async refresh(): Promise<User | null> {
    await this.ready;
    const user = this.firebase.currentUser;
    if (user) { await user.reload(); await user.getIdToken(true); }
    this.user = this.firebase.currentUser;
    return this.user;
  }
  captcha(container: string): RecaptchaVerifier {
    return new RecaptchaVerifier(this.firebase, container, { size: 'normal' });
  }
  private verifiedUser(): User {
    const user = this.firebase.currentUser;
    if (!user) throw new Error('Sign in first.');
    if (!user.emailVerified) throw new Error('Verify your email first.');
    return user;
  }
  async totpSecret(): Promise<TotpSecret> {
    return TotpMultiFactorGenerator.generateSecret(await multiFactor(this.verifiedUser()).getSession());
  }
  async enrollTotp(secret: TotpSecret, code: string): Promise<void> {
    await multiFactor(this.verifiedUser()).enroll(
      TotpMultiFactorGenerator.assertionForEnrollment(secret, code), 'Google Authenticator');
  }
  async enrollSmsStart(phoneNumber: string, captcha: RecaptchaVerifier): Promise<string> {
    return new PhoneAuthProvider(this.firebase).verifyPhoneNumber({
      phoneNumber, session: await multiFactor(this.verifiedUser()).getSession()
    }, captcha);
  }
  async enrollSmsFinish(verificationId: string, code: string): Promise<void> {
    await multiFactor(this.verifiedUser()).enroll(PhoneMultiFactorGenerator.assertion(
      PhoneAuthProvider.credential(verificationId, code)), 'Mobile phone');
  }
  async loginSms(resolver: MultiFactorResolver, index: number, captcha: RecaptchaVerifier): Promise<string> {
    return new PhoneAuthProvider(this.firebase).verifyPhoneNumber({
      multiFactorHint: resolver.hints[index], session: resolver.session
    }, captcha);
  }
  async verify(resolver: MultiFactorResolver, index: number, code: string, verificationId: string): Promise<void> {
    const hint = resolver.hints[index];
    const assertion = hint.factorId === TotpMultiFactorGenerator.FACTOR_ID
      ? TotpMultiFactorGenerator.assertionForSignIn(hint.uid, code)
      : PhoneMultiFactorGenerator.assertion(PhoneAuthProvider.credential(verificationId, code));
    await resolver.resolveSignIn(assertion);
  }
}
