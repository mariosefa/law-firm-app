"use server";

import { redirect } from "next/navigation";
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
