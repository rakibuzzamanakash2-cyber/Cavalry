"use client";

import { useActionState, useId } from "react";
import { ui } from "@/components/ui";
import { decideSlotRequest, type DecideState } from "./actions";

export function DecideForm({ requestId, title }: { requestId: string; title: string }) {
  const [state, action, pending] = useActionState<DecideState, FormData>(decideSlotRequest, null);
  const id = `${useId()}-note`;
  if (state?.ok) {
    return (
      <p role="status" className="text-sm">
        {state.message}
      </p>
    );
  }
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="requestId" value={requestId} />
      <div>
        <label htmlFor={id} className={ui.label}>
          Note to the leader (optional)
        </label>
        <input id={id} name="adminNote" maxLength={300} className={ui.input} />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          name="decision"
          value="approved"
          disabled={pending}
          className={ui.buttonSm}
        >
          Approve<span className="sr-only"> request for {title}</span>
        </button>
        <button
          type="submit"
          name="decision"
          value="declined"
          disabled={pending}
          className={ui.ghostSm}
        >
          Decline<span className="sr-only"> request for {title}</span>
        </button>
        {state && !state.ok ? (
          <span role="alert" className="text-accent-strong text-xs">
            {state.message}
          </span>
        ) : null}
      </div>
    </form>
  );
}
