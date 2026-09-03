"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { logAndThrow } from "@/lib/action-errors";
import { ilikePattern, mergeById } from "@/lib/search";

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export type SearchResult = {
  id: string;
  label: string;
  sublabel?: string;
  href: string;
};

export type SearchResults = {
  clients: SearchResult[];
  matters: SearchResult[];
  documents: SearchResult[];
};

const EMPTY_RESULTS: SearchResults = { clients: [], matters: [], documents: [] };
const RESULT_LIMIT = 5;
// Below this, ilike("%%") against every row is more noise than signal, and
// on a large table it's a full scan for nothing -- wait for a real query.
const MIN_QUERY_LENGTH = 2;

// Powers the Cmd/Ctrl+K global search (src/components/GlobalSearch.tsx).
// No app-level firm/matter-assignment filtering here -- same as every
// other read in this app, RLS is the actual boundary (docs/audit-2026-09.md
// §3/§4): a member's `matters`/`documents` queries are already narrowed to
// their assigned matters by the 0011 policies, so this can't surface a
// result the caller isn't allowed to open.
//
// Each entity is queried per-column (not one .or("a.ilike.x,b.ilike.x")
// call) and merged in JS -- PostgREST's or-filter string has its own
// escaping rules for a value containing a comma or parenthesis, exactly
// the kind of thing a person's search text can contain.
export async function globalSearch(query: string): Promise<SearchResults> {
  const trimmed = query.trim();
  if (trimmed.length < MIN_QUERY_LENGTH) return EMPTY_RESULTS;

  const supabase = await createClient();
  const pattern = ilikePattern(trimmed);

  const [
    clientsByName,
    clientsByEmail,
    mattersByTitle,
    mattersByNumber,
    documentsByName,
  ] = await Promise.all([
    supabase
      .from("clients")
      .select("id, name, email")
      .ilike("name", pattern)
      .limit(RESULT_LIMIT),
    supabase
      .from("clients")
      .select("id, name, email")
      .ilike("email", pattern)
      .limit(RESULT_LIMIT),
    supabase
      .from("matters")
      .select("id, title, matter_number")
      .ilike("title", pattern)
      .limit(RESULT_LIMIT),
    supabase
      .from("matters")
      .select("id, title, matter_number")
      .ilike("matter_number", pattern)
      .limit(RESULT_LIMIT),
    supabase
      .from("documents")
      .select("id, file_name")
      .ilike("file_name", pattern)
      .limit(RESULT_LIMIT),
  ]);

  for (const [context, result] of [
    ["search.globalSearch.clientsByName", clientsByName],
    ["search.globalSearch.clientsByEmail", clientsByEmail],
    ["search.globalSearch.mattersByTitle", mattersByTitle],
    ["search.globalSearch.mattersByNumber", mattersByNumber],
    ["search.globalSearch.documentsByName", documentsByName],
  ] as const) {
    if (result.error) logAndThrow(context, result.error);
  }

  const clients = mergeById(clientsByName.data ?? [], clientsByEmail.data ?? []);
  const matters = mergeById(mattersByTitle.data ?? [], mattersByNumber.data ?? []);
  const documents = documentsByName.data ?? [];

  return {
    clients: clients.slice(0, RESULT_LIMIT).map((c) => ({
      id: c.id,
      label: c.name,
      sublabel: c.email ?? undefined,
      href: `/clients/${c.id}`,
    })),
    matters: matters.slice(0, RESULT_LIMIT).map((m) => ({
      id: m.id,
      label: m.title,
      sublabel: m.matter_number ?? undefined,
      href: `/matters/${m.id}`,
    })),
    documents: documents.slice(0, RESULT_LIMIT).map((d) => ({
      id: d.id,
      label: d.file_name,
      href: `/documents/${d.id}`,
    })),
  };
}
