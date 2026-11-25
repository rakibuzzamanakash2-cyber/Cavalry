"use client";

import { useActionState, useId } from "react";
import { ui } from "@/components/ui";
import { setProjectStatus, type ActionState } from "../../actions";

const OPTIONS = [
  { value: "planning", label: "Planning (team only)" },
  { value: "active", label: "In progress (team only)" },
  { value: "paused", label: "Paused (team only)" },
  { value: "completed", label: "Completed: publish on the public site" },
];

export function StatusForm({ projectId, status }: { projectId: string; status: string }) {
  const uid = useId();
  const [state, action, pending] = useActionState<ActionState, FormData>(setProjectStatus, null);
  return (
    <form action={action} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="projectId" value={projectId} />
      <div className="min-w-64 flex-1">
        <label htmlFor={`${uid}-status`} className={ui.label}>
          Status
        </label>
        <select id={`${uid}-status`} name="status" defaultValue={status} className={ui.input}>
          {OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <button type="submit" disabled={pending} className={ui.button}>
        {pending ? "Saving…" : "Save status"}
      </button>
      {state ? (
        <p
          role={state.ok ? "status" : "alert"}
          className={`basis-full text-sm ${state.ok ? "text-muted" : "text-accent-strong"}`}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
