"use client";

// Carries the email (and, after checking it, the code) between the three reset
// pages. Ru'sAuth keeps this in a short-lived cookie; here it lives in this
// tab's sessionStorage and is cleared when the reset finishes.

const KEY = "cavalry-password-reset";

export type ResetFlow = { email: string; otp?: string };

export function readResetFlow(): ResetFlow | null {
  try {
    const v = JSON.parse(sessionStorage.getItem(KEY) ?? "null");
    return v && typeof v.email === "string" ? v : null;
  } catch {
    return null;
  }
}

export function writeResetFlow(flow: ResetFlow) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(flow));
  } catch {
    // Storage blocked: the pages ask the person to start again.
  }
}

export function clearResetFlow() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {}
}

/** Friendly text for the email-code errors Better Auth returns. */
export function resetErrorMessage(error: { code?: string; message?: string }) {
  switch (error.code) {
    case "INVALID_OTP":
      return "That code isn't right. Check the email and try again.";
    case "OTP_EXPIRED":
      return "That code has expired. Request a new one.";
    case "TOO_MANY_ATTEMPTS":
      return "Too many wrong codes. Request a new one.";
    default:
      return error.message ?? "Something went wrong. Please try again.";
  }
}
