// Sign-in and sign-up field rules, ported from Ru'sAuth
// (github.com/rubayet-off/Ru-sAuth, src/lib/validation.ts). Used by the forms
// and by the server. No server-only imports.

export const EMAIL_MAX_LENGTH = 254;
export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 80;
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_BYTES = 72;

export function byteLength(value: string): number {
  return new TextEncoder().encode(value).length;
}

export function isValidEmail(email: string): boolean {
  return (
    email.length > 0 && email.length <= EMAIL_MAX_LENGTH && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  );
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function getPasswordError(password: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return "Password must contain at least 8 characters.";
  }
  if (byteLength(password) > PASSWORD_MAX_BYTES) {
    return "Password must not exceed 72 UTF-8 bytes.";
  }
  return null;
}

export function getNameError(name: string): string | null {
  if (name.length < NAME_MIN_LENGTH || name.length > NAME_MAX_LENGTH) {
    return "Please enter your full name (2 to 80 characters).";
  }
  return null;
}
