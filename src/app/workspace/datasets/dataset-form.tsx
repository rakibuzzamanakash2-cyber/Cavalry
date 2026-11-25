"use client";

import Link from "next/link";
import { useActionState, useId } from "react";
import { ui } from "@/components/ui";
import type { DatasetInput } from "@/lib/datasets";
import type { DatasetState } from "./actions";

type Props = {
  action: (prev: DatasetState, formData: FormData) => Promise<DatasetState>;
  projects: { id: string; title: string; number: string }[];
  initial?: Partial<DatasetInput>;
  id?: string;
  submitLabel: string;
};

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? (
    <span id={id} className="text-accent-strong mt-1 block text-sm">
      {message}
    </span>
  ) : null;
}

export function DatasetForm({ action, projects, initial = {}, id, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState<DatasetState, FormData>(action, null);
  // Unique ids: Next keeps the previous page mounted (hidden) after a client
  // navigation, so fixed ids would clash between the add and edit forms.
  const uid = useId();
  const fid = (name: string) => `${uid}-${name}`;
  const e = state?.errors ?? {};
  const v = { ...initial, ...state?.values };
  const field = (name: keyof DatasetInput) => ({
    name,
    defaultValue: v[name] ?? "",
    "aria-invalid": Boolean(e[name]),
    id: fid(name),
    "aria-describedby": e[name] ? fid(`${name}-error`) : undefined,
  });

  return (
    // A key from the returned values keeps what was typed when there are errors.
    <form
      key={JSON.stringify(state?.values ?? null)}
      action={formAction}
      className="space-y-5"
      noValidate
    >
      {id ? <input type="hidden" name="id" value={id} /> : null}

      <div>
        <label htmlFor={fid("name")} className={ui.label}>
          Dataset name
        </label>
        <input required maxLength={120} className={ui.input} {...field("name")} />
        <FieldError id={fid("name-error")} message={e.name} />
      </div>

      <div>
        <label htmlFor={fid("url")} className={ui.label}>
          Link (GitHub, Google Drive or other)
        </label>
        <input
          type="url"
          inputMode="url"
          required
          placeholder="https://github.com/… or https://drive.google.com/…"
          className={ui.input}
          {...field("url")}
        />
        <FieldError id={fid("url-error")} message={e.url} />
      </div>

      <div>
        <label htmlFor={fid("description")} className={ui.label}>
          What it is
        </label>
        <textarea
          rows={3}
          required
          maxLength={1000}
          placeholder="Source, coverage, version…"
          className={ui.input}
          {...field("description")}
        />
        <FieldError id={fid("description-error")} message={e.description} />
      </div>

      <div>
        <label htmlFor={fid("usedFor")} className={ui.label}>
          What we use it for
        </label>
        <textarea rows={3} required maxLength={1000} className={ui.input} {...field("usedFor")} />
        <FieldError id={fid("usedFor-error")} message={e.usedFor} />
      </div>

      <div>
        <label htmlFor={fid("projectId")} className={ui.label}>
          Who can see it
        </label>
        <select className={ui.input} {...field("projectId")}>
          <option value="">Every member (shared dataset)</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              Only the team of Programme {p.number}: {p.title}
            </option>
          ))}
        </select>
        <FieldError id={fid("projectId-error")} message={e.projectId} />
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
        <Link href="/workspace/datasets" className={ui.link}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
