"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import {
  formatFileSize,
  isAllowedFileExtension,
  ALLOWED_FILE_TYPES_LABEL,
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_LABEL,
} from "@/lib/documents";

export async function createDocument(formData: FormData) {
  const file = formData.get("file");
  const matterId = formData.get("matter_id")?.toString().trim();
  const category = formData.get("category")?.toString().trim();

  if (!(file instanceof File) || file.size === 0 || !matterId || !category) {
    throw new Error("All fields are required.");
  }

  // Client-side already checks this, but don't trust it alone.
  if (!isAllowedFileExtension(file.name)) {
    throw new Error(
      `Unsupported file type. Allowed: ${ALLOWED_FILE_TYPES_LABEL}.`
    );
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(
      `File is ${formatFileSize(file.size)}, which is over the ${MAX_FILE_SIZE_LABEL} limit.`
    );
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

export async function updateDocument(formData: FormData) {
  const id = formData.get("id")?.toString().trim();
  const fileName = formData.get("file_name")?.toString().trim();
  const category = formData.get("category")?.toString().trim();

  if (!id || !fileName || !category) {
    throw new Error("All fields are required.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("documents")
    .update({ file_name: fileName, category })
    .eq("id", id)
    .select("matter_id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/documents");
  revalidatePath(`/documents/${id}`);
  if (data) revalidatePath(`/matters/${data.matter_id}`);

  redirect(`/documents/${id}`);
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
