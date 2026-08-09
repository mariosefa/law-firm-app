"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { DEV_FIRM_ID } from "@/lib/constants";

export async function createMatter(formData: FormData) {
  const title = formData.get("title")?.toString().trim();
  const clientId = formData.get("client_id")?.toString().trim();
  const practiceArea = formData.get("practice_area")?.toString().trim();
  const status = formData.get("status")?.toString().trim();

  if (!title || !clientId || !practiceArea || !status) {
    throw new Error("All fields are required.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("matters")
    .insert({
      firm_id: DEV_FIRM_ID,
      client_id: clientId,
      title,
      practice_area: practiceArea,
      status,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  redirect(`/matters/${data.id}`);
}
