import { parsePhoneNumberFromString } from "libphonenumber-js";

const INTERNAL_DOMAIN = "store.internal";

export function normalizePhone(phone: string): string {
  const parsed = parsePhoneNumberFromString(phone, "IN");
  if (!parsed?.isValid()) {
    throw new Error("Invalid phone number. Use format like +919876543210");
  }
  return parsed.format("E.164");
}

export function phoneToInternalEmail(phone: string): string {
  const normalized = normalizePhone(phone);
  const digits = normalized.replace(/\D/g, "");
  return `${digits}@${INTERNAL_DOMAIN}`;
}

export function isValidPhone(phone: string): boolean {
  try {
    normalizePhone(phone);
    return true;
  } catch {
    return false;
  }
}
