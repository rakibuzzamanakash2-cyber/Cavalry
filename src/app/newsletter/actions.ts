"use server";

import { randomBytes } from "node:crypto";
import { after } from "next/server";
import { getDb } from "@/lib/db";
import { allowFormSubmission } from "@/lib/form-rate-limit";
import { sendNewsletterWelcome } from "@/lib/mail/newsletter-welcome";
import { isValidEmail, normalizeEmail } from "@/lib/validation";

export type SubscribeState = { ok: boolean; message: string } | null;

const DONE = "Thanks! You're subscribed. Check your inbox for a confirmation.";

/**
 * Sign up for email updates. The reply is the same whether or not the address
 * was already subscribed, so the form can't be used to look people up.
 */
export async function subscribe(
  _prev: SubscribeState,
  formData: FormData,
): Promise<SubscribeState> {
  // Bots fill every field; people never see this one.
  if (String(formData.get("website") ?? "") !== "") return { ok: true, message: DONE };

  const email = normalizeEmail(String(formData.get("email") ?? ""));
  if (!isValidEmail(email)) return { ok: false, message: "Please enter a valid email address." };

  if (!(await allowFormSubmission("newsletter", 5, 60 * 60))) {
    return { ok: false, message: "Too many sign-ups from here. Please try again later." };
  }

  const existing = await getDb().newsletterSubscriber.findUnique({
    where: { email },
    select: { id: true },
  });
  if (!existing) {
    const token = randomBytes(24).toString("base64url");
    await getDb().newsletterSubscriber.create({ data: { email, unsubscribeToken: token } });
    after(() => sendNewsletterWelcome(email, token));
  }
  return { ok: true, message: DONE };
}

export type UnsubscribeState = { ok: boolean; message: string } | null;

/** Remove a subscriber by the token in their unsubscribe link. */
export async function unsubscribe(
  _prev: UnsubscribeState,
  formData: FormData,
): Promise<UnsubscribeState> {
  const token = String(formData.get("token") ?? "");
  if (token.length < 20 || token.length > 64) {
    return { ok: false, message: "This unsubscribe link isn't valid." };
  }
  const { count } = await getDb().newsletterSubscriber.deleteMany({
    where: { unsubscribeToken: token },
  });
  return count > 0
    ? { ok: true, message: "You're unsubscribed. We won't email you again." }
    : { ok: true, message: "This address is already unsubscribed." };
}
