"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function createDocument(formData: FormData) {
  const file = formData.get("file");
  const matterId = formData.get("matter_id")?.toString().trim();
  const category = formData.get("category")?.toString().trim();

  if (!(file instanceof File) || file.size === 0 || !matterId || !category) {
    throw new Error("All fields are required.");
  }

  const supabase = await createClient();

  const storagePath = `${matterId}/${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(storagePath, file);

  if (uploadError) throw new Error(uploadError.message);

  const { error: insertError } = await supabase.from("documents").insert({
    matter_id: matterId,
    file_name: file.name,
    category,
    storage_path: storagePath,
  });

  if (insertError) throw new Error(insertError.message);

  redirect("/documents");
}
