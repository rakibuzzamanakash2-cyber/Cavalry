import Link from "next/link";
import { JoinLink } from "./join-link";
import type { Output } from "@/content/publications";
import type { Programme } from "@/content/research";

type FinishedWorkCardProps = {
  programmes: Programme[];
  outputs: Output[];
};

/**
 * Home page card listing finished, public work only. Research in progress is
 * confidential and never appears here.
 */
export function FinishedWorkCard({ programmes, outputs }: FinishedWorkCardProps) {
  const items = [
    ...programmes.map((p) => ({
      key: `p-${p.slug}`,
      kind: "Programme",
      title: p.title,
      href: `/research/${p.slug}`,
    })),
    ...outputs.map((o) => ({
      key: `o-${o.slug}`,
      kind: o.type,
      title: o.title,
      href: "/publications",
    })),
  ].slice(0, 4);

  return (
    <article
      aria-labelledby="finished-work-title"
      className="border-line bg-surface flex flex-col border shadow-[6px_6px_0_0_var(--color-sand)]"
    >
      <header className="border-line tracking-caps flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b px-4 py-2.5 text-xs uppercase sm:px-5">
        <span className="text-accent-strong">Our work</span>
        <span className="text-muted">Published when finished</span>
      </header>

      <div className="flex flex-col gap-4 px-4 py-5 sm:px-5 lg:gap-[clamp(0.6rem,1.6dvh,1rem)] lg:py-[clamp(0.75rem,2dvh,1.25rem)]">
        <h2
          id="finished-work-title"
          className="text-2xl leading-tight sm:text-[1.75rem] lg:text-[clamp(1.35rem,3dvh,1.75rem)]"
        >
          Finished work
        </h2>

        {items.length > 0 ? (
          <ul className="border-line divide-line divide-y border-y">
            {items.map((item) => (
              <li key={item.key} className="py-2.5">
                <p className="text-muted tracking-caps text-xs uppercase">{item.kind}</p>
                <Link
                  href={item.href}
                  className="hover:text-accent font-serif text-lg leading-snug transition-colors"
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted border-accent border-l-2 pl-3 font-serif text-lg leading-snug italic lg:text-[clamp(1rem,2dvh,1.15rem)]">
            Our research is confidential while it is in progress. Completed programmes, papers,
            datasets and code will appear here, with everything needed to check them.
          </p>
        )}

        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div className="border-line border p-3">
            <dt className="text-muted tracking-caps text-xs uppercase">Completed programmes</dt>
            <dd className="mt-1 font-serif text-3xl leading-none">{programmes.length}</dd>
          </div>
          <div className="border-line border p-3">
            <dt className="text-muted tracking-caps text-xs uppercase">Published outputs</dt>
            <dd className="mt-1 font-serif text-3xl leading-none">{outputs.length}</dd>
          </div>
        </dl>
      </div>

      <footer className="border-line mt-auto border-t">
        <JoinLink
          className="text-primary hover:text-accent block px-4 py-3.5 text-sm font-medium transition-colors sm:px-5 lg:py-2.5"
          memberLabel="Open the workspace →"
        >
          Work with us →
        </JoinLink>
      </footer>
    </article>
  );
}
