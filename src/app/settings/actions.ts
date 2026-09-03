"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { logServerError } from "@/lib/action-errors";

export type InviteFormState = { error: string | null; info: string | null };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function inviteTeammate(
  _prevState: InviteFormState,
  formData: FormData
): Promise<InviteFormState> {
  const email = formData.get("email")?.toString().trim().toLowerCase();

  if (!email || !EMAIL_PATTERN.test(email)) {
    return { error: "Enter a valid email address.", info: null };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to invite teammates.", info: null };
  }

  // Never trust the UI gate alone -- re-check the caller is actually the
  // firm's owner from their own session-scoped row before touching the
  // admin client.
  const { data: me, error: meError } = await supabase
    .from("users")
    .select("firm_id, role")
    .eq("id", user.id)
    .single();

  if (meError || !me) {
    if (meError) logServerError("settings.inviteTeammate.verifyCaller", meError);
    return { error: "Could not verify your account.", info: null };
  }

  if (me.role !== "owner") {
    return { error: "Only the firm owner can invite teammates.", info: null };
  }

  const admin = createAdminClient();
  const { data: invited, error: inviteError } =
    await admin.auth.admin.inviteUserByEmail(email);

  if (inviteError || !invited.user) {
    if (inviteError) logServerError("settings.inviteTeammate.invite", inviteError);
    return {
      error: inviteError?.message ?? "Failed to send invite.",
      info: null,
    };
  }

  // The firm/role this invited user is allowed to join is carried in
  // app_metadata, which only this admin (service-role) call can set --
  // never the user themselves via client-side updateUser(). This is what
  // the RLS policy in 0010_team_invites.sql checks against, so it can't
  // be used to join an arbitrary firm.
  const { error: metaError } = await admin.auth.admin.updateUserById(
    invited.user.id,
    {
      app_metadata: {
        invited_firm_id: me.firm_id,
        invited_role: "member",
      },
    }
  );

  if (metaError) {
    // Don't leave a half-invited account with no way to ever join a firm.
    logServerError("settings.inviteTeammate.setMetadata", metaError);
    await admin.auth.admin.deleteUser(invited.user.id);
    return { error: metaError.message, info: null };
  }

  return { error: null, info: `Invitation sent to ${email}.` };
}
