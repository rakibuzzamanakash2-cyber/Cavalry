import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  children?: ReactNode;
};

/** Standard heading block for inner pages. */
export function PageHeader({ eyebrow, title, children }: PageHeaderProps) {
  return (
    <header className="border-line border-b pt-8 pb-8 sm:pt-12 sm:pb-10">
      <p className="text-accent-strong tracking-caps text-xs uppercase">{eyebrow}</p>
      <h1 className="mt-3 max-w-4xl text-4xl leading-[1.1] sm:text-5xl">{title}</h1>
      {children ? (
        <div className="text-muted mt-4 max-w-3xl font-serif text-lg leading-snug italic sm:text-xl">
          {children}
        </div>
      ) : null}
    </header>
  );
}

/** Numbered section heading, e.g. "02 — Sub-questions". */
export function SectionHeading({
  number,
  id,
  children,
}: {
  number: string;
  id?: string;
  children: ReactNode;
}) {
  return (
    <h2 id={id} className="flex items-baseline gap-3 text-2xl leading-tight sm:text-3xl">
      <span className="text-accent tracking-caps font-sans text-xs tabular-nums">{number}</span>
      <span>{children}</span>
    </h2>
  );
}
