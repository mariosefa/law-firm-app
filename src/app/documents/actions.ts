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

  if (insertError) {
    // The file already landed in Storage. Without this cleanup, a failed
    // insert here (bad category, transient error, unexpected constraint)
    // leaves an orphaned file with no DB record and no way for the app to
    // ever find or remove it again (audit finding, §2 feature 7 / §5).
    const { error: cleanupError } = await supabase.storage
      .from("documents")
      .remove([storagePath]);

    if (cleanupError) {
      // Best-effort: the insert error below is still what the user needs to
      // see. No structured server-side logging exists yet (separate audit
      // finding) -- this console.error is a stopgap for this one failure
      // mode, not a substitute for that broader fix.
      console.error(
        `Failed to clean up orphaned upload at "${storagePath}" after a failed documents insert:`,
        cleanupError.message
      );
    }

    throw new Error(insertError.message);
  }

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

  // Delete the DB row first, then the Storage object. This way, if one step
  // fails after the other succeeds, the failure mode is an orphaned Storage
  // file (harmless -- same class as the createDocument case above, cleanable
  // later) rather than a documents row left pointing at an already-deleted
  // file (a broken reference a user could click on). Previously this ran in
  // the opposite order.
  const { error } = await supabase
    .from("documents")
    .delete()
    .eq("id", documentId);

  if (error) throw new Error(error.message);

  const { error: storageError } = await supabase.storage
    .from("documents")
    .remove([document.storage_path]);

  if (storageError) {
    // The DB row is already gone -- the document is deleted from the user's
    // perspective. Don't fail the action over a dangling Storage object;
    // just surface it for cleanup once real logging exists.
    console.error(
      `Failed to remove Storage object "${document.storage_path}" after deleting document ${documentId}:`,
      storageError.message
    );
  }
}
