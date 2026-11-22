"use client";

import { useActionState } from "react";
import { applicationFields } from "@/content/research";
import { submitApplication, type ApplyState } from "./actions";

const input =
  "border-line bg-surface text-ink focus:border-accent mt-1 block w-full border px-3 py-2.5 outline-none transition-colors";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <span id={id} className="text-accent-strong mt-1 block text-sm">
      {message}
    </span>
  );
}

export function ApplyForm() {
  const [state, action, pending] = useActionState<ApplyState, FormData>(submitApplication, null);
  const e = state?.errors ?? {};

  return (
    <form action={action} className="space-y-5" noValidate>
      <div>
        <label htmlFor="apply-field" className="text-muted tracking-caps text-xs uppercase">
          Field
        </label>
        <select
          id="apply-field"
          name="field"
          required
          defaultValue=""
          aria-invalid={Boolean(e.field)}
          aria-describedby={e.field ? "field-error" : undefined}
          className={input}
        >
          <option value="" disabled>
            Choose the field you want to work in
          </option>
          {applicationFields.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
        <FieldError id="field-error" message={e.field} />
      </div>

      <label className="block">
        <span className="text-muted tracking-caps text-xs uppercase">Why do you want to join?</span>
        <textarea
          name="motivation"
          required
          rows={5}
          maxLength={2000}
          aria-invalid={Boolean(e.motivation)}
          aria-describedby={e.motivation ? "motivation-error" : "motivation-hint"}
          className={input}
        />
        <span id="motivation-hint" className="text-muted mt-1 block text-xs">
          What interests you about this field, and what would you like to work on?
        </span>
        <FieldError id="motivation-error" message={e.motivation} />
      </label>

      <label className="block">
        <span className="text-muted tracking-caps text-xs uppercase">Your background</span>
        <textarea
          name="background"
          required
          rows={4}
          maxLength={1500}
          aria-invalid={Boolean(e.background)}
          aria-describedby={e.background ? "background-error" : "background-hint"}
          className={input}
        />
        <span id="background-hint" className="text-muted mt-1 block text-xs">
          Studies, skills and any research or projects you have done.
        </span>
        <FieldError id="background-error" message={e.background} />
      </label>

      <div className="grid gap-5 sm:grid-cols-[1fr_10rem]">
        <label className="block">
          <span className="text-muted tracking-caps text-xs uppercase">
            Sample of your work (optional)
          </span>
          <input
            name="sampleUrl"
            type="url"
            inputMode="url"
            placeholder="https://github.com/…"
            aria-invalid={Boolean(e.sampleUrl)}
            aria-describedby={e.sampleUrl ? "sample-error" : undefined}
            className={input}
          />
          <FieldError id="sample-error" message={e.sampleUrl} />
        </label>
        <label className="block">
          <span className="text-muted tracking-caps text-xs uppercase">Hours per week</span>
          <input
            name="hoursPerWeek"
            type="number"
            min={1}
            max={40}
            required
            aria-invalid={Boolean(e.hoursPerWeek)}
            aria-describedby={e.hoursPerWeek ? "hours-error" : undefined}
            className={input}
          />
          <FieldError id="hours-error" message={e.hoursPerWeek} />
        </label>
      </div>

      {state && !state.ok ? (
        <p role="alert" className="border-accent text-accent-strong border-l-2 pl-3 text-sm">
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="bg-primary text-primary-foreground hover:bg-accent tracking-caps w-full px-5 py-3.5 text-xs uppercase transition-colors disabled:opacity-60 sm:w-auto"
      >
        {pending ? "Sending…" : "Send application"}
      </button>
    </form>
  );
}
