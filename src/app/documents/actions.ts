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

export async function deleteDocument(documentId: string) {
  const supabase = await createClient();

  const { data: document, error: fetchError } = await supabase
    .from("documents")
    .select("storage_path")
    .eq("id", documentId)
    .maybeSingle();

  if (fetchError) throw new Error(fetchError.message);
  if (!document) throw new Error("Document not found.");

  const { error: storageError } = await supabase.storage
    .from("documents")
    .remove([document.storage_path]);

  if (storageError) throw new Error(storageError.message);

  const { error } = await supabase
    .from("documents")
    .delete()
    .eq("id", documentId);

  if (error) throw new Error(error.message);
}
