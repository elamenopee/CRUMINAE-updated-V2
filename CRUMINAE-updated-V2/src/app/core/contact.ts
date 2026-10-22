/** Accept Philippine mobile numbers, with optional spaces, parentheses or hyphens. */
export function normalizeMobile(value: string): string | null {
  const compact = value.trim().replace(/[\s()-]/g, '');
  if (/^09\d{9}$/.test(compact)) return '+63' + compact.slice(1);
  if (/^\+639\d{9}$/.test(compact)) return compact;
  if (/^639\d{9}$/.test(compact)) return '+' + compact;
  return null;
}
export interface CustomerContact { name: string; phone: string; }
export function validateContact(name: string, phone: string): string {
  if (!name.trim()) return 'Enter the contact person’s name.';
  if (name.trim().length > 100) return 'Contact name must not exceed 100 characters.';
  if (!normalizeMobile(phone)) return 'Enter a valid Philippine mobile number: 09XXXXXXXXX or +639XXXXXXXXX.';
  return '';
}
