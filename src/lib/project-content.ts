import { z } from "zod";

// The editable research content of a project. Shared by the editor (limits)
// and the server action (validation). Lists are capped to keep pages sane.

const text = (label: string, max: number, min = 1) =>
  z
    .string()
    .trim()
    .min(min, min === 1 ? `${label} can't be empty.` : `${label}: at least ${min} characters.`)
    .max(max, `${label}: keep it under ${max} characters.`);

const list = <T extends z.ZodType>(item: T, label: string, max = 20) =>
  z.array(item).max(max, `${label}: at most ${max} items.`);

export const LIST_FIELDS = {
  whyItMatters: {
    label: "Why it matters",
    fields: [{ key: "text", label: "Paragraph", long: true }],
  },
  subQuestions: {
    label: "Sub-questions & hypotheses",
    fields: [
      { key: "id", label: "Label (e.g. Q1)" },
      { key: "question", label: "Question", long: true },
      { key: "hypothesis", label: "Hypothesis", long: true },
    ],
  },
  design: {
    label: "Proposed design",
    fields: [
      { key: "term", label: "Term" },
      { key: "value", label: "Value", long: true },
    ],
  },
  dataSources: {
    label: "Candidate data",
    fields: [
      { key: "need", label: "What we need" },
      { key: "source", label: "Source" },
      { key: "role", label: "Role in the study", long: true },
    ],
  },
  approach: {
    label: "Proposed approach",
    fields: [
      { key: "title", label: "Step" },
      { key: "detail", label: "Detail", long: true },
    ],
  },
  scopes: {
    label: "Scope & fallbacks",
    fields: [
      { key: "plan", label: "Plan" },
      { key: "scope", label: "Scope", long: true },
      { key: "why", label: "Why", long: true },
    ],
  },
  stages: {
    label: "Roadmap stages",
    fields: [
      { key: "name", label: "Stage" },
      { key: "detail", label: "What it involves", long: true },
    ],
  },
  outputs: { label: "Planned outputs", fields: [{ key: "text", label: "Output", long: true }] },
  commitments: {
    label: "Integrity commitments",
    fields: [{ key: "text", label: "Commitment", long: true }],
  },
  highlights: {
    label: "Highlights (short facts for cards)",
    fields: [
      { key: "term", label: "Term" },
      { key: "value", label: "Value" },
    ],
  },
} as const;

export type ListKey = keyof typeof LIST_FIELDS;

const pair = (a: string, b: string, maxB = 600) =>
  z.object({ [a]: text(a, 120), [b]: text(b, maxB) } as Record<string, z.ZodString>);

export const projectContentSchema = z.object({
  title: text("Title", 140, 5),
  summary: text("Summary", 600, 20),
  question: text("Research question", 600, 20),
  statusLabel: text("Status label", 40),
  areas: list(text("Area", 60), "Areas", 8),
  leads: list(text("Lead", 80), "Leads", 8),
  currentStage: z.coerce.number().int().min(0),
  whyItMatters: list(text("Paragraph", 1200), "Why it matters"),
  subQuestions: list(
    z.object({
      id: text("Label", 12),
      question: text("Question", 600),
      hypothesis: text("Hypothesis", 600),
    }),
    "Sub-questions",
  ),
  design: list(pair("term", "value"), "Design"),
  dataSources: list(
    z.object({ need: text("Need", 160), source: text("Source", 200), role: text("Role", 600) }),
    "Data sources",
  ),
  approach: list(pair("title", "detail", 1000), "Approach"),
  scopes: list(
    z.object({ plan: text("Plan", 80), scope: text("Scope", 600), why: text("Why", 600) }),
    "Scopes",
  ),
  stages: list(pair("name", "detail"), "Stages", 12).min(1, "Keep at least one roadmap stage."),
  outputs: list(text("Output", 400), "Outputs"),
  commitments: list(text("Commitment", 400), "Commitments"),
  highlights: list(pair("term", "value", 120), "Highlights", 6),
});

export type ProjectContent = z.infer<typeof projectContentSchema>;
