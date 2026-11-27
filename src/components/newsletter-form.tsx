"use client";

import { useActionState, useId } from "react";
import { subscribe, type SubscribeState } from "@/app/newsletter/actions";

/** Email sign-up for research updates. Used in the footer and on /newsletter. */
export function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const [state, action, pending] = useActionState<SubscribeState, FormData>(subscribe, null);
  const id = useId();

  return (
    <form action={action} className="space-y-2">
      <label htmlFor={`${id}-email`} className={compact ? "sr-only" : "block text-sm font-medium"}>
        Email address
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="border-line bg-surface text-ink placeholder:text-muted focus:border-primary min-w-0 flex-1 border px-3 py-2.5 text-sm transition-colors outline-none"
        />
        {/* Hidden from people; bots that fill it are ignored. */}
        <div aria-hidden className="absolute -left-[9999px]">
          <label htmlFor={`${id}-website`}>Website</label>
          <input id={`${id}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="bg-primary text-primary-foreground hover:bg-accent px-5 py-2.5 text-sm font-medium transition-colors disabled:opacity-60"
        >
          {pending ? "Subscribing…" : "Subscribe"}
        </button>
      </div>
      {state ? (
        <p
          role={state.ok ? "status" : "alert"}
          className={state.ok ? "text-primary text-sm" : "text-accent-strong text-sm"}
        >
          {state.message}
        </p>
      ) : (
        <p className="text-muted text-xs">New papers, datasets and news. Unsubscribe any time.</p>
      )}
    </form>
  );
}
