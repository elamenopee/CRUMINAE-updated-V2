
import { Injectable } from '@angular/core';

export interface LocalUser {
  id: string;
  name: string;
  email: string;
}

interface DemoAccount extends LocalUser {
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class LocalAuthService {

  private readonly accountsKey = 'cruminae_demo_accounts';
  private readonly sessionKey = 'cruminae_demo_session';

  // GET CURRENT USER
  get currentUser(): LocalUser | null {
    try {
      const data = localStorage.getItem(this.sessionKey);

      return data
        ? JSON.parse(data) as LocalUser
        : null;

    } catch {
      return null;
    }
  }

  // CHECK IF USER IS LOGGED IN
  get isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  // REGISTER ACCOUNT
  register(
    name: string,
    email: string,
    password: string
  ): { success: boolean; message: string } {

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || !cleanEmail || !password) {
      return {
        success: false,
        message: 'Please complete all fields.'
      };
    }

    const accounts = this.getAccounts();

    const alreadyExists = accounts.some(
      account => account.email === cleanEmail
    );

    if (alreadyExists) {
      return {
        success: false,
        message: 'This email is already registered.'
      };
    }

    const newAccount: DemoAccount = {
      id: crypto.randomUUID(),
      name: cleanName,
      email: cleanEmail,
      password: password
    };

    accounts.push(newAccount);

    localStorage.setItem(
      this.accountsKey,
      JSON.stringify(accounts)
    );

    this.saveSession(newAccount);

    return {
      success: true,
      message: 'Account created successfully!'
    };
  }

  // LOGIN ACCOUNT
  login(
    email: string,
    password: string
  ): { success: boolean; message: string } {

    const cleanEmail = email.trim().toLowerCase();

    const account = this.getAccounts().find(
      user =>
        user.email === cleanEmail &&
        user.password === password
    );

    if (!account) {
      return {
        success: false,
        message: 'Invalid email or password.'
      };
    }

    this.saveSession(account);

    return {
      success: true,
      message: 'Welcome back!'
    };
  }

  // LOGOUT ACCOUNT
  logout(): void {
    localStorage.removeItem(this.sessionKey);
  }

  // SAVE LOGGED-IN USER
  private saveSession(account: DemoAccount): void {

    const user: LocalUser = {
      id: account.id,
      name: account.name,
      email: account.email
    };

    localStorage.setItem(
      this.sessionKey,
      JSON.stringify(user)
    );
  }

  // GET REGISTERED ACCOUNTS
  private getAccounts(): DemoAccount[] {
    try {
      const data = localStorage.getItem(this.accountsKey);

      return data
        ? JSON.parse(data) as DemoAccount[]
        : [];

    } catch {
      return [];
    }
  }
}
