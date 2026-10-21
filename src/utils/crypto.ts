/**
 * Lightweight client-side encryption and obfuscation for sensitive local data
 * such as the private Women's Period Tracker and personal notes.
 */

// Simple robust XOR and Base64 cipher with secret salt
const SALT = 'NOOR_QURAN_PRIVATE_2026_VAULT_';

export function encryptData(data: object, userPin: string = 'DEFAULT'): string {
  try {
    const jsonStr = JSON.stringify(data);
    const key = `${SALT}${userPin}`;
    let result = '';
    for (let i = 0; i < jsonStr.length; i++) {
      const charCode = jsonStr.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      result += String.fromCharCode(charCode);
    }
    return btoa(encodeURIComponent(result));
  } catch {
    return btoa(encodeURIComponent(JSON.stringify(data)));
  }
}

export function decryptData<T>(encryptedStr: string, userPin: string = 'DEFAULT'): T | null {
  try {
    const decoded = decodeURIComponent(atob(encryptedStr));
    const key = `${SALT}${userPin}`;
    let jsonStr = '';
    for (let i = 0; i < decoded.length; i++) {
      const charCode = decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      jsonStr += String.fromCharCode(charCode);
    }
    return JSON.parse(jsonStr) as T;
  } catch {
    try {
      return JSON.parse(decodeURIComponent(atob(encryptedStr))) as T;
    } catch {
      return null;
    }
  }
}

// Simple PIN hasher for verification
export function hashPin(pin: string): string {
  let hash = 0;
  for (let i = 0; i < pin.length; i++) {
    hash = (hash << 5) - hash + pin.charCodeAt(i);
    hash |= 0;
  }
  return `pin_hash_${Math.abs(hash)}`;
}
