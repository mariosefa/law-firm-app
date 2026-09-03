"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { getFirmId } from "@/utils/supabase/profile";
import { logAndThrow } from "@/lib/action-errors";
import { isValidEmail, isValidPhone } from "@/lib/clients";
import { assertPresent } from "@/lib/validation";

export async function createClientRecord(formData: FormData) {
  const name = formData.get("name")?.toString().trim();
  const email = formData.get("email")?.toString().trim();
  const phone = formData.get("phone")?.toString().trim();

  assertPresent(name && email && phone);

  if (!isValidEmail(email)) {
    throw new Error("Enter a valid email address.");
  }

  if (!isValidPhone(phone)) {
    throw new Error("Enter a valid phone number.");
  }

  const supabase = await createClient();
  const firmId = await getFirmId(supabase);
  const { data, error } = await supabase
    .from("clients")
    .insert({
      firm_id: firmId,
      name,
      email,
      phone,
    })
    .select("id")
    .single();

  if (error) logAndThrow("clients.createClientRecord", error);

  redirect(`/clients/${data.id}`);
}

export async function updateClientRecord(formData: FormData) {
  const id = formData.get("id")?.toString().trim();
  const name = formData.get("name")?.toString().trim();
  const email = formData.get("email")?.toString().trim();
  const phone = formData.get("phone")?.toString().trim();

  assertPresent(id && name && email && phone);

  if (!isValidEmail(email)) {
    throw new Error("Enter a valid email address.");
  }

  if (!isValidPhone(phone)) {
    throw new Error("Enter a valid phone number.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("clients")
    .update({ name, email, phone })
    .eq("id", id);

  if (error) logAndThrow("clients.updateClientRecord", error);

  revalidatePath("/clients");
  revalidatePath(`/clients/${id}`);
  revalidatePath("/matters");
  revalidatePath("/matters/[id]", "page");
  revalidatePath("/");

  redirect(`/clients/${id}`);
}

// matters.client_id is required (not nullable), so there's no safe way
// to delete a client out from under existing matters without also
// deleting those matters (and, transitively, their deadlines and
// documents) — too destructive for a "delete client" action. Blocking
// with a clear message is the safer default; the user can reassign or
// delete the matters first.
export async function deleteClientRecord(clientId: string) {
  const supabase = await createClient();

  const { count, error: countError } = await supabase
    .from("matters")
    .select("id", { count: "exact", head: true })
    .eq("client_id", clientId);

  if (countError) logAndThrow("clients.deleteClientRecord", countError);

  if (count && count > 0) {
    throw new Error(
      `This client has ${count} matter${count === 1 ? "" : "s"} on file. Reassign or delete ${
        count === 1 ? "it" : "them"
      } before deleting the client.`
    );
  }

  const { error } = await supabase.from("clients").delete().eq("id", clientId);

  if (error) logAndThrow("clients.deleteClientRecord", error);
}
