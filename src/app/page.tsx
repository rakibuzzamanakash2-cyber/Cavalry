import Link from "next/link";
import { FinishedWorkCard } from "@/components/finished-work-card";
import { JoinBand } from "@/components/join-band";
import { JoinLink } from "@/components/join-link";
import { Logo } from "@/components/logo";
import { principles, programmeProcess, researchAreas } from "@/content/research";
import { getPublicPosts } from "@/data/news";
import { getPublicProgrammes } from "@/data/programmes";
import { getPublicOutputs } from "@/data/publications";
import { formatDate } from "@/lib/format";
import { site } from "@/lib/site";
import { toneBg } from "@/lib/tones";

// Home page, structured like leading research organisations' sites (ADR 0014):
// a plain mission above the fold, research areas as topics, how we work, the
// latest public updates, and a way to get involved. Research in progress is
// confidential, so finished work appears only once there is some.
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "ResearchOrganization",
  name: site.name,
  description: site.description,
  url: site.url,
  slogan: site.tagline,
  logo: `${site.url}/brand/cavalry-logo.svg`,
  location: { "@type": "Place", name: site.location },
  knowsAbout: researchAreas.map((a) => a.title),
};

const eyebrow = "text-accent-strong tracking-caps text-xs font-medium uppercase";
const button =
  "bg-primary text-primary-foreground hover:bg-primary-hover inline-flex items-center justify-center px-5 py-3 text-sm font-medium transition-colors";
const ghostButton =
  "border-primary text-primary hover:bg-sand inline-flex items-center justify-center border px-5 py-3 text-sm font-medium transition-colors";
const textLink = "text-primary hover:text-accent-strong text-sm font-medium transition-colors";

function SectionTitle({ id, kicker, title }: { id: string; kicker: string; title: string }) {
  return (
    <div>
      <p className={eyebrow}>{kicker}</p>
      <h2 id={id} className="mt-2 text-3xl leading-tight sm:text-4xl">
        {title}
      </h2>
    </div>
  );
}

export default async function HomePage() {
  const [programmes, outputs, posts] = await Promise.all([
    getPublicProgrammes(),
    getPublicOutputs(),
    getPublicPosts(),
  ]);
  const hasFinishedWork = programmes.length + outputs.length > 0;
  const latest = posts.slice(0, 3);

  return (
    <div className="flex w-full flex-1 flex-col">
      <script
        type="application/ld+json"
        // Static, trusted content: tells search engines this is a research organisation.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />

      {/* Above the fold: who we are, in one sentence. */}
      <section
        aria-labelledby="hero-title"
        className="mx-auto grid w-full max-w-6xl grid-cols-[minmax(0,1fr)] items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:min-h-[calc(100dvh-var(--header-h)-4rem)] lg:grid-cols-12 lg:py-10"
      >
        <div className="flex flex-col items-start gap-6 lg:col-span-7">
          <p className={eyebrow}>Independent research group · {site.location}</p>
          <h1 id="hero-title" className="sr-only">
            {site.name}
          </h1>
          <Logo className="text-primary h-auto w-full max-w-[34rem] lg:-ml-[3%]" />
          <p className="text-ink max-w-xl font-serif text-xl leading-snug sm:text-2xl">
            We study hard questions with rigorous, reproducible methods, and turn validated findings
            into tools people can use.
          </p>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link href="/research" className={button}>
              Explore our research
            </Link>
            <JoinLink className={ghostButton}>Work with us</JoinLink>
          </div>
        </div>

        <div className="lg:col-span-5">
          {hasFinishedWork ? (
            <FinishedWorkCard programmes={programmes} outputs={outputs} />
          ) : (
            <aside
              aria-labelledby="status-title"
              className="border-line bg-paper border p-6 sm:p-8"
            >
              <p className={eyebrow}>Where we are</p>
              <h2 id="status-title" className="mt-2 text-2xl leading-snug">
                Our first programme is under way
              </h2>
              <p className="text-muted mt-3 leading-relaxed">
                We publish when work is finished and checked. Until then our research stays
                confidential; the plan, data and code are released with the results.
              </p>
              <p className="text-ink mt-6 text-sm font-medium">How every programme runs</p>
              <ol className="mt-3 space-y-2">
                {programmeProcess.map((stage, i) => (
                  <li key={stage.name} className="flex items-baseline gap-3 text-sm">
                    <span className="text-accent-strong w-5 shrink-0 tabular-nums">{i + 1}</span>
                    <span>
                      <span className="text-ink font-medium">{stage.name}</span>
                      <span className="text-muted"> · {stage.detail}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </aside>
          )}
        </div>
      </section>

      {/* Research areas: the topics we work on. */}
      <section aria-labelledby="areas-title" className="border-line bg-paper border-t">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <SectionTitle id="areas-title" kicker="Research areas" title="What we work on" />
          <ul className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {researchAreas.map((area) => (
              <li key={area.title} className="flex flex-col">
                <span aria-hidden className={`block h-1 w-12 ${toneBg[area.tone]}`} />
                <h3 className="mt-4 text-xl leading-snug">{area.title}</h3>
                <p className="text-muted mt-2 leading-relaxed">{area.long}</p>
              </li>
            ))}
          </ul>
          <p className="mt-10">
            <Link href="/research" className={textLink}>
              See our research →
            </Link>
          </p>
        </div>
      </section>

      {/* How we work: the standards behind every result. */}
      <section aria-labelledby="how-title" className="border-line border-t">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionTitle id="how-title" kicker="How we work" title="Evidence you can check" />
            <p className="text-muted mt-4 leading-relaxed">
              Every programme moves through the same evidence-gated stages, from a written protocol
              to a reviewed paper. A stage is finished when its output exists and has been checked,
              not when a date arrives.
            </p>
            <p className="mt-6">
              <Link href="/research#process" className={textLink}>
                How a programme runs →
              </Link>
            </p>
          </div>
          <ol className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:col-span-8">
            {principles.map((p) => (
              <li key={p.title} className="border-line border-t pt-5">
                <span className="text-accent font-serif text-lg">{p.numeral}</span>
                <h3 className="mt-1 text-xl">{p.title}</h3>
                <p className="text-muted mt-2 leading-relaxed">{p.detail}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Latest public news (hidden until there is some). */}
      {latest.length > 0 ? (
        <section aria-labelledby="latest-title" className="border-line bg-paper border-t">
          <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionTitle id="latest-title" kicker="Latest" title="News and updates" />
              <Link href="/news" className={textLink}>
                All news →
              </Link>
            </div>
            <ul className="mt-10 grid gap-8 md:grid-cols-3">
              {latest.map((post) => (
                <li key={post.slug} className="border-line border-t pt-5">
                  <p className="text-muted text-sm">
                    <time dateTime={post.date}>{formatDate(post.date)}</time>
                  </p>
                  <h3 className="mt-2 text-xl leading-snug">
                    <Link href={`/news/${post.slug}`} className="hover:text-accent-strong">
                      {post.title}
                    </Link>
                  </h3>
                  <p className="text-muted mt-2 leading-relaxed">{post.excerpt}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* Get involved (members see their projects instead). */}
      <JoinBand />
    </div>
  );
}
