import type { ReactNode } from "react";
import { Logo } from "@/components/logo";

/** Centered card used by the sign-in and sign-up pages. */
export function AuthShell({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10 sm:px-6">
      <Logo withTagline={false} className="text-primary mx-auto w-40" />
      <div className="border-line bg-surface mt-8 border p-6 shadow-[6px_6px_0_0_var(--color-sand)] sm:p-8">
        <h1 className="text-3xl">{title}</h1>
        <p className="text-muted mt-2 leading-relaxed">{intro}</p>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
