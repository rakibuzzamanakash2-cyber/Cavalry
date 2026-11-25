"use client";

import Link from "next/link";
import { useActionState, useId, useState } from "react";
import { ui } from "@/components/ui";
import { LIST_FIELDS, type ListKey, type ProjectContent } from "@/lib/project-content";
import { updateProjectContent, type ActionState } from "../../actions";

type Row = Record<string, string>;
type Lists = Record<ListKey, Row[]>;

const STRING_LISTS = ["whyItMatters", "outputs", "commitments"] as const;
const isStringList = (k: ListKey): k is (typeof STRING_LISTS)[number] =>
  (STRING_LISTS as readonly string[]).includes(k);

function toRows(content: ProjectContent): Lists {
  const out = {} as Lists;
  for (const key of Object.keys(LIST_FIELDS) as ListKey[]) {
    const value = content[key] as unknown[];
    out[key] = isStringList(key)
      ? (value as string[]).map((text) => ({ text }))
      : (value as Row[]).map((r) => ({ ...r }));
  }
  return out;
}

function fromRows(lists: Lists) {
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(lists) as ListKey[]) {
    out[key] = isStringList(key) ? lists[key].map((r) => r.text ?? "") : lists[key];
  }
  return out;
}

function ListEditor({
  listKey,
  rows,
  onChange,
}: {
  listKey: ListKey;
  rows: Row[];
  onChange: (rows: Row[]) => void;
}) {
  const uid = useId();
  const spec = LIST_FIELDS[listKey];
  const empty = () => Object.fromEntries(spec.fields.map((f) => [f.key, ""]));
  const move = (i: number, by: number) => {
    const next = [...rows];
    const [item] = next.splice(i, 1);
    next.splice(i + by, 0, item);
    onChange(next);
  };

  return (
    <fieldset className="border-line border-t pt-6">
      <legend className="pr-3 font-serif text-2xl">{spec.label}</legend>
      {rows.length === 0 ? <p className="text-muted mt-2 text-sm">Nothing here yet.</p> : null}
      <ol className="mt-3 space-y-4">
        {rows.map((row, i) => (
          <li key={i} className="border-line bg-surface border p-4">
            <div className="grid gap-3 md:grid-cols-2">
              {spec.fields.map((f) => {
                const id = `${uid}-${i}-${f.key}`;
                const long = "long" in f && f.long;
                const common = {
                  id,
                  value: row[f.key] ?? "",
                  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                    onChange(rows.map((r, j) => (j === i ? { ...r, [f.key]: e.target.value } : r))),
                  className: ui.input,
                };
                return (
                  <div key={f.key} className={long ? "md:col-span-2" : undefined}>
                    <label htmlFor={id} className={ui.label}>
                      {f.label}
                      <span className="sr-only">
                        {" "}
                        ({spec.label}, item {i + 1})
                      </span>
                    </label>
                    {long ? <textarea rows={3} {...common} /> : <input {...common} />}
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className={ui.ghostSm}
                disabled={i === 0}
                onClick={() => move(i, -1)}
              >
                Move up
                <span className="sr-only">
                  {" "}
                  ({spec.label}, item {i + 1})
                </span>
              </button>
              <button
                type="button"
                className={ui.ghostSm}
                disabled={i === rows.length - 1}
                onClick={() => move(i, 1)}
              >
                Move down
                <span className="sr-only">
                  {" "}
                  ({spec.label}, item {i + 1})
                </span>
              </button>
              <button
                type="button"
                className={ui.ghostSm}
                onClick={() => onChange(rows.filter((_, j) => j !== i))}
              >
                Remove
                <span className="sr-only">
                  {" "}
                  ({spec.label}, item {i + 1})
                </span>
              </button>
            </div>
          </li>
        ))}
      </ol>
      <button
        type="button"
        className={`${ui.ghostSm} mt-4`}
        onClick={() => onChange([...rows, empty()])}
      >
        + Add<span className="sr-only"> to {spec.label}</span>
      </button>
    </fieldset>
  );
}

export function ProjectEditor({
  projectId,
  slug,
  initial,
}: {
  projectId: string;
  slug: string;
  initial: ProjectContent;
}) {
  const uid = useId();
  const [state, action, pending] = useActionState<ActionState, FormData>(
    updateProjectContent,
    null,
  );
  const [basics, setBasics] = useState({
    title: initial.title,
    summary: initial.summary,
    question: initial.question,
    statusLabel: initial.statusLabel,
    areas: initial.areas.join(", "),
    leads: initial.leads.join(", "),
    currentStage: String(initial.currentStage),
  });
  const [lists, setLists] = useState<Lists>(() => toRows(initial));
  const set = (k: keyof typeof basics) => (e: { target: { value: string } }) =>
    setBasics((b) => ({ ...b, [k]: e.target.value }));
  const split = (s: string) =>
    s
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);

  const payload = JSON.stringify({
    ...basics,
    areas: split(basics.areas),
    leads: split(basics.leads),
    ...fromRows(lists),
  });
  const stageCount = lists.stages.length;
  const id = (k: string) => `${uid}-${k}`;

  return (
    <form action={action} className="space-y-10">
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="payload" value={payload} />

      <fieldset className="space-y-5">
        <legend className="font-serif text-2xl">Basics</legend>
        <div>
          <label htmlFor={id("title")} className={ui.label}>
            Title
          </label>
          <input
            id={id("title")}
            value={basics.title}
            onChange={set("title")}
            className={ui.input}
          />
        </div>
        <div>
          <label htmlFor={id("summary")} className={ui.label}>
            Summary
          </label>
          <textarea
            id={id("summary")}
            rows={3}
            value={basics.summary}
            onChange={set("summary")}
            className={ui.input}
          />
        </div>
        <div>
          <label htmlFor={id("question")} className={ui.label}>
            Research question
          </label>
          <textarea
            id={id("question")}
            rows={3}
            value={basics.question}
            onChange={set("question")}
            className={ui.input}
          />
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label htmlFor={id("areas")} className={ui.label}>
              Research areas (comma-separated)
            </label>
            <input
              id={id("areas")}
              value={basics.areas}
              onChange={set("areas")}
              className={ui.input}
            />
          </div>
          <div>
            <label htmlFor={id("leads")} className={ui.label}>
              Leads shown on the page (comma-separated)
            </label>
            <input
              id={id("leads")}
              value={basics.leads}
              onChange={set("leads")}
              className={ui.input}
            />
          </div>
          <div>
            <label htmlFor={id("statusLabel")} className={ui.label}>
              Status label
            </label>
            <input
              id={id("statusLabel")}
              value={basics.statusLabel}
              onChange={set("statusLabel")}
              placeholder="e.g. In progress"
              className={ui.input}
            />
          </div>
          <div>
            <label htmlFor={id("currentStage")} className={ui.label}>
              Current stage
            </label>
            <select
              id={id("currentStage")}
              value={Math.min(Number(basics.currentStage), Math.max(stageCount - 1, 0))}
              onChange={set("currentStage")}
              className={ui.input}
            >
              {lists.stages.map((s, i) => (
                <option key={i} value={i}>
                  {i + 1}. {s.name || "(unnamed stage)"}
                </option>
              ))}
            </select>
          </div>
        </div>
      </fieldset>

      {(Object.keys(LIST_FIELDS) as ListKey[]).map((key) => (
        <ListEditor
          key={key}
          listKey={key}
          rows={lists[key]}
          onChange={(rows) => setLists((l) => ({ ...l, [key]: rows }))}
        />
      ))}

      <div className="border-line bg-surface/95 sticky bottom-0 -mx-4 flex flex-wrap items-center gap-4 border-t px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
        <button type="submit" disabled={pending} className={ui.button}>
          {pending ? "Saving…" : "Save changes"}
        </button>
        <Link href={`/workspace/projects/${slug}`} className={ui.link}>
          View project
        </Link>
        {state ? (
          <p
            role={state.ok ? "status" : "alert"}
            className={`text-sm ${state.ok ? "text-muted" : "text-accent-strong"}`}
          >
            {state.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
