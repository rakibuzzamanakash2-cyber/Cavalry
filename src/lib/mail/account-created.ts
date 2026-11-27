import "server-only";
import { site } from "@/lib/site";
import { renderEmail } from "./template";
import { sendMail } from "./transporter";

/** Confirmation that a new CAVALRY account was created (email or Google sign-up). */
export function accountCreatedEmail(user: { name: string; email: string; uid: string }) {
  const first = user.name.split(" ")[0] || "there";
  const accountUrl = `${site.url}/account`;
  return {
    to: user.email,
    subject: "Your CAVALRY account has been created",
    text: [
      `Hi ${first},`,
      "",
      "You have successfully created your CAVALRY research account.",
      `Your account ID is ${user.uid}. You can sign in with your email, this ID or a username you choose.`,
      "",
      `Your account: ${accountUrl}`,
      "",
      "If you didn't create this account, reply to this email or contact us and we'll remove it.",
      "",
      "CAVALRY research, Dhaka",
    ].join("\n"),
    html: renderEmail({
      heading: "Your account has been created",
      blocks: [
        { kind: "paragraph", text: `Hi ${first},` },
        {
          kind: "paragraph",
          text: "You have successfully created your CAVALRY research account. Welcome!",
        },
        { kind: "code", label: "YOUR ACCOUNT ID", value: user.uid },
        {
          kind: "paragraph",
          text: "You can sign in with your email, this ID or a username you choose on your account page.",
        },
        { kind: "button", label: "Open your account", href: accountUrl },
        {
          kind: "paragraph",
          text: "If you didn't create this account, contact us and we'll remove it.",
        },
      ],
      footer: "CAVALRY research, Dhaka, Bangladesh. This is an automated email.",
    }),
  };
}

export function sendAccountCreated(user: { name: string; email: string; uid: string }) {
  return sendMail(accountCreatedEmail(user));
}
