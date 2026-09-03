type Member = {
  id: string;
  email: string;
};

type TeamAccessFieldProps = {
  members: Member[];
  selectedIds?: string[];
};

// Renders as a plain checkbox list under name="assignee_ids" -- the calling
// form's action reads formData.getAll("assignee_ids") to know who to
// (un)assign. The hidden "team_access_present" field lets the action tell
// "submitted with nobody checked" (clear all) apart from "this field wasn't
// rendered at all" (non-owner editing, don't touch assignments).
export default function TeamAccessField({
  members,
  selectedIds = [],
}: TeamAccessFieldProps) {
  if (members.length === 0) return null;

  return (
    <div className="rounded-md border border-zinc-300 dark:border-zinc-700">
      <input type="hidden" name="team_access_present" value="1" />
      <div className="max-h-56 divide-y divide-zinc-100 overflow-y-auto dark:divide-zinc-900">
        {members.map((member) => (
          <label
            key={member.id}
            className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300"
          >
            <input
              type="checkbox"
              name="assignee_ids"
              value={member.id}
              defaultChecked={selectedIds.includes(member.id)}
              className="h-4 w-4 rounded border-zinc-300 text-brand focus:ring-brand dark:border-zinc-700"
            />
            <span className="truncate">{member.email}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
