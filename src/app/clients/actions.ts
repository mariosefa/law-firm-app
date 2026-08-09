"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { DEV_FIRM_ID } from "@/lib/constants";

export async function createClientRecord(formData: FormData) {
  const name = formData.get("name")?.toString().trim();
  const email = formData.get("email")?.toString().trim();
  const phone = formData.get("phone")?.toString().trim();

  if (!name || !email || !phone) {
    throw new Error("All fields are required.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .insert({
      firm_id: DEV_FIRM_ID,
      name,
      email,
      phone,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  redirect(`/clients/${data.id}`);
}
