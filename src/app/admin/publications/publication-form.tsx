"use client";

import Link from "next/link";
import { useActionState, useId } from "react";
import { FormField } from "@/components/form-field";
import { ui } from "@/components/ui";
import { OUTPUT_STATUSES, OUTPUT_TYPES } from "@/lib/admin-content";
import type { ContentState } from "../content-state";

export type PublicationValues = Record<
  | "title"
  | "type"
  | "status"
  | "authors"
  | "year"
  | "venue"
  | "abstract"
  | "url"
  | "pdfUrl"
  | "doi"
  | "projectId",
  string
>;

export function PublicationForm({
  action,
  initial,
  projects,
  id,
  submitLabel,
}: {
  action: (prev: ContentState, formData: FormData) => Promise<ContentState>;
  initial: PublicationValues;
  projects: { id: string; number: string; title: string; isPublic: boolean }[];
  id?: string;
  submitLabel: string;
}) {
  const uid = useId();
  const [state, formAction, pending] = useActionState<ContentState, FormData>(action, null);
  const v = { ...initial, ...state?.values } as PublicationValues;
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
          <input {...a} name="title" defaultValue={v.title} maxLength={200} className={ui.input} />
        )}
      </FormField>
      <div className="grid gap-5 md:grid-cols-2">
        <FormField id={f("type")} label="Type" error={e.type}>
          {(a) => (
            <select {...a} name="type" defaultValue={v.type} className={ui.input}>
              {Object.entries(OUTPUT_TYPES).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          )}
        </FormField>
        <FormField id={f("status")} label="Status" error={e.status}>
          {(a) => (
            <select {...a} name="status" defaultValue={v.status} className={ui.input}>
              {Object.entries(OUTPUT_STATUSES).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          )}
        </FormField>
      </div>
      <FormField
        id={f("authors")}
        label="Authors"
        hint="As they should appear, e.g. Rakibuzzaman, M. and Rubayet, R."
        error={e.authors}
      >
        {(a) => (
          <input
            {...a}
            name="authors"
            defaultValue={v.authors}
            maxLength={300}
            className={ui.input}
          />
        )}
      </FormField>
      <div className="grid gap-5 md:grid-cols-[8rem_1fr]">
        <FormField id={f("year")} label="Year" error={e.year}>
          {(a) => (
            <input
              {...a}
              name="year"
              inputMode="numeric"
              defaultValue={v.year}
              maxLength={4}
              className={ui.input}
            />
          )}
        </FormField>
        <FormField id={f("venue")} label="Venue (journal, series)" error={e.venue}>
          {(a) => (
            <input
              {...a}
              name="venue"
              defaultValue={v.venue}
              maxLength={200}
              className={ui.input}
            />
          )}
        </FormField>
      </div>
      <FormField id={f("abstract")} label="Abstract" error={e.abstract}>
        {(a) => (
          <textarea
            {...a}
            name="abstract"
            rows={6}
            defaultValue={v.abstract}
            className={ui.input}
          />
        )}
      </FormField>
      <div className="grid gap-5 md:grid-cols-2">
        <FormField id={f("url")} label="Link (optional)" error={e.url}>
          {(a) => (
            <input
              {...a}
              name="url"
              type="url"
              defaultValue={v.url}
              placeholder="https://"
              className={ui.input}
            />
          )}
        </FormField>
        <FormField id={f("pdfUrl")} label="PDF link (optional)" error={e.pdfUrl}>
          {(a) => (
            <input
              {...a}
              name="pdfUrl"
              type="url"
              defaultValue={v.pdfUrl}
              placeholder="https://"
              className={ui.input}
            />
          )}
        </FormField>
        <FormField id={f("doi")} label="DOI (optional)" error={e.doi}>
          {(a) => (
            <input
              {...a}
              name="doi"
              defaultValue={v.doi}
              placeholder="10.1234/abcd"
              className={ui.input}
            />
          )}
        </FormField>
        <FormField
          id={f("projectId")}
          label="Programme (optional)"
          hint="The public page links to it only once the programme is published."
          error={e.projectId}
        >
          {(a) => (
            <select {...a} name="projectId" defaultValue={v.projectId} className={ui.input}>
              <option value="">None</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  Programme {p.number}: {p.title}
                  {p.isPublic ? "" : " (not public)"}
                </option>
              ))}
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
        <Link href="/admin/publications" className={ui.link}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
