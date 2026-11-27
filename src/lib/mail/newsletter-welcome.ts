import "server-only";
import { site } from "@/lib/site";
import { renderEmail } from "./template";
import { sendMail } from "./transporter";

export function unsubscribeUrl(token: string) {
  return `${site.url}/newsletter/unsubscribe?token=${encodeURIComponent(token)}`;
}

/** "You're subscribed" email, with the unsubscribe link every email must carry. */
export function newsletterWelcomeEmail(email: string, token: string) {
  const link = unsubscribeUrl(token);
  return {
    to: email,
    subject: "You're subscribed to CAVALRY research updates",
    text: [
      "Thanks for subscribing to CAVALRY research updates.",
      "",
      "We'll email you when we publish new papers, datasets and news. Not often, and only when there is something worth reading.",
      "",
      `To unsubscribe at any time: ${link}`,
      "",
      "CAVALRY research, Dhaka",
    ].join("\n"),
    html: renderEmail({
      heading: "You're subscribed",
      blocks: [
        { kind: "paragraph", text: "Thanks for subscribing to CAVALRY research updates." },
        {
          kind: "paragraph",
          text: "We'll email you when we publish new papers, datasets and news. Not often, and only when there is something worth reading.",
        },
        { kind: "button", label: "Visit our research", href: `${site.url}/research` },
        {
          kind: "paragraph",
          text: `Changed your mind? Unsubscribe here: ${link}`,
        },
      ],
      footer: "You're receiving this because this address was signed up on our website.",
    }),
  };
}

export function sendNewsletterWelcome(email: string, token: string) {
  return sendMail(newsletterWelcomeEmail(email, token));
}
