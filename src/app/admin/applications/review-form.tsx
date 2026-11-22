"use client";

import { useActionState } from "react";
import { reviewApplication, type ReviewState } from "./actions";

export function ReviewForm({ id, applicantName }: { id: string; applicantName: string }) {
  const [state, action, pending] = useActionState<ReviewState, FormData>(reviewApplication, null);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="id" value={id} />
      <label className="block">
        <span className="text-muted tracking-caps text-xs uppercase">
          Note to {applicantName} (optional)
        </span>
        <textarea
          name="note"
          rows={2}
          maxLength={1000}
          className="border-line bg-surface text-ink focus:border-accent mt-1 block w-full border px-3 py-2 text-sm outline-none"
        />
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          name="decision"
          value="accept"
          disabled={pending}
          className="bg-primary text-primary-foreground hover:bg-accent tracking-caps px-4 py-2 text-xs uppercase transition-colors disabled:opacity-60"
        >
          Accept as member
        </button>
        <button
          type="submit"
          name="decision"
          value="reject"
          disabled={pending}
          className="border-primary text-primary hover:border-accent hover:text-accent tracking-caps border px-4 py-2 text-xs uppercase transition-colors disabled:opacity-60"
        >
          Reject
        </button>
        {state ? (
          <span
            role="status"
            className={`text-sm ${state.ok ? "text-muted" : "text-accent-strong"}`}
          >
            {state.message}
          </span>
        ) : null}
      </div>
    </form>
  );
}
