import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, SectionHeading } from "@/components/page-header";
import { ui } from "@/components/ui";
import {
  principleDetails,
  principles,
  programmeProcess,
  stageGates,
  standards,
} from "@/content/research";

export const metadata: Metadata = {
  title: "How we work",
  description:
    "The principles, stages and standards behind every CAVALRY research programme: written protocols, reproducible code, honest uncertainty and review at every stage.",
};

// Public explanation of our method (ADR 0016). General by design: nothing here
// describes research in progress.
export default function HowWeWorkPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
      <PageHeader eyebrow="How we work" title="Evidence you can check">
        We would rather publish less and be sure of it. These are the rules every programme follows,
        from the first question to the replication package.
      </PageHeader>

      <section aria-labelledby="principles" className="py-10 sm:py-14">
        <SectionHeading number="01" id="principles">
          Principles
        </SectionHeading>
        <ol className="mt-6 grid gap-x-10 gap-y-8 md:grid-cols-2">
          {principles.map((p, i) => (
            <li key={p.title} className="border-line border-t pt-5">
              <span className="text-accent font-serif text-lg">{p.numeral}</span>
              <h3 className="mt-1 text-xl">{p.title}</h3>
              <p className="text-ink mt-2 font-medium">{p.detail}</p>
              <p className="text-muted mt-2 leading-relaxed">{principleDetails[i]}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="stages" className="border-line border-t py-10 sm:py-14">
        <SectionHeading number="02" id="stages">
          Five stages, each with a gate
        </SectionHeading>
        <p className="text-muted mt-3 max-w-3xl leading-relaxed">
          A programme moves to the next stage only when the output of the current one exists and the
          team has reviewed it. Deadlines help us plan; they never decide that a stage is done.
        </p>
        <ol className="border-line divide-line mt-6 divide-y border-y">
          {programmeProcess.map((step, i) => (
            <li key={step.name} className="grid gap-2 py-5 md:grid-cols-12 md:gap-6">
              <div className="flex items-baseline gap-3 md:col-span-3">
                <span className="text-accent font-serif text-2xl leading-none">{i + 1}</span>
                <h3 className="text-xl">{step.name}</h3>
              </div>
              <p className="leading-relaxed md:col-span-4">{step.detail}</p>
              <p className="text-muted text-sm leading-relaxed md:col-span-5">
                <span className="text-ink font-medium">Gate: </span>
                {stageGates[i]}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="standards" className="border-line border-t py-10 sm:py-14">
        <SectionHeading number="03" id="standards">
          Working standards
        </SectionHeading>
        <ul className="border-line mt-6 grid border-t border-l sm:grid-cols-2">
          {standards.map((s) => (
            <li key={s.title} className="border-line border-r border-b p-5 sm:p-6">
              <h3 className="text-xl">{s.title}</h3>
              <p className="text-muted mt-2 leading-relaxed">{s.detail}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="sharing" className="border-line border-t py-10 sm:py-14">
        <SectionHeading number="04" id="sharing">
          What we keep private, and what we share
        </SectionHeading>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="border-line border p-5 sm:p-6">
            <h3 className="text-xl">While work is in progress</h3>
            <p className="text-muted mt-2 leading-relaxed">
              Questions, data and early results stay within the project team. Unchecked findings can
              mislead, and keeping work private until it is reviewed protects both the people
              relying on it and the researchers doing it.
            </p>
          </div>
          <div className="border-line bg-sand/40 border p-5 sm:p-6">
            <h3 className="text-xl">When it is finished</h3>
            <p className="text-muted mt-2 leading-relaxed">
              We publish the paper together with the code, the data we are allowed to share and a
              replication package, so anyone can rebuild the results and check them.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="teams" className="border-line border-t py-10 sm:py-14">
        <SectionHeading number="05" id="teams">
          How teams work
        </SectionHeading>
        <p className="text-muted mt-3 max-w-3xl leading-relaxed">
          Each programme has a small team with a leader, who is responsible for the protocol, the
          stage reviews and the people on the project. Members join through an application or an
          invitation from a project leader, and every member has a clear role on the project they
          work on.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href="/research" className={ui.button}>
            See our research
          </Link>
          <Link
            href="/team"
            className="border-primary text-primary hover:bg-sand border px-5 py-3 text-center text-sm font-medium transition-colors"
          >
            Meet the team
          </Link>
        </div>
      </section>
    </div>
  );
}
