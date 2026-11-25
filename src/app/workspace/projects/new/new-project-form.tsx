"use client";

import { useActionState } from "react";
import { ui } from "@/components/ui";
import { createProject, type ActionState } from "../actions";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <span id={id} className="text-accent-strong mt-1 block text-sm">
      {message}
    </span>
  );
}

export function NewProjectForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(createProject, null);
  const e = state?.errors ?? {};

  return (
    <form action={action} className="space-y-5" noValidate>
      <label className="block">
        <span className={ui.label}>Project title</span>
        <input
          name="title"
          required
          maxLength={140}
          aria-invalid={Boolean(e.title)}
          aria-describedby={e.title ? "title-error" : undefined}
          className={ui.input}
        />
        <FieldError id="title-error" message={e.title} />
      </label>

      <label className="block">
        <span className={ui.label}>Short summary</span>
        <textarea
          name="summary"
          required
          rows={3}
          maxLength={600}
          aria-invalid={Boolean(e.summary)}
          aria-describedby={e.summary ? "summary-error" : "summary-hint"}
          className={ui.input}
        />
        <span id="summary-hint" className="text-muted mt-1 block text-xs">
          One or two sentences on what the project is about.
        </span>
        <FieldError id="summary-error" message={e.summary} />
      </label>

      <label className="block">
        <span className={ui.label}>Research question</span>
        <textarea
          name="question"
          required
          rows={3}
          maxLength={600}
          aria-invalid={Boolean(e.question)}
          aria-describedby={e.question ? "question-error" : undefined}
          className={ui.input}
        />
        <FieldError id="question-error" message={e.question} />
      </label>

      <label className="block">
        <span className={ui.label}>Your role on this project</span>
        <input
          name="role"
          required
          maxLength={60}
          placeholder="e.g. Principal investigator, Data lead"
          aria-invalid={Boolean(e.role)}
          aria-describedby={e.role ? "role-error" : "role-hint"}
          className={ui.input}
        />
        <span id="role-hint" className="text-muted mt-1 block text-xs">
          You lead the project; this is the work you do on it.
        </span>
        <FieldError id="role-error" message={e.role} />
      </label>

      {state && !state.ok ? (
        <p role="alert" className="border-accent text-accent-strong border-l-2 pl-3 text-sm">
          {state.message}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className={`${ui.button} w-full sm:w-auto`}>
        {pending ? "Opening…" : "Open project"}
      </button>
    </form>
  );
}
