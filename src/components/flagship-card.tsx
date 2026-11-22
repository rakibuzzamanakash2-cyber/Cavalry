import Link from "next/link";
import { flagship } from "@/content/research";

/** The flagship programme, laid out like the front matter of a paper. */
export function FlagshipCard() {
  const { stages, currentStage } = flagship;
  return (
    <article
      aria-labelledby="flagship-title"
      className="border-line bg-surface flex flex-col border shadow-[6px_6px_0_0_var(--color-sand)]"
    >
      <header className="border-line tracking-caps flex items-center justify-between gap-3 border-b px-5 py-2.5 text-[0.6rem] uppercase sm:text-[0.65rem]">
        <span className="text-accent-strong whitespace-nowrap">{flagship.label}</span>
        <span className="text-muted flex shrink-0 items-center gap-2 whitespace-nowrap">
          <span className="relative flex size-2">
            <span className="bg-accent absolute inline-flex size-full animate-ping rounded-full opacity-50 motion-reduce:hidden" />
            <span className="bg-accent relative inline-flex size-2 rounded-full" />
          </span>
          In progress
        </span>
      </header>

      <div className="flex flex-col gap-[clamp(0.6rem,1.6dvh,1rem)] px-5 py-[clamp(0.75rem,2dvh,1.25rem)]">
        <h2 id="flagship-title" className="text-[clamp(1.35rem,3dvh,1.75rem)] leading-tight">
          {flagship.title}
        </h2>

        <div>
          <p className="tracking-caps text-muted text-[0.65rem] uppercase">Research question</p>
          <p className="border-accent mt-1 border-l-2 pl-3 font-serif text-[clamp(1rem,2dvh,1.15rem)] leading-snug italic">
            {flagship.question}
          </p>
        </div>

        <dl className="grid grid-cols-[5.5rem_1fr] gap-x-3 gap-y-1.5 text-[0.8rem] leading-snug">
          {flagship.facts.map((f) => (
            <div key={f.term} className="contents">
              <dt className="tracking-caps text-muted text-[0.65rem] uppercase">{f.term}</dt>
              <dd>{f.value}</dd>
            </div>
          ))}
        </dl>

        <div>
          <p className="tracking-caps text-muted text-[0.65rem] uppercase">
            Stage {currentStage + 1} of {stages.length} · {stages[currentStage]}
          </p>
          <ol className="mt-2 grid grid-cols-5 gap-1" aria-label="Research stages">
            {stages.map((stage, i) => {
              const state = i < currentStage ? "done" : i === currentStage ? "current" : "next";
              return (
                <li key={stage} aria-current={state === "current" ? "step" : undefined}>
                  <span
                    className={`block h-1 ${state === "next" ? "bg-line" : state === "current" ? "bg-accent" : "bg-primary"}`}
                  />
                  <span
                    className={`mt-1 block text-[0.6rem] tracking-wider uppercase ${state === "current" ? "text-accent-strong" : "text-muted"}`}
                  >
                    {stage}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      <footer className="border-line mt-auto border-t px-5 py-2.5">
        <Link
          href={`/research/${flagship.slug}`}
          className="tracking-caps text-primary hover:text-accent text-xs uppercase transition-colors"
        >
          Read the research programme →
        </Link>
      </footer>
    </article>
  );
}
