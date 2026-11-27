"use client";

import { useActionState, useId } from "react";
import { ui } from "@/components/ui";
import { setUsername, type UsernameState } from "./actions";

export function UsernameForm({ current }: { current: string | null }) {
  const [state, action, pending] = useActionState<UsernameState, FormData>(setUsername, null);
  const id = useId();
  return (
    <form action={action} className="space-y-3">
      <label htmlFor={id} className={ui.label}>
        Username
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id={id}
          name="username"
          defaultValue={current ?? ""}
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          maxLength={31}
          aria-describedby={`${id}-hint`}
          className={`${ui.input} mt-0 sm:max-w-xs`}
        />
        <button type="submit" disabled={pending} className={ui.button}>
          {pending ? "Saving…" : "Save username"}
        </button>
      </div>
      <p id={`${id}-hint`} className="text-muted text-xs">
        3–30 lowercase letters, numbers, dots or underscores. Leave it empty to remove it.
      </p>
      {state ? (
        <p
          role={state.ok ? "status" : "alert"}
          className={
            state.ok
              ? "text-primary text-sm"
              : "border-accent text-accent-strong border-l-2 pl-3 text-sm"
          }
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
