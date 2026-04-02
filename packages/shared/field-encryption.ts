import { encrypt, decrypt } from "./encryption";

const SENSITIVE_FIELDS = ["email", "phone"] as const;

export function encryptSensitiveFields<T extends Record<string, unknown>>(
  data: T,
  fields: readonly string[] = SENSITIVE_FIELDS
): T {
  const result = { ...data };
  for (const field of fields) {
    const value = result[field];
    if (typeof value === "string" && value.length > 0) {
      try {
        (result as Record<string, unknown>)[field] = encrypt(value);
      } catch {
        // If encryption fails (e.g., no ENCRYPTION_KEY in dev), leave as-is
      }
    }
  }
  return result;
}

export function decryptSensitiveFields<T extends Record<string, unknown>>(
  data: T,
  fields: readonly string[] = SENSITIVE_FIELDS
): T {
  const result = { ...data };
  for (const field of fields) {
    const value = result[field];
    if (typeof value === "string" && value.length > 0) {
      try {
        (result as Record<string, unknown>)[field] = decrypt(value);
      } catch {
        // If decryption fails, return as-is
      }
    }
  }
  return result;
}

export function maskSensitiveField(value: string | null | undefined): string {
  if (!value || value.length < 4) return "****";
  return "****" + value.slice(-4);
}
