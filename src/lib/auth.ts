import Cookies from 'js-cookie';
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = 'cf-remote-control-key-2024';
const AUTH_COOKIE = 'cf_auth';

export interface AuthCredentials {
  apiToken: string;
  accountId: string;
}

export function encryptCredentials(credentials: AuthCredentials): string {
  return CryptoJS.AES.encrypt(
    JSON.stringify(credentials),
    ENCRYPTION_KEY
  ).toString();
}

export function decryptCredentials(encrypted: string): AuthCredentials | null {
  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decrypted);
  } catch {
    return null;
  }
}

export function saveCredentials(credentials: AuthCredentials): void {
  const encrypted = encryptCredentials(credentials);
  Cookies.set(AUTH_COOKIE, encrypted, { expires: 7, sameSite: 'strict' });
}

export function getCredentials(): AuthCredentials | null {
  const encrypted = Cookies.get(AUTH_COOKIE);
  if (!encrypted) return null;
  return decryptCredentials(encrypted);
}

export function clearCredentials(): void {
  Cookies.remove(AUTH_COOKIE);
}

export function isAuthenticated(): boolean {
  return getCredentials() !== null;
}
