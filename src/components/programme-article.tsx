import Link from "next/link";
import { SectionHeading } from "@/components/page-header";
import { StageTracker } from "@/components/stage-tracker";
import { stageStatus, type Programme } from "@/content/research";
import { formatDate } from "@/lib/format";
import { site } from "@/lib/site";

const sections = [
  { id: "question", label: "Research question" },
  { id: "sub-questions", label: "Sub-questions & hypotheses" },
  { id: "design", label: "Proposed design" },
  { id: "data", label: "Candidate data" },
  { id: "approach", label: "Proposed approach" },
  { id: "scope", label: "Scope & fallbacks" },
  { id: "roadmap", label: "Roadmap" },
  { id: "outputs", label: "Outputs & integrity" },
];

/** Full programme write-up. Rendered by the members' workspace and, once a programme is completed, by the public Research section. */
type ProgrammeArticleProps = {
  programme: Programme;
  /** Where the breadcrumb and "all research" link point (public or workspace). */
  backHref: string;
  backLabel: string;
  /** Public pages describe finished work; the workspace shows plans in progress. */
  audience: "public" | "workspace";
  /** Extra content under the header, e.g. the project team in the workspace. */
  children?: React.ReactNode;
};

export function ProgrammeArticle({
  programme: p,
  backHref,
  backLabel,
  audience,
  children,
}: ProgrammeArticleProps) {
  // New projects start almost empty: show only the sections that have content,
  // numbered in the order they appear.
  const filled: Record<string, boolean> = {
    question: true,
    "sub-questions": p.subQuestions.length > 0,
    design: p.design.length > 0,
    data: p.dataSources.length > 0,
    approach: p.approach.length > 0,
    scope: p.scopes.length > 0,
    roadmap: p.stages.length > 0,
    outputs: p.outputs.length > 0 || p.commitments.length > 0,
  };
  const visible = sections.filter((s) => filled[s.id]);
  const num = (id: string) => String(visible.findIndex((s) => s.id === id) + 1).padStart(2, "0");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ResearchProject",
    name: p.title,
    description: p.summary,
    url: `${site.url}/research/${p.slug}`,
    dateModified: p.lastUpdated,
    keywords: p.areas.join(", "),
    parentOrganization: { "@type": "ResearchOrganization", name: site.name, url: site.url },
  };

  return (
    <article className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
      {audience === "public" ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}

      <nav aria-label="Breadcrumb" className="tracking-caps pt-6 text-xs uppercase sm:pt-8">
        <ol className="text-muted flex flex-wrap items-center gap-2">
          <li>
            <Link href={backHref} className="hover:text-accent transition-colors">
              {backLabel}
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li aria-current="page" className="text-ink">
            Programme {p.number}
          </li>
        </ol>
      </nav>

      <header className="border-line border-b pt-6 pb-8 sm:pb-10">
        <div className="tracking-caps flex flex-wrap items-center gap-x-4 gap-y-1 text-xs uppercase">
          <span className="text-accent-strong">{p.label}</span>
          <span className="text-muted flex items-center gap-2">
            <span className="bg-accent inline-block size-2 rounded-full" aria-hidden />
            {p.status} · protocol stage
          </span>
        </div>
        <h1 className="mt-3 max-w-4xl text-4xl leading-[1.1] sm:text-5xl">{p.title}</h1>
        <p className="text-muted mt-4 max-w-3xl font-serif text-lg leading-snug italic sm:text-xl">
          {p.summary}
        </p>
        <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 text-sm sm:flex sm:flex-wrap sm:gap-x-10">
          <div>
            <dt className="text-muted tracking-caps text-xs uppercase">Leads</dt>
            <dd className="mt-1">{p.leads.join(", ")}</dd>
          </div>
          <div>
            <dt className="text-muted tracking-caps text-xs uppercase">Areas</dt>
            <dd className="mt-1">{p.areas.length > 0 ? p.areas.join(" · ") : "Not set yet"}</dd>
          </div>
          <div>
            <dt className="text-muted tracking-caps text-xs uppercase">Last updated</dt>
            <dd className="mt-1">
              <time dateTime={p.lastUpdated}>{formatDate(p.lastUpdated)}</time>
            </dd>
          </div>
        </dl>
      </header>

      {children}

      <div className="grid gap-10 pt-8 lg:grid-cols-12 lg:gap-12 lg:pt-12">
        <aside className="lg:order-2 lg:col-span-4">
          <div className="border-line bg-sand/40 space-y-6 border p-5 lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
            <StageTracker stages={p.stages.map((s) => s.name)} current={p.currentStage} />
            <nav aria-label="On this page" className="hidden lg:block">
              <p className="text-muted tracking-caps text-xs uppercase">On this page</p>
              <ol className="mt-2 space-y-1.5 text-sm">
                {visible.map((s, i) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="text-ink hover:text-accent flex gap-3 transition-colors"
                    >
                      <span className="text-muted w-5 tabular-nums">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {s.label}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
            <p className="text-muted border-line border-t pt-4 text-xs leading-relaxed">
              This programme is at its protocol stage. The design below is our current plan; changes
              after the data audit will be logged here with the date and reason.
            </p>
          </div>
        </aside>

        <div className="min-w-0 space-y-12 sm:space-y-14 lg:order-1 lg:col-span-8">
          <section aria-labelledby="question">
            <SectionHeading number={num("question")} id="question">
              Research question
            </SectionHeading>
            <blockquote className="border-accent mt-5 border-l-2 pl-4 font-serif text-xl leading-snug italic sm:text-2xl">
              {p.question}
            </blockquote>
            {p.whyItMatters.length > 0 ? (
              <>
                <h3 className="mt-8 text-xl">Why it matters</h3>
                <div className="mt-3 space-y-4 leading-relaxed">
                  {p.whyItMatters.map((para) => (
                    <p key={para.slice(0, 24)}>{para}</p>
                  ))}
                </div>
              </>
            ) : null}
          </section>

          {filled["sub-questions"] ? (
            <section aria-labelledby="sub-questions">
              <SectionHeading number={num("sub-questions")} id="sub-questions">
                Sub-questions &amp; hypotheses
              </SectionHeading>
              <ol className="border-line divide-line mt-5 divide-y border-y">
                {p.subQuestions.map((q) => (
                  <li key={q.id} className="grid gap-2 py-4 sm:grid-cols-[4rem_1fr] sm:gap-4">
                    <span className="text-accent-strong tracking-caps text-xs tabular-nums sm:pt-1">
                      {q.id}
                    </span>
                    <div>
                      <p className="font-serif text-lg leading-snug font-semibold">{q.question}</p>
                      <p className="text-muted mt-1 text-sm leading-relaxed">
                        <span className="text-ink font-medium">Hypothesis: </span>
                        {q.hypothesis}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}

          {filled["design"] ? (
            <section aria-labelledby="design">
              <SectionHeading number={num("design")} id="design">
                Proposed design
              </SectionHeading>
              <dl className="border-line divide-line mt-5 divide-y border-y">
                {p.design.map((d) => (
                  <div key={d.term} className="grid gap-1 py-3 sm:grid-cols-[8rem_1fr] sm:gap-4">
                    <dt className="text-muted tracking-caps text-xs uppercase sm:pt-0.5">
                      {d.term}
                    </dt>
                    <dd className="leading-relaxed">{d.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}

          {filled["data"] ? (
            <section aria-labelledby="data">
              <SectionHeading number={num("data")} id="data">
                Candidate data
              </SectionHeading>
              <p className="text-muted mt-3 leading-relaxed">
                Coverage of each source is confirmed at the data audit before the sample is fixed.
              </p>
              <div className="border-line mt-5 border-y">
                <div
                  className="text-muted border-line tracking-caps hidden grid-cols-[9rem_1fr_1fr] gap-4 border-b py-2 text-xs uppercase md:grid"
                  aria-hidden
                >
                  <span>Need</span>
                  <span>Source</span>
                  <span>Role</span>
                </div>
                <ul className="divide-line divide-y">
                  {p.dataSources.map((d) => (
                    <li
                      key={d.source}
                      className="grid gap-1 py-3 md:grid-cols-[9rem_1fr_1fr] md:gap-4"
                    >
                      <span className="text-muted tracking-caps text-xs uppercase md:pt-0.5">
                        {d.need}
                      </span>
                      <span className="font-medium">{d.source}</span>
                      <span className="text-muted text-sm leading-relaxed">{d.role}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ) : null}

          {filled["approach"] ? (
            <section aria-labelledby="approach">
              <SectionHeading number={num("approach")} id="approach">
                Proposed approach
              </SectionHeading>
              <ol className="mt-5 space-y-4">
                {p.approach.map((a, i) => (
                  <li key={a.title} className="flex gap-4">
                    <span className="text-accent font-serif text-2xl leading-none tabular-nums">
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="text-lg leading-snug">{a.title}</h3>
                      <p className="text-muted mt-1 leading-relaxed">{a.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <p className="border-line text-muted mt-6 border-l-2 pl-4 text-sm leading-relaxed">
                Any forecasting work is labelled as prediction and kept separate from the causal
                estimates.
              </p>
            </section>
          ) : null}

          {filled["scope"] ? (
            <section aria-labelledby="scope">
              <SectionHeading number={num("scope")} id="scope">
                Scope &amp; fallbacks
              </SectionHeading>
              <p className="text-muted mt-3 leading-relaxed">
                The data audit decides how wide the study can be. We commit to the largest scope the
                data can honestly support.
              </p>
              <ul className="mt-5 grid gap-4 sm:grid-cols-3">
                {p.scopes.map((s) => (
                  <li key={s.plan} className="border-line border p-4">
                    <p className="text-accent font-serif text-3xl leading-none">{s.plan}</p>
                    <p className="mt-3 font-medium">{s.scope}</p>
                    <p className="text-muted mt-1 text-sm leading-relaxed">{s.why}</p>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {filled["roadmap"] ? (
            <section aria-labelledby="roadmap">
              <SectionHeading number={num("roadmap")} id="roadmap">
                Roadmap
              </SectionHeading>
              <ol className="mt-5">
                {p.stages.map((s, i) => {
                  const state = stageStatus(i, p.currentStage);
                  return (
                    <li
                      key={s.name}
                      className="relative flex gap-4 pb-6 last:pb-0"
                      aria-current={state === "current" ? "step" : undefined}
                    >
                      <span className="flex flex-col items-center" aria-hidden>
                        <span
                          className={`mt-1 size-3 shrink-0 rounded-full border-2 ${
                            state === "current"
                              ? "border-accent bg-accent"
                              : state === "done"
                                ? "border-primary bg-primary"
                                : "border-line bg-surface"
                          }`}
                        />
                        {i < p.stages.length - 1 ? (
                          <span className="bg-line mt-1 w-px flex-1" />
                        ) : null}
                      </span>
                      <div>
                        <h3 className="flex flex-wrap items-baseline gap-x-3 text-lg leading-snug">
                          {s.name}
                          {state === "current" ? (
                            <span className="text-accent-strong tracking-caps font-sans text-xs uppercase">
                              Current stage
                            </span>
                          ) : null}
                        </h3>
                        <p className="text-muted mt-1 leading-relaxed">{s.detail}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          ) : null}

          {filled["outputs"] ? (
            <section aria-labelledby="outputs">
              <SectionHeading number={num("outputs")} id="outputs">
                Outputs &amp; integrity
              </SectionHeading>
              <div className="mt-5 grid gap-8 sm:grid-cols-2">
                <div>
                  <h3 className="text-lg">What we will publish</h3>
                  <ul className="mt-3 space-y-2">
                    {p.outputs.map((o) => (
                      <li key={o} className="flex gap-3 leading-relaxed">
                        <span
                          className="text-accent mt-2.5 size-1.5 shrink-0 rotate-45 bg-current"
                          aria-hidden
                        />
                        {o}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg">How we keep it honest</h3>
                  <ul className="mt-3 space-y-2">
                    {p.commitments.map((c) => (
                      <li key={c} className="flex gap-3 leading-relaxed">
                        <span
                          className="text-accent mt-2.5 size-1.5 shrink-0 rotate-45 bg-current"
                          aria-hidden
                        />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          ) : null}

          <nav
            aria-label="Programme navigation"
            className="border-line flex flex-col gap-3 border-t pt-8 sm:flex-row sm:justify-between"
          >
            <Link
              href={backHref}
              className="text-primary hover:text-accent tracking-caps text-xs uppercase transition-colors"
            >
              ← {backLabel}
            </Link>
            {audience === "public" ? (
              <Link
                href="/contact"
                className="text-primary hover:text-accent tracking-caps text-xs uppercase transition-colors"
              >
                Ask about this programme →
              </Link>
            ) : null}
          </nav>
        </div>
      </div>
    </article>
  );
}
