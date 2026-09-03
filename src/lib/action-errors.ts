// Server Actions across this app throw the raw Postgres/PostgREST error
// message on every failure -- e.g. `if (error) throw new Error(error.message)`
// -- which can surface internal schema details (constraint names, column
// names) to the browser, and previously left zero trace of the real failure
// anywhere server-side (audit findings, docs/audit-2026-09.md §7 / §14,
// remediation items 5 and 6).
//
// logAndThrow() is a drop-in replacement for that pattern: it logs the real
// error server-side with enough context to actually debug a production
// failure, then throws a short, curated message that's safe to show a user.
// Use it for genuine DB/Storage errors (PostgrestError-shaped). A
// deliberately-written user-facing message (e.g. "This client has 3
// matters on file...") should keep using `throw new Error(...)` directly --
// it's already curated, there's nothing to log or translate.
//
// logServerError() is for the auth-flow actions (login/signup/welcome/
// settings), which return `{ error }` state from Supabase Auth/Admin API
// calls rather than throwing. Those messages ("Invalid login credentials",
// "User already registered") are already Supabase-curated and safe to show
// as-is -- swapping them for a generic message would be a UX regression,
// not a fix. The actual gap there was purely the missing server-side trace,
// so this only logs; it doesn't touch the message returned to the form.

export type ActionError = {
  message: string;
  code?: string | null;
  details?: string | null;
  hint?: string | null;
};

// Keyed by Postgres SQLSTATE (constraint violations, etc.) or PostgREST's
// own error codes. Anything not listed here falls through to a generic
// message rather than leaking the raw driver text.
const FRIENDLY_MESSAGES: Record<string, string> = {
  "23505": "That already exists.",
  "23503": "This record is still in use elsewhere and can't be changed right now.",
  "23502": "A required field is missing.",
  "42501": "You don't have permission to do that.",
  PGRST116: "That record couldn't be found.",
};

const DEFAULT_MESSAGE = "Something went wrong. Please try again.";

export function friendlyMessage(error: ActionError): string {
  if (error.code && FRIENDLY_MESSAGES[error.code]) {
    return FRIENDLY_MESSAGES[error.code];
  }
  return DEFAULT_MESSAGE;
}

// `context` is a short "file.function" style tag (e.g. "clients.updateClientRecord")
// so a failure is greppable in server logs. No structured logging pipeline
// exists yet (same audit finding) -- console.error is the stopgap until one
// does; call sites won't need to change when it arrives.
export function logServerError(context: string, error: ActionError): void {
  console.error(
    `[${context}]`,
    error.message,
    error.code ? `(code: ${error.code})` : "",
    error.details ? `details: ${error.details}` : "",
    error.hint ? `hint: ${error.hint}` : ""
  );
}

export function logAndThrow(context: string, error: ActionError): never {
  logServerError(context, error);
  throw new Error(friendlyMessage(error));
}
