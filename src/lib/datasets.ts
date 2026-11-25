import { z } from "zod";

/** Where a dataset link points, for the badge next to it. */
export function linkKind(url: string): "GitHub" | "Google Drive" | "Link" {
  try {
    const host = new URL(url).hostname.toLowerCase();
    if (host === "github.com" || host.endsWith(".github.com")) return "GitHub";
    if (host === "drive.google.com" || host === "docs.google.com") return "Google Drive";
  } catch {
    // fall through
  }
  return "Link";
}

export const datasetSchema = z.object({
  name: z.string().trim().min(2, "Give the dataset a name.").max(120, "Under 120 characters."),
  description: z
    .string()
    .trim()
    .min(10, "Say what the data is (at least 10 characters).")
    .max(1000, "Under 1000 characters."),
  usedFor: z
    .string()
    .trim()
    .min(10, "Say what we use it for (at least 10 characters).")
    .max(1000, "Under 1000 characters."),
  url: z
    .string()
    .trim()
    .max(2000, "That link is too long.")
    .refine((v) => {
      try {
        return new URL(v).protocol === "https:";
      } catch {
        return false;
      }
    }, "Paste a full https:// link (GitHub, Google Drive or another site)."),
  /** A project id, or "" for shared with every member. */
  projectId: z.union([z.literal(""), z.uuid("Choose a project from the list.")]),
});

export type DatasetInput = z.infer<typeof datasetSchema>;
