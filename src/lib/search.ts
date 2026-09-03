// "%" and "_" are Postgres ILIKE wildcards (any-run-of-characters and
// any-single-character); "\" is ILIKE's default escape character. Without
// escaping these, a client named "50% Rebate LLC" or a file named
// "my_file.pdf" would make the *user's own text* behave as a wildcard
// pattern instead of matching literally -- e.g. "_" would match any single
// character, silently widening the match far beyond what they typed.
export function ilikePattern(query: string): string {
  const escaped = query.replace(/[\\%_]/g, (char) => `\\${char}`);
  return `%${escaped}%`;
}

// Merges result lists from separate ilike queries against different
// columns of the same table (see globalSearch in src/app/actions.ts --
// querying name-or-email/title-or-number this way, as two plain
// .ilike() calls instead of one .or("a.ilike.x,b.ilike.x") call, sidesteps
// PostgREST's or-filter string syntax, which needs its own escaping for a
// value containing a comma or parenthesis -- exactly the kind of thing a
// person's search text can contain). Keeps first-seen order, so a name
// match ranks above an email match for the same row.
export function mergeById<T extends { id: string }>(...lists: T[][]): T[] {
  const seen = new Map<string, T>();
  for (const list of lists) {
    for (const item of list) {
      if (!seen.has(item.id)) seen.set(item.id, item);
    }
  }
  return [...seen.values()];
}
