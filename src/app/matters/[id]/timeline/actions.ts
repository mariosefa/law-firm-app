"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export async function createTimelineEvent(formData: FormData) {
  const matterId = formData.get("matter_id")?.toString().trim();
  const title = formData.get("title")?.toString().trim();
  const eventDate = formData.get("event_date")?.toString().trim();
  const description = formData.get("description")?.toString().trim();

  if (!matterId || !title || !eventDate) {
    throw new Error("Title and event date are required.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("timeline_events").insert({
    matter_id: matterId,
    title,
    event_date: eventDate,
    description: description || null,
  });

  if (error) throw new Error(error.message);

  revalidatePath(`/matters/${matterId}`);

  redirect(`/matters/${matterId}`);
}

export async function updateTimelineEvent(formData: FormData) {
  const id = formData.get("id")?.toString().trim();
  const matterId = formData.get("matter_id")?.toString().trim();
  const title = formData.get("title")?.toString().trim();
  const eventDate = formData.get("event_date")?.toString().trim();
  const description = formData.get("description")?.toString().trim();

  if (!id || !matterId || !title || !eventDate) {
    throw new Error("Title and event date are required.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("timeline_events")
    .update({
      title,
      event_date: eventDate,
      description: description || null,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath(`/matters/${matterId}`);

  redirect(`/matters/${matterId}`);
}

export async function deleteTimelineEvent(eventId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("timeline_events")
    .delete()
    .eq("id", eventId);

  if (error) throw new Error(error.message);
}
