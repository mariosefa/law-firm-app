// Guards a "next" redirect target that came from a URL search param
// (attacker-influenceable) before it's ever used to build a redirect.
//
// Today every call site builds the redirect via string concatenation
// (`${origin}${next}`) rather than URL-resolution (`new URL(next, origin)`),
// so a value like "//evil.com" or "https://evil.com" can't currently
// produce a cross-origin redirect -- it just becomes garbage or a same-origin
// path (audit-2026-09.md §2 feature 2). This guard exists so that stays true
// even if a future refactor switches to URL-resolution semantics, where
// "//evil.com" (protocol-relative) or "/\evil.com" (some browsers treat a
// leading backslash as a second slash) would otherwise become one.
export function safeRedirectPath(next: string, fallback = "/"): string {
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return fallback;
  }
  return next;
}
