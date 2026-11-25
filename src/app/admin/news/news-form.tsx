"use client";

import Link from "next/link";
import { useActionState, useId } from "react";
import { FormField } from "@/components/form-field";
import { ui } from "@/components/ui";
import type { ContentState } from "../content-state";

type Values = {
  title: string;
  excerpt: string;
  body: string;
  tags: string;
  visibility: "public" | "members";
  publish: "draft" | "published";
};

export function NewsForm({
  action,
  initial,
  id,
  submitLabel,
}: {
  action: (prev: ContentState, formData: FormData) => Promise<ContentState>;
  initial: Values;
  id?: string;
  submitLabel: string;
}) {
  const uid = useId();
  const [state, formAction, pending] = useActionState<ContentState, FormData>(action, null);
  const v = { ...initial, ...state?.values } as Values;
  const e = state?.errors ?? {};
  const f = (name: string) => `${uid}-${name}`;

  return (
    <form
      key={JSON.stringify(state?.values ?? null)}
      action={formAction}
      className="space-y-5"
      noValidate
    >
      {id ? <input type="hidden" name="id" value={id} /> : null}
      <FormField id={f("title")} label="Title" error={e.title}>
        {(a) => (
          <input {...a} name="title" defaultValue={v.title} maxLength={140} className={ui.input} />
        )}
      </FormField>
      <FormField
        id={f("excerpt")}
        label="Summary"
        hint="One or two sentences shown in the news list."
        error={e.excerpt}
      >
        {(a) => (
          <textarea
            {...a}
            name="excerpt"
            rows={2}
            defaultValue={v.excerpt}
            maxLength={300}
            className={ui.input}
          />
        )}
      </FormField>
      <FormField
        id={f("body")}
        label="Text"
        hint="Leave a blank line between paragraphs."
        error={e.body}
      >
        {(a) => (
          <textarea {...a} name="body" rows={12} defaultValue={v.body} className={ui.input} />
        )}
      </FormField>
      <FormField id={f("tags")} label="Tags (comma-separated)" error={e.tags}>
        {(a) => (
          <input
            {...a}
            name="tags"
            defaultValue={v.tags}
            placeholder="e.g. Programme 01, Data"
            className={ui.input}
          />
        )}
      </FormField>
      <div className="grid gap-5 md:grid-cols-2">
        <FormField id={f("visibility")} label="Who can read it" error={e.visibility}>
          {(a) => (
            <select {...a} name="visibility" defaultValue={v.visibility} className={ui.input}>
              <option value="members">Members only (workspace)</option>
              <option value="public">Everyone (public news page)</option>
            </select>
          )}
        </FormField>
        <FormField id={f("publish")} label="State" error={e.publish}>
          {(a) => (
            <select {...a} name="publish" defaultValue={v.publish} className={ui.input}>
              <option value="draft">Draft (not shown anywhere)</option>
              <option value="published">Published</option>
            </select>
          )}
        </FormField>
      </div>
      {state && !state.ok ? (
        <p role="alert" className="border-accent text-accent-strong border-l-2 pl-3 text-sm">
          {state.message}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-6">
        <button type="submit" disabled={pending} className={ui.button}>
          {pending ? "Saving…" : submitLabel}
        </button>
        <Link href="/admin/news" className={ui.link}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
