"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { getFirmId } from "@/utils/supabase/profile";
import { logAndThrow } from "@/lib/action-errors";
import { assertPresent } from "@/lib/validation";

export async function createMatter(formData: FormData) {
  const title = formData.get("title")?.toString().trim();
  const clientId = formData.get("client_id")?.toString().trim();
  const practiceArea = formData.get("practice_area")?.toString().trim();
  const status = formData.get("status")?.toString().trim();

  assertPresent(title && clientId && practiceArea && status);

  const supabase = await createClient();
  const firmId = await getFirmId(supabase);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("matters")
    .insert({
      firm_id: firmId,
      client_id: clientId,
      title,
      practice_area: practiceArea,
      status,
    })
    .select("id")
    .single();

  if (error) logAndThrow("matters.createMatter", error);

  // Auto-assign the creator. This is what the "zero assignments yet"
  // self-assign RLS policy (0011) is for -- it only ever fires here, right
  // after creation, while the matter has no assignments at all.
  const { error: selfAssignError } = await supabase
    .from("matter_assignments")
    .insert({ matter_id: data.id, user_id: user.id, firm_id: firmId });

  if (selfAssignError) logAndThrow("matters.createMatter.selfAssign", selfAssignError);

  // Only the owner's picker can submit additional assignees (the RLS
  // self-assign branch only allows adding yourself). Never trust the UI
  // gate alone -- re-check role server-side before touching other users'
  // assignment rows.
  const extraAssigneeIds = formData
    .getAll("assignee_ids")
    .map((value) => value.toString())
    .filter((id) => id && id !== user.id);

  if (extraAssigneeIds.length > 0) {
    const { data: me } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (me?.role === "owner") {
      const { error: extraAssignError } = await supabase
        .from("matter_assignments")
        .insert(
          extraAssigneeIds.map((userId) => ({
            matter_id: data.id,
            user_id: userId,
            firm_id: firmId,
          }))
        );

      if (extraAssignError) logAndThrow("matters.createMatter.extraAssign", extraAssignError);
    }
  }

  redirect(`/matters/${data.id}`);
}

export async function updateMatter(formData: FormData) {
  const id = formData.get("id")?.toString().trim();
  const title = formData.get("title")?.toString().trim();
  const clientId = formData.get("client_id")?.toString().trim();
  const practiceArea = formData.get("practice_area")?.toString().trim();
  const status = formData.get("status")?.toString().trim();
  const narrative = formData.get("narrative")?.toString().trim();

  assertPresent(id && title && clientId && practiceArea && status);

  const supabase = await createClient();
  const { error } = await supabase
    .from("matters")
    .update({
      client_id: clientId,
      title,
      practice_area: practiceArea,
      status,
      narrative: narrative || null,
    })
    .eq("id", id);

  if (error) logAndThrow("matters.updateMatter", error);

  // "team_access_present" only exists when the owner-only Team & Access
  // picker was actually rendered and submitted -- a non-owner's edit
  // request has no such field, which is how this tells "picker submitted
  // with nobody checked" (clear all) apart from "picker wasn't shown"
  // (leave assignments alone). Re-check role server-side regardless: never
  // trust the UI gate alone.
  if (formData.get("team_access_present") === "1") {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: me } = user
      ? await supabase
          .from("users")
          .select("firm_id, role")
          .eq("id", user.id)
          .single()
      : { data: null };

    if (me?.role === "owner") {
      const desiredIds = new Set(
        formData.getAll("assignee_ids").map((value) => value.toString())
      );

      const { data: current, error: currentError } = await supabase
        .from("matter_assignments")
        .select("user_id")
        .eq("matter_id", id);

      if (currentError) logAndThrow("matters.updateMatter.readAssignments", currentError);

      const currentIds = new Set((current ?? []).map((row) => row.user_id));

      const toAdd = [...desiredIds].filter((uid) => !currentIds.has(uid));
      const toRemove = [...currentIds].filter((uid) => !desiredIds.has(uid));

      if (toAdd.length > 0) {
        const { error: addError } = await supabase
          .from("matter_assignments")
          .insert(
            toAdd.map((userId) => ({
              matter_id: id,
              user_id: userId,
              firm_id: me.firm_id,
            }))
          );

        if (addError) logAndThrow("matters.updateMatter.addAssignments", addError);
      }

      if (toRemove.length > 0) {
        const { error: removeError } = await supabase
          .from("matter_assignments")
          .delete()
          .eq("matter_id", id)
          .in("user_id", toRemove);

        if (removeError) logAndThrow("matters.updateMatter.removeAssignments", removeError);
      }
    }
  }

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

  if (fetchError) logAndThrow("matters.deleteMatter.fetchDocuments", fetchError);

  if (documents && documents.length > 0) {
    const { error: storageError } = await supabase.storage
      .from("documents")
      .remove(documents.map((doc) => doc.storage_path));

    if (storageError) logAndThrow("matters.deleteMatter.removeStorage", storageError);
  }

  const { error } = await supabase.from("matters").delete().eq("id", matterId);

  if (error) logAndThrow("matters.deleteMatter", error);
}
