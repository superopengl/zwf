import { v5 as uuidv5 } from 'uuid';

/**
 * Never change this UUID
 */
const EMAIL_HASH_NAMESPACE = '3b11c365-5113-47a1-9215-83b4f0debb3c';

export function computeEmailHash(email: string): string {
  const formatted = email.trim().toLowerCase();
  return uuidv5(formatted, EMAIL_HASH_NAMESPACE);
}