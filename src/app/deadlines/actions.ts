"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export async function createDeadline(formData: FormData) {
  const title = formData.get("title")?.toString().trim();
  const matterId = formData.get("matter_id")?.toString().trim();
  const dueDate = formData.get("due_date")?.toString().trim();
  const priority = formData.get("priority")?.toString().trim();

  if (!title || !matterId || !dueDate || !priority) {
    throw new Error("All fields are required.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("deadlines").insert({
    matter_id: matterId,
    title,
    due_at: dueDate,
    priority,
  });

  if (error) throw new Error(error.message);

  redirect("/deadlines");
}

export async function updateDeadline(formData: FormData) {
  const id = formData.get("id")?.toString().trim();
  const title = formData.get("title")?.toString().trim();
  const matterId = formData.get("matter_id")?.toString().trim();
  const dueDate = formData.get("due_date")?.toString().trim();
  const priority = formData.get("priority")?.toString().trim();

  if (!id || !title || !matterId || !dueDate || !priority) {
    throw new Error("All fields are required.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("deadlines")
    .update({
      matter_id: matterId,
      title,
      due_at: dueDate,
      priority,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/deadlines");
  revalidatePath("/");
  revalidatePath(`/matters/${matterId}`);

  redirect("/deadlines");
}

export async function deleteDeadline(deadlineId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("deadlines")
    .delete()
    .eq("id", deadlineId);

  if (error) throw new Error(error.message);
}
