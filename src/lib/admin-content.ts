import { z } from "zod";
import { LICENCES } from "./citation";

const text = (label: string, max: number, min = 1) =>
  z
    .string()
    .trim()
    .min(min, min === 1 ? `${label} can't be empty.` : `${label}: at least ${min} characters.`)
    .max(max, `${label}: keep it under ${max} characters.`);

const optionalUrl = (label: string) =>
  z
    .string()
    .trim()
    .max(2000)
    .refine((v) => {
      if (!v) return true;
      try {
        return new URL(v).protocol === "https:";
      } catch {
        return false;
      }
    }, `${label}: paste a full https:// link, or leave it empty.`);

const commaList = (label: string, maxItems: number, maxLen: number) =>
  z
    .string()
    .transform((s) =>
      s
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean),
    )
    .pipe(
      z
        .array(z.string().max(maxLen, `${label}: each under ${maxLen} characters.`))
        .max(maxItems, `${label}: at most ${maxItems}.`),
    );

export const newsSchema = z.object({
  title: text("Title", 140, 5),
  excerpt: text("Summary", 300, 20),
  body: text("Text", 20000, 20),
  tags: commaList("Tags", 6, 30),
  visibility: z.enum(["public", "members"], { error: "Choose who can read it." }),
  publish: z.enum(["draft", "published"]),
});

export const OUTPUT_TYPES = {
  working_paper: "Working paper",
  journal_article: "Journal article",
  preprint: "Preprint",
  dataset: "Dataset",
  software: "Software",
  policy_brief: "Policy brief",
} as const;

export const OUTPUT_STATUSES = {
  in_preparation: "In preparation (members only)",
  under_review: "Under review (members only)",
  published: "Published (public)",
} as const;

export const publicationSchema = z.object({
  title: text("Title", 200, 5),
  type: z.enum(Object.keys(OUTPUT_TYPES) as [keyof typeof OUTPUT_TYPES], {
    error: "Choose a type.",
  }),
  status: z.enum(Object.keys(OUTPUT_STATUSES) as [keyof typeof OUTPUT_STATUSES], {
    error: "Choose a status.",
  }),
  authors: text("Authors", 300),
  year: z
    .string()
    .trim()
    .refine((v) => v === "" || /^(19|20)\d\d$/.test(v), "Year: four digits, or leave it empty.")
    .transform((v) => (v ? Number(v) : null)),
  venue: z.string().trim().max(200, "Venue: keep it under 200 characters."),
  abstract: text("Abstract", 3000, 20),
  url: optionalUrl("Link"),
  pdfUrl: optionalUrl("PDF link"),
  codeUrl: optionalUrl("Code link"),
  dataUrl: optionalUrl("Data link"),
  licence: z
    .string()
    .trim()
    .refine((v) => v === "" || v in LICENCES, "Choose a licence from the list."),
  doi: z
    .string()
    .trim()
    .transform((v) => v.replace(/^https?:\/\/(dx\.)?doi\.org\//i, ""))
    .refine(
      (v) => v === "" || /^10\.\d{4,9}\/\S+$/.test(v),
      "DOI: like 10.1234/abcd, or leave it empty.",
    ),
  projectId: z.union([z.literal(""), z.uuid("Choose a programme from the list.")]),
});

export type NewsInput = z.input<typeof newsSchema>;
export type PublicationInput = z.input<typeof publicationSchema>;

const checkbox = z
  .string()
  .optional()
  .transform((v) => v === "on" || v === "true");

const sortOrder = z
  .string()
  .trim()
  .refine((v) => v === "" || /^-?\d{1,4}$/.test(v), "Order: a whole number, e.g. 1, 2, 3.")
  .transform((v) => (v ? Number(v) : 0));

export const personSchema = z.object({
  name: text("Name", 120, 2),
  role: text("Role", 120, 2),
  focus: text("Focus", 200, 2),
  bio: text("Bio", 1200, 20),
  photoUrl: z
    .string()
    .trim()
    .max(2000)
    .refine((v) => {
      if (!v) return true;
      if (v.startsWith("/") && !v.startsWith("//")) return true;
      try {
        return new URL(v).protocol === "https:";
      } catch {
        return false;
      }
    }, "Photo: an https:// link or a path like /team/rakib.jpg, or leave it empty."),
  email: z.union([z.literal(""), z.email("Email: check the address, or leave it empty.").max(200)]),
  linkedinUrl: optionalUrl("LinkedIn"),
  githubUrl: optionalUrl("GitHub"),
  scholarUrl: optionalUrl("Google Scholar"),
  isFounder: checkbox,
  isActive: checkbox,
  sortOrder,
});

export const openRoleSchema = z.object({
  title: text("Title", 120, 3),
  background: text("Background", 600, 10),
  owns: text("What they own", 600, 10),
  isOpen: checkbox,
  sortOrder,
});
