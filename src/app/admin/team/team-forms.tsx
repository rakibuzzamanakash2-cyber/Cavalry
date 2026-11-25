"use client";

import Link from "next/link";
import { useActionState, useId } from "react";
import { FormCheckbox } from "@/components/form-checkbox";
import { FormField } from "@/components/form-field";
import { ui } from "@/components/ui";
import type { ContentState } from "../content-state";

type Action = (prev: ContentState, formData: FormData) => Promise<ContentState>;

function Footer({
  state,
  pending,
  submitLabel,
}: {
  state: ContentState;
  pending: boolean;
  submitLabel: string;
}) {
  return (
    <>
      {state && !state.ok ? (
        <p role="alert" className="border-accent text-accent-strong border-l-2 pl-3 text-sm">
          {state.message}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-6">
        <button type="submit" disabled={pending} className={ui.button}>
          {pending ? "Saving…" : submitLabel}
        </button>
        <Link href="/admin/team" className={ui.link}>
          Cancel
        </Link>
      </div>
    </>
  );
}

export type PersonValues = {
  name: string;
  role: string;
  focus: string;
  bio: string;
  photoUrl: string;
  linkedinUrl: string;
  githubUrl: string;
  scholarUrl: string;
  isFounder: boolean;
  isActive: boolean;
  sortOrder: string;
};

export function PersonForm({
  action,
  initial,
  id,
  submitLabel,
}: {
  action: Action;
  initial: PersonValues;
  id?: string;
  submitLabel: string;
}) {
  const uid = useId();
  const [state, formAction, pending] = useActionState<ContentState, FormData>(action, null);
  const sv = state?.values;
  const v: PersonValues = sv
    ? { ...initial, ...sv, isFounder: sv.isFounder === "on", isActive: sv.isActive === "on" }
    : initial;
  const e = state?.errors ?? {};
  const f = (n: string) => `${uid}-${n}`;

  return (
    <form key={JSON.stringify(sv ?? null)} action={formAction} className="space-y-5" noValidate>
      {id ? <input type="hidden" name="id" value={id} /> : null}
      <div className="grid gap-5 md:grid-cols-2">
        <FormField id={f("name")} label="Full name" error={e.name}>
          {(a) => (
            <input {...a} name="name" defaultValue={v.name} maxLength={120} className={ui.input} />
          )}
        </FormField>
        <FormField
          id={f("role")}
          label="Role"
          hint="e.g. Co-founder · Technical lead"
          error={e.role}
        >
          {(a) => (
            <input {...a} name="role" defaultValue={v.role} maxLength={120} className={ui.input} />
          )}
        </FormField>
      </div>
      <FormField
        id={f("focus")}
        label="Focus"
        hint="One line on what they work on."
        error={e.focus}
      >
        {(a) => (
          <input {...a} name="focus" defaultValue={v.focus} maxLength={200} className={ui.input} />
        )}
      </FormField>
      <FormField id={f("bio")} label="Bio" error={e.bio}>
        {(a) => <textarea {...a} name="bio" rows={5} defaultValue={v.bio} className={ui.input} />}
      </FormField>
      <FormField
        id={f("photoUrl")}
        label="Photo (optional)"
        hint="An https:// link, or a file in public/ like /team/rakib.jpg. Without one, initials are shown."
        error={e.photoUrl}
      >
        {(a) => <input {...a} name="photoUrl" defaultValue={v.photoUrl} className={ui.input} />}
      </FormField>
      <p className="text-muted -mb-2 text-xs">Profile links are optional.</p>
      <div className="grid gap-5 md:grid-cols-3">
        <FormField id={f("linkedinUrl")} label="LinkedIn" error={e.linkedinUrl}>
          {(a) => (
            <input
              {...a}
              name="linkedinUrl"
              type="url"
              defaultValue={v.linkedinUrl}
              placeholder="https://"
              className={ui.input}
            />
          )}
        </FormField>
        <FormField id={f("githubUrl")} label="GitHub" error={e.githubUrl}>
          {(a) => (
            <input
              {...a}
              name="githubUrl"
              type="url"
              defaultValue={v.githubUrl}
              placeholder="https://"
              className={ui.input}
            />
          )}
        </FormField>
        <FormField id={f("scholarUrl")} label="Google Scholar" error={e.scholarUrl}>
          {(a) => (
            <input
              {...a}
              name="scholarUrl"
              type="url"
              defaultValue={v.scholarUrl}
              placeholder="https://"
              className={ui.input}
            />
          )}
        </FormField>
      </div>
      <div className="grid gap-5 md:grid-cols-3 md:items-start">
        <FormCheckbox
          id={f("isFounder")}
          name="isFounder"
          label="Co-founder"
          hint="Shown first, under Founders."
          defaultChecked={v.isFounder}
        />
        <FormCheckbox
          id={f("isActive")}
          name="isActive"
          label="Show on the team page"
          hint="Untick to hide without deleting."
          defaultChecked={v.isActive}
        />
        <FormField
          id={f("sortOrder")}
          label="Order"
          hint="Lower numbers come first."
          error={e.sortOrder}
        >
          {(a) => (
            <input
              {...a}
              name="sortOrder"
              inputMode="numeric"
              defaultValue={v.sortOrder}
              className={ui.input}
            />
          )}
        </FormField>
      </div>
      <Footer state={state} pending={pending} submitLabel={submitLabel} />
    </form>
  );
}

export type RoleValues = {
  title: string;
  background: string;
  owns: string;
  isOpen: boolean;
  sortOrder: string;
};

export function RoleForm({
  action,
  initial,
  id,
  submitLabel,
}: {
  action: Action;
  initial: RoleValues;
  id?: string;
  submitLabel: string;
}) {
  const uid = useId();
  const [state, formAction, pending] = useActionState<ContentState, FormData>(action, null);
  const sv = state?.values;
  const v: RoleValues = sv ? { ...initial, ...sv, isOpen: sv.isOpen === "on" } : initial;
  const e = state?.errors ?? {};
  const f = (n: string) => `${uid}-${n}`;

  return (
    <form key={JSON.stringify(sv ?? null)} action={formAction} className="space-y-5" noValidate>
      {id ? <input type="hidden" name="id" value={id} /> : null}
      <FormField id={f("title")} label="Role title" error={e.title}>
        {(a) => (
          <input {...a} name="title" defaultValue={v.title} maxLength={120} className={ui.input} />
        )}
      </FormField>
      <FormField id={f("background")} label="Background we're looking for" error={e.background}>
        {(a) => (
          <textarea
            {...a}
            name="background"
            rows={3}
            defaultValue={v.background}
            className={ui.input}
          />
        )}
      </FormField>
      <FormField id={f("owns")} label="What they would own" error={e.owns}>
        {(a) => <textarea {...a} name="owns" rows={3} defaultValue={v.owns} className={ui.input} />}
      </FormField>
      <div className="grid gap-5 md:grid-cols-2 md:items-start">
        <FormCheckbox
          id={f("isOpen")}
          name="isOpen"
          label="Open (shown on the team page)"
          defaultChecked={v.isOpen}
        />
        <FormField
          id={f("sortOrder")}
          label="Order"
          hint="Lower numbers come first."
          error={e.sortOrder}
        >
          {(a) => (
            <input
              {...a}
              name="sortOrder"
              inputMode="numeric"
              defaultValue={v.sortOrder}
              className={ui.input}
            />
          )}
        </FormField>
      </div>
      <Footer state={state} pending={pending} submitLabel={submitLabel} />
    </form>
  );
}
