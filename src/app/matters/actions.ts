"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
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

export async function updateMatter(formData: FormData) {
  const id = formData.get("id")?.toString().trim();
  const title = formData.get("title")?.toString().trim();
  const clientId = formData.get("client_id")?.toString().trim();
  const practiceArea = formData.get("practice_area")?.toString().trim();
  const status = formData.get("status")?.toString().trim();

  if (!id || !title || !clientId || !practiceArea || !status) {
    throw new Error("All fields are required.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("matters")
    .update({
      client_id: clientId,
      title,
      practice_area: practiceArea,
      status,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/matters");
  revalidatePath(`/matters/${id}`);
  revalidatePath("/");
  revalidatePath("/deadlines");
  revalidatePath("/documents");
  revalidatePath(`/clients/${clientId}`);

  redirect(`/matters/${id}`);
}

// Deadlines and documents referencing this matter cascade-delete at the
// DB level (matter_id has ON DELETE CASCADE) since they're meaningless
// without their matter. Storage files have to be cleaned up here first
// since the DB cascade can't reach into Supabase Storage.
export async function deleteMatter(matterId: string) {
  const supabase = await createClient();

  const { data: documents, error: fetchError } = await supabase
    .from("documents")
    .select("storage_path")
    .eq("matter_id", matterId);

  if (fetchError) throw new Error(fetchError.message);

  if (documents && documents.length > 0) {
    const { error: storageError } = await supabase.storage
      .from("documents")
      .remove(documents.map((doc) => doc.storage_path));

    if (storageError) throw new Error(storageError.message);
  }

  const { error } = await supabase.from("matters").delete().eq("id", matterId);

  if (error) throw new Error(error.message);
}
