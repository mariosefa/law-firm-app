// Six actions.ts files repeated the same `if (!a || !b || ...) throw new
// Error(message)` presence/trim check (audit §D item 12, §8). This is
// that check, written once, as a TS assertion function -- callers keep
// building the same `a && b && c` condition they always did (so each
// value still narrows from `string | undefined` to `string` afterward,
// no separate `!` needed), they just stop repeating the `if`/`throw`.
export function assertPresent(
  condition: unknown,
  message = "All fields are required."
): asserts condition {
  if (!condition) throw new Error(message);
}
