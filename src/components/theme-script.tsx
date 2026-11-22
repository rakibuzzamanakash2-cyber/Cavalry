"use client";

import { themeInitScript } from "@/lib/theme";

/**
 * Applies the saved or system theme before first paint.
 *
 * Rendered in <head> by the root layout. On the server it is a normal script,
 * so the browser runs it while parsing the HTML. When React renders it in the
 * browser it becomes type="text/plain": React no longer warns about rendering
 * a <script>, and suppressHydrationWarning accepts the different type. This is
 * the InlineScript pattern from the Next.js "preventing flash" guide.
 */
export function ThemeScript() {
  return (
    <script
      id="theme-init"
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: themeInitScript }}
    />
  );
}
