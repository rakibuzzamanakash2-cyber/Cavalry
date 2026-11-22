import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, SectionHeading } from "@/components/page-header";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact CAVALRY research about research collaboration, data, joining the team or media enquiries.",
};

const reasons = [
  {
    title: "Research collaboration",
    detail:
      "You work on public finance, disaster risk or causal methods and see overlap with our programmes.",
    subject: "Collaboration",
  },
  {
    title: "Data and methods",
    detail: "You have a question about our data sources, design or code, or spotted a problem.",
    subject: "Data and methods",
  },
  {
    title: "Joining the team",
    detail:
      "You want to work on the first programme. Tell us your background and share a sample of past work.",
    subject: "Joining the team",
  },
  {
    title: "Media and speaking",
    detail: "You would like comment on our work or an introduction to what we do.",
    subject: "Media",
  },
];

function mailto(subject: string) {
  return `mailto:${site.email}?subject=${encodeURIComponent(`${subject} — ${site.name}`)}`;
}

export default function ContactPage() {
  const hasEmail = Boolean(site.email);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
      <PageHeader eyebrow="Contact" title="Get in touch">
        We read every message. A clear subject and a few lines of context help us reply quickly.
      </PageHeader>

      <div className="grid gap-10 py-10 sm:py-14 lg:grid-cols-12 lg:gap-12">
        <section aria-labelledby="reasons" className="lg:col-span-8">
          <SectionHeading number="01" id="reasons">
            What to write to us about
          </SectionHeading>
          <ul className="border-line mt-6 grid border-t border-l sm:grid-cols-2">
            {reasons.map((r) => (
              <li key={r.title} className="border-line flex flex-col border-r border-b p-5 sm:p-6">
                <h3 className="text-xl leading-snug">{r.title}</h3>
                <p className="text-muted mt-2 flex-1 leading-relaxed">{r.detail}</p>
                {hasEmail ? (
                  <a
                    href={mailto(r.subject)}
                    className="text-primary hover:text-accent tracking-caps mt-4 text-xs uppercase transition-colors"
                  >
                    Email us about this →
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        </section>

        <aside aria-labelledby="details" className="lg:col-span-4">
          <div className="border-line bg-sand/40 space-y-5 border p-5 sm:p-6 lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
            <h2 id="details" className="text-2xl">
              Details
            </h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-muted tracking-caps text-xs uppercase">Email</dt>
                <dd className="mt-1">
                  {hasEmail ? (
                    <a
                      href={`mailto:${site.email}`}
                      className="hover:text-accent break-all underline transition-colors"
                    >
                      {site.email}
                    </a>
                  ) : (
                    <span className="text-muted">Our address will appear here soon.</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-muted tracking-caps text-xs uppercase">Based in</dt>
                <dd className="mt-1">{site.location}</dd>
              </div>
              {site.links.length ? (
                <div>
                  <dt className="text-muted tracking-caps text-xs uppercase">Elsewhere</dt>
                  <dd className="mt-1 flex flex-wrap gap-4">
                    {site.links.map((l) => (
                      <a
                        key={l.href}
                        href={l.href}
                        className="hover:text-accent underline transition-colors"
                        rel="noopener"
                      >
                        {l.label}
                      </a>
                    ))}
                  </dd>
                </div>
              ) : null}
            </dl>
            <p className="text-muted border-line border-t pt-4 text-sm leading-relaxed">
              Interested in joining? See the{" "}
              <Link href="/team#join" className="hover:text-accent underline transition-colors">
                open roles
              </Link>{" "}
              first.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
