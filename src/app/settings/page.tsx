import { createClient } from "@/utils/supabase/server";
import { getAccountInfo, getFirmId } from "@/utils/supabase/profile";
import type { FirmMember } from "@/utils/supabase/types";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import InviteForm from "./InviteForm";

export default async function SettingsPage() {
  const supabase = await createClient();
  const firmId = await getFirmId(supabase);
  const account = await getAccountInfo(supabase);

  const [{ data: members, error }, { data: assignments }] = await Promise.all(
    [
      supabase
        .from("users")
        .select("id, email, role")
        .eq("firm_id", firmId)
        .order("role")
        .order("email")
        .returns<FirmMember[]>(),
      supabase
        .from("matter_assignments")
        .select("user_id")
        .eq("firm_id", firmId)
        .returns<{ user_id: string }[]>(),
    ]
  );

  const matterCountByUser = new Map<string, number>();
  for (const { user_id } of assignments ?? []) {
    matterCountByUser.set(user_id, (matterCountByUser.get(user_id) ?? 0) + 1);
  }

  const isOwner = account?.role === "owner";

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Settings"
        description={`Manage ${account?.firmName || "your firm"} and your account.`}
      />

      <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        Team &amp; Access
      </h2>

      <Card className="mb-8 divide-y divide-zinc-200/80 dark:divide-zinc-800">
        {error ? (
          <p className="p-4 text-sm text-red-600">
            Failed to load team: {error.message}
          </p>
        ) : (
          (members ?? []).map((member) => {
            const matterCount = matterCountByUser.get(member.id) ?? 0;
            return (
              <div
                key={member.id}
                className="flex items-center justify-between gap-4 px-4 py-3"
              >
                <span className="truncate text-sm text-zinc-900 dark:text-zinc-50">
                  {member.email}
                </span>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {matterCount} {matterCount === 1 ? "matter" : "matters"}
                  </span>
                  <Badge color={member.role === "owner" ? "blue" : "gray"}>
                    {member.role}
                  </Badge>
                </div>
              </div>
            );
          })
        )}
      </Card>

      {isOwner && (
        <Card className="p-4">
          <h2 className="mb-3 text-sm font-medium text-zinc-900 dark:text-zinc-50">
            Invite a teammate
          </h2>
          <InviteForm />
        </Card>
      )}
    </div>
  );
}
