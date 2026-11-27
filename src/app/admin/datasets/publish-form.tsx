"use client";

import { useActionState, useId } from "react";
import { ui } from "@/components/ui";
import { LICENCES } from "@/lib/citation";
import { setDatasetPublic, type PublishState } from "./actions";

export function PublishForm({
  id,
  name,
  isPublic,
  licence,
  blocked,
}: {
  id: string;
  name: string;
  isPublic: boolean;
  licence: string;
  /** Why it can't be published yet, if it can't. */
  blocked?: string;
}) {
  const [state, action, pending] = useActionState<PublishState, FormData>(setDatasetPublic, null);
  const uid = useId();

  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="id" value={id} />
      {isPublic ? (
        <>
          <input type="hidden" name="licence" value={licence} />
          <button
            type="submit"
            name="intent"
            value="unpublish"
            disabled={pending}
            className="border-line text-ink hover:border-accent border px-4 py-2 text-sm font-medium transition-colors"
          >
            Unpublish<span className="sr-only"> {name}</span>
          </button>
        </>
      ) : blocked ? (
        <p className="text-muted text-sm">{blocked}</p>
      ) : (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <label htmlFor={`${uid}-licence`} className="sr-only">
            Licence for {name}
          </label>
          <select
            id={`${uid}-licence`}
            name="licence"
            defaultValue={licence}
            className={`${ui.input} mt-0 sm:w-56`}
          >
            <option value="">Choose a licence…</option>
            {Object.entries(LICENCES).map(([key, l]) => (
              <option key={key} value={key}>
                {l.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            name="intent"
            value="publish"
            disabled={pending}
            className={ui.button}
          >
            Publish<span className="sr-only"> {name}</span>
          </button>
        </div>
      )}
      {state ? (
        <p
          role={state.ok ? "status" : "alert"}
          className={state.ok ? "text-primary text-sm" : "text-accent-strong text-sm"}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
