import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import nodemailer, { type Transporter } from "nodemailer";

// Ported from Ru'sAuth (src/mail/transporter.ts): Gmail through nodemailer
// when EMAIL_USER and EMAIL_PASS are set. Without them nothing is sent: in
// development the message is logged, and when MAIL_OUTBOX_DIR is set (tests)
// it is written there as JSON. Mail problems never block the caller.

export type MailInput = { to: string; subject: string; text: string; html: string };

const hasCredentials = Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);

let transporter: Transporter | undefined;
function getTransporter() {
  transporter ??= nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
  return transporter;
}

export function escapeHtml(value: string): string {
  const entities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return value.replace(/[&<>"']/g, (c) => entities[c]);
}

/** Send an email. Returns false (and logs) instead of throwing on failure. */
export async function sendMail(input: MailInput): Promise<boolean> {
  try {
    const outbox = process.env.MAIL_OUTBOX_DIR;
    if (outbox) {
      await mkdir(outbox, { recursive: true });
      await writeFile(
        path.join(outbox, `${Date.now()}-${randomUUID()}.json`),
        JSON.stringify(input),
      );
    }
    if (!hasCredentials) {
      if (process.env.NODE_ENV !== "production" && !outbox) {
        console.log(`[dev mail] To: ${input.to} | ${input.subject}\n${input.text}`);
      } else if (process.env.VERCEL_ENV === "production") {
        console.warn("[mail] EMAIL_USER and EMAIL_PASS are not set; email not sent.");
      }
      return Boolean(outbox);
    }
    await getTransporter().sendMail({
      from: `"CAVALRY research" <${process.env.EMAIL_USER}>`,
      ...input,
    });
    return true;
  } catch (error) {
    console.error("[mail] Could not send email:", error);
    return false;
  }
}
