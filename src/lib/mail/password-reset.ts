import "server-only";
import { site } from "@/lib/site";
import { renderEmail } from "./template";
import { sendMail } from "./transporter";

// Password reset emails, based on Ru'sAuth's passwordReset.ts and
// passwordUpdate.ts, with CAVALRY's wording and layout.

export const RESET_CODE_MINUTES = 10;

export function passwordResetCodeEmail(email: string, code: string) {
  return {
    to: email,
    subject: "Your CAVALRY password reset code",
    text: [
      `Your CAVALRY password reset code is ${code}.`,
      `It expires in ${RESET_CODE_MINUTES} minutes. Never share it with anyone.`,
      "",
      "If you didn't ask to reset your password, ignore this email. Your password stays the same.",
    ].join("\n"),
    html: renderEmail({
      heading: "Reset your password",
      blocks: [
        {
          kind: "paragraph",
          text: "You asked to reset the password for your CAVALRY account. Enter this code on the reset page to choose a new one.",
        },
        { kind: "code", label: "YOUR RESET CODE", value: code },
        {
          kind: "paragraph",
          text: `The code expires in ${RESET_CODE_MINUTES} minutes. Never share it with anyone, even someone who says they are from CAVALRY.`,
        },
        {
          kind: "paragraph",
          text: "If you didn't ask for this, ignore this email. Your password stays the same.",
        },
      ],
      footer: "CAVALRY research, Dhaka, Bangladesh. This is an automated email.",
    }),
  };
}

export function passwordChangedEmail(user: { name: string; email: string }) {
  const first = user.name.split(" ")[0] || "there";
  return {
    to: user.email,
    subject: "Your CAVALRY password was changed",
    text: [
      `Hi ${first},`,
      "",
      "The password for your CAVALRY account was just changed, and every device was signed out.",
      "",
      `If this was you, there's nothing else to do. If it wasn't, reset your password now at ${site.url}/forgot-password and contact us.`,
    ].join("\n"),
    html: renderEmail({
      heading: "Your password was changed",
      blocks: [
        { kind: "paragraph", text: `Hi ${first},` },
        {
          kind: "paragraph",
          text: "The password for your CAVALRY account was just changed, and every device was signed out.",
        },
        {
          kind: "paragraph",
          text: "If this was you, there's nothing else to do. If it wasn't, reset your password straight away and contact us.",
        },
        { kind: "button", label: "Reset password", href: `${site.url}/forgot-password` },
      ],
      footer: "CAVALRY research, Dhaka, Bangladesh. This is an automated email.",
    }),
  };
}

export const sendPasswordResetCode = (email: string, code: string) =>
  sendMail(passwordResetCodeEmail(email, code));
export const sendPasswordChanged = (user: { name: string; email: string }) =>
  sendMail(passwordChangedEmail(user));
