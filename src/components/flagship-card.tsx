import Link from "next/link";
import { flagship } from "@/content/research";
import { StageTracker } from "./stage-tracker";

/** The flagship programme, laid out like the front matter of a paper. */
export function FlagshipCard() {
  const { stages, currentStage } = flagship;
  return (
    <article
      aria-labelledby="flagship-title"
      className="border-line bg-surface flex flex-col border shadow-[6px_6px_0_0_var(--color-sand)]"
    >
      <header className="border-line tracking-caps flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b px-4 py-2.5 text-xs uppercase sm:px-5 sm:text-xs">
        <span className="text-accent-strong whitespace-nowrap">{flagship.label}</span>
        <span className="text-muted flex shrink-0 items-center gap-2 whitespace-nowrap">
          <span className="relative flex size-2">
            <span className="bg-accent absolute inline-flex size-full animate-ping rounded-full opacity-50 motion-reduce:hidden" />
            <span className="bg-accent relative inline-flex size-2 rounded-full" />
          </span>
          In progress
        </span>
      </header>

      <div className="flex flex-col gap-4 px-4 py-5 sm:px-5 lg:gap-[clamp(0.6rem,1.6dvh,1rem)] lg:py-[clamp(0.75rem,2dvh,1.25rem)]">
        <h2
          id="flagship-title"
          className="text-2xl leading-tight sm:text-[1.75rem] lg:text-[clamp(1.35rem,3dvh,1.75rem)]"
        >
          {flagship.title}
        </h2>

        <div>
          <p className="tracking-caps text-muted text-xs uppercase">Research question</p>
          <p className="border-accent mt-1 border-l-2 pl-3 font-serif text-lg leading-snug italic lg:text-[clamp(1rem,2dvh,1.15rem)]">
            {flagship.question}
          </p>
        </div>

        <div>
          <p className="tracking-caps text-muted text-xs uppercase">
            Planned design{" "}
            <span className="tracking-normal normal-case">· confirmed in the protocol</span>
          </p>
          <dl className="mt-2 grid grid-cols-1 gap-x-3 gap-y-0.5 text-sm leading-snug min-[400px]:grid-cols-[5rem_1fr] min-[400px]:gap-y-1.5 lg:text-[0.8rem]">
            {flagship.facts.map((f, i) => (
              <div key={f.term} className="contents">
                <dt
                  className={`text-muted text-xs tracking-wider uppercase min-[400px]:mt-0 ${i > 0 ? "mt-2" : ""}`}
                >
                  {f.term}
                </dt>
                <dd>{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <StageTracker stages={stages} current={currentStage} />
      </div>

      <footer className="border-line mt-auto border-t">
        <Link
          href={`/research/${flagship.slug}`}
          className="tracking-caps text-primary hover:text-accent block px-4 py-3.5 text-xs uppercase transition-colors sm:px-5 lg:py-2.5"
        >
          Read the research programme →
        </Link>
      </footer>
    </article>
  );
}
