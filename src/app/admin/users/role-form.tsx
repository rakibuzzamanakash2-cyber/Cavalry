"use client";

import { useActionState } from "react";
import { ROLES, roleLabel, type Role } from "@/lib/roles";
import { setUserRole, type RoleActionState } from "./actions";

export function RoleForm({
  userId,
  userName,
  role,
  isSelf,
}: {
  userId: string;
  userName: string;
  role: Role;
  isSelf: boolean;
}) {
  const [state, action, pending] = useActionState<RoleActionState, FormData>(setUserRole, null);

  if (isSelf) {
    return <span className="text-muted text-sm">{roleLabel[role]} (you)</span>;
  }

  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="userId" value={userId} />
      <label className="sr-only" htmlFor={`role-${userId}`}>
        Role for {userName}
      </label>
      <select
        id={`role-${userId}`}
        name="role"
        defaultValue={role}
        className="border-line bg-surface text-ink border px-2 py-1.5 text-sm"
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>
            {roleLabel[r]}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={pending}
        className="bg-primary text-primary-foreground hover:bg-accent tracking-caps px-3 py-1.5 text-xs uppercase transition-colors disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save"}
      </button>
      {state ? (
        <span role="status" className={`text-xs ${state.ok ? "text-muted" : "text-accent-strong"}`}>
          {state.message}
        </span>
      ) : null}
    </form>
  );
}
