import type { ReactNode } from "react";
import { Logo } from "@/components/logo";

// Ported from Ru'sAuth (src/app/component/AuthCard.tsx): logo on top, then the
// form, in a narrow centred column.
export function AuthCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex w-full flex-1 justify-center p-4">
      <div className="mt-8 flex h-fit w-full max-w-md flex-col gap-4 p-2 sm:mt-12 sm:p-6">
        <Logo withTagline={false} className="text-primary w-40" />
        <h1 className="mt-4 text-3xl">{title}</h1>
        {children}
      </div>
    </div>
  );
}
