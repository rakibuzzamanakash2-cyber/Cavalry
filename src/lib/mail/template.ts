import { escapeHtml } from "./transporter";

// Email layout based on Ru'sAuth's template (src/mail/otpTemplate.ts), with
// CAVALRY's name and colours. Emails can't use CSS variables, so the palette
// values are written out here (same as src/app/globals.css).
const TEAL = "#1f5c5a";
const OCHRE = "#86600f";
const MUTED = "#645d51";
const LINE = "#d6cdbc";

export type EmailBlock =
  | { kind: "paragraph"; text: string }
  | { kind: "code"; label: string; value: string }
  | { kind: "button"; label: string; href: string };

export function renderEmail(input: {
  heading: string;
  blocks: EmailBlock[];
  footer: string;
}): string {
  const body = input.blocks
    .map((b) => {
      if (b.kind === "paragraph")
        return `<p style="margin:0 0 16px;font-size:15px;line-height:1.7;">${escapeHtml(b.text)}</p>`;
      if (b.kind === "code")
        return `<p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:1.5px;color:${MUTED};">${escapeHtml(b.label)}</p>
          <p style="margin:0 0 20px;padding:14px 12px;text-align:center;font-family:'Courier New',Courier,monospace;font-size:26px;line-height:1;font-weight:700;letter-spacing:4px;border:1px solid ${LINE};color:${TEAL};">${escapeHtml(b.value)}</p>`;
      return `<p style="margin:8px 0 20px;"><a href="${escapeHtml(b.href)}" style="display:inline-block;padding:12px 20px;background:${TEAL};color:#faf7f1;text-decoration:none;font-size:14px;font-weight:600;">${escapeHtml(b.label)}</a></p>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light dark" />
    <title>${escapeHtml(input.heading)}</title>
  </head>
  <body style="margin:0;padding:24px 16px;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;margin:0 auto;">
      <tr>
        <td style="padding:0 0 28px;">
          <span style="font-family:Georgia,serif;font-size:26px;font-style:italic;color:${TEAL};">CAVALRY</span>
          <span style="font-size:12px;letter-spacing:2px;color:${OCHRE};"> RESEARCH</span>
          <div style="height:2px;width:56px;background:${OCHRE};margin-top:8px;"></div>
        </td>
      </tr>
      <tr>
        <td>
          <h1 style="margin:0 0 14px;font-family:Georgia,serif;font-size:22px;line-height:1.35;color:${TEAL};">${escapeHtml(input.heading)}</h1>
          ${body}
        </td>
      </tr>
      <tr>
        <td style="padding:24px 0 0;border-top:1px solid ${LINE};font-size:12px;line-height:1.6;color:${MUTED};">${escapeHtml(input.footer)}</td>
      </tr>
    </table>
  </body>
</html>`;
}
