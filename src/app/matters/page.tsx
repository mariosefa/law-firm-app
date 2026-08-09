import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { getFirmId } from "@/utils/supabase/profile";
import type { MatterWithClient } from "@/utils/supabase/types";
import PageHeader from "@/components/ui/PageHeader";
import MattersListClient from "./MattersListClient";
import type { MatterRow } from "@/components/MattersRowTable";

export default async function MattersPage() {
  const supabase = await createClient();
  const firmId = await getFirmId(supabase);
  const { data: matters, error } = await supabase
    .from("matters")
    .select("id, title, practice_area, status, clients ( id, name )")
    .eq("firm_id", firmId)
    .order("created_at", { ascending: false })
    .returns<MatterWithClient[]>();

  const rows: MatterRow[] = (matters ?? []).map((matter) => ({
    id: matter.id,
    title: matter.title,
    client: matter.clients?.name,
    practiceArea: matter.practice_area,
    status: matter.status,
  }));

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Matters"
        description="Every matter your firm is working on."
        action={
          <Link
            href="/matters/new"
            className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-hover"
          >
            New Matter
          </Link>
        }
      />

      {error ? (
        <p className="text-sm text-red-600">
          Failed to load matters: {error.message}
        </p>
      ) : (
        <MattersListClient matters={rows} />
      )}
    </div>
  );
}
