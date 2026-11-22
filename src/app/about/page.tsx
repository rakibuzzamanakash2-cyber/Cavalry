import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, SectionHeading } from "@/components/page-header";
import { principles } from "@/content/research";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "CAVALRY research is an independent, research-first group in Dhaka that connects careful research to methods, prototypes and useful systems.",
};

const promise = [
  {
    word: "Research",
    detail: "Establish what is true and what is still uncertain, with methods others can check.",
  },
  {
    word: "Develop",
    detail: "Turn validated insight into methods, datasets and prototypes.",
  },
  {
    word: "Build",
    detail: "Deliver tools or systems that meet a real need — only when the evidence supports it.",
  },
];

const facts = [
  { term: "Founded", value: "2026" },
  { term: "Base", value: site.location },
  { term: "Model", value: "Independent, research-first" },
  { term: "Stage", value: "Founding team, first programme in progress" },
];

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
      <PageHeader eyebrow="About" title="An independent group for careful research">
        We investigate important problems, build credible methods and turn what holds up into tools
        people can use. Quality is the standard, not a final-stage decoration.
      </PageHeader>

      <section aria-labelledby="promise" className="py-10 sm:py-14">
        <SectionHeading number="01" id="promise">
          Research. Develop. Build.
        </SectionHeading>
        <ol className="mt-6 grid gap-6 md:grid-cols-3">
          {promise.map((p, i) => (
            <li key={p.word} className="border-line border-t-2 pt-4">
              <p className="text-accent tracking-caps font-sans text-xs tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-2 text-2xl">{p.word}</h3>
              <p className="text-muted mt-2 leading-relaxed">{p.detail}</p>
            </li>
          ))}
        </ol>
      </section>

      <section
        aria-labelledby="how"
        className="border-line grid gap-8 border-t py-10 sm:py-14 lg:grid-cols-12"
      >
        <div className="lg:col-span-7">
          <SectionHeading number="02" id="how">
            How we work
          </SectionHeading>
          <div className="mt-5 space-y-4 leading-relaxed">
            <p>
              We are deliberately small. A few people who complete rigorous, reviewable work matter
              more to us than a large group with unclear contributions. Responsibilities grow from
              finished work, not from titles.
            </p>
            <p>
              Every programme starts with a written protocol and a data audit before any modelling.
              Code is version-controlled, every result can be rebuilt from the original data, and we
              report uncertainty and limitations alongside findings.
            </p>
            <p>
              We stay independent while building academic and practical partnerships where they
              strengthen the work.
            </p>
          </div>
        </div>
        <dl className="border-line bg-sand/40 h-fit border p-5 sm:p-6 lg:col-span-5">
          {facts.map((f) => (
            <div
              key={f.term}
              className="border-line grid grid-cols-[6rem_1fr] gap-3 border-b py-3 first:pt-0 last:border-0 last:pb-0"
            >
              <dt className="text-muted tracking-caps text-xs uppercase">{f.term}</dt>
              <dd>{f.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="principles" className="border-line border-t py-10 sm:py-14">
        <SectionHeading number="03" id="principles">
          Principles
        </SectionHeading>
        <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {principles.map((p) => (
            <li key={p.title}>
              <p className="text-accent font-serif text-3xl leading-none">{p.numeral}</p>
              <h3 className="mt-3 text-xl">{p.title}</h3>
              <p className="text-muted mt-1 leading-relaxed">{p.detail}</p>
            </li>
          ))}
        </ul>
      </section>

      <nav
        aria-label="Next steps"
        className="border-line flex flex-col gap-3 border-t pt-8 sm:flex-row sm:gap-8"
      >
        <Link
          href="/research"
          className="text-primary hover:text-accent tracking-caps text-xs uppercase transition-colors"
        >
          See our research →
        </Link>
        <Link
          href="/team"
          className="text-primary hover:text-accent tracking-caps text-xs uppercase transition-colors"
        >
          Meet the team →
        </Link>
      </nav>
    </div>
  );
}
