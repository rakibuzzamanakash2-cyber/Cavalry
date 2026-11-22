import { z } from "zod";
import { applicationFields } from "@/content/research";

// Validation for applications, used by the server action (and safe to share).

export const applicationSchema = z.object({
  field: z.enum(applicationFields, { error: "Choose a field." }),
  motivation: z
    .string()
    .trim()
    .min(50, "Tell us a bit more (at least 50 characters).")
    .max(2000, "Please keep it under 2,000 characters."),
  background: z
    .string()
    .trim()
    .min(20, "Add a short background (at least 20 characters).")
    .max(1500, "Please keep it under 1,500 characters."),
  sampleUrl: z
    .string()
    .trim()
    .max(300)
    .refine(
      (v) => v === "" || /^https?:\/\/\S+$/i.test(v),
      "Use a full link starting with https://",
    )
    .transform((v) => (v === "" ? null : v)),
  hoursPerWeek: z.coerce
    .number({ error: "Enter a number of hours." })
    .int("Use whole hours.")
    .min(1, "At least 1 hour.")
    .max(40, "At most 40 hours."),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;

export type ApplicationStatus = "pending" | "accepted" | "rejected" | "withdrawn";

export const statusLabel: Record<ApplicationStatus, string> = {
  pending: "Under review",
  accepted: "Accepted",
  rejected: "Not accepted",
  withdrawn: "Withdrawn",
};
