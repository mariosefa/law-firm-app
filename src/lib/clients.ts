// Deliberately permissive, not full RFC/E.164 validation -- these only
// catch obviously-malformed input (no "@", not enough digits). Law firm
// clients can have any country's phone format, and email validation
// beyond "looks like an email" is a losing battle server-side. This is a
// floor under the browser's `type="email"`/`type="tel"` checks (audit
// §D item 10 -- those were presence-only server-side before this).

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email);
}

// Digits/spaces/parens/dashes/dots, optional leading "+", at least 7
// digits (the shortest plausible phone number).
const PHONE_RE = /^\+?[\d\s().-]+$/;

export function isValidPhone(phone: string): boolean {
  if (!PHONE_RE.test(phone)) return false;
  const digitCount = phone.match(/\d/g)?.length ?? 0;
  return digitCount >= 7;
}
