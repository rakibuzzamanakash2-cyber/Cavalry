import Link from "next/link";
import { FlagshipCard } from "@/components/flagship-card";
import { Logo } from "@/components/logo";
import { principles, researchAreas } from "@/content/research";
import { site } from "@/lib/site";

// One-screen home page that reads as a research group at first glance:
// identity and research areas on the left, the live research programme on the
// right, and the research principles along the bottom.
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

export default function HomePage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6">
      <script
        type="application/ld+json"
        // Static, trusted content: tells search engines this is a research organisation.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <section className="grid flex-1 items-center gap-[clamp(1.5rem,4dvh,3rem)] py-[clamp(0.5rem,2dvh,1.5rem)] lg:grid-cols-12 lg:gap-12">
        <div className="flex flex-col items-center gap-[clamp(0.75rem,2.2dvh,1.5rem)] text-center lg:col-span-7 lg:items-start lg:text-left">
          <p className="tracking-caps text-accent-strong text-[0.65rem] uppercase">
            Independent research group · {site.location}
          </p>
          <h1 className="sr-only">{site.name}</h1>
          <Logo className="text-primary h-auto w-[min(100%,620px,calc((100dvh-24rem)*4.22))] lg:-ml-[3%]" />
          <p className="text-muted max-w-xl font-serif text-[clamp(1.05rem,2.3dvh,1.3rem)] leading-snug italic">
            We study hard questions with rigorous, reproducible methods — and turn validated
            findings into tools people can use.
          </p>

          <div className="w-full max-w-xl">
            <p className="tracking-caps text-muted text-[0.65rem] uppercase">Research areas</p>
            <ul className="border-line mt-2 grid grid-cols-2 border-t border-l text-left">
              {researchAreas.map((area) => (
                <li key={area.title} className="border-line border-r border-b px-3 py-2">
                  <p className="text-primary font-serif text-[clamp(0.95rem,1.9dvh,1.05rem)] font-semibold">
                    {area.title}
                  </p>
                  <p className="text-muted text-[0.72rem] leading-snug">{area.detail}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="tracking-caps flex flex-wrap items-center justify-center gap-3 text-xs uppercase">
            <Link
              href="/research"
              className="bg-primary text-primary-foreground hover:bg-accent px-5 py-2.5 transition-colors"
            >
              Explore the research
            </Link>
            <Link
              href="/publications"
              className="border-primary text-primary hover:border-accent hover:text-accent border px-5 py-2.5 transition-colors"
            >
              Publications
            </Link>
          </div>
        </div>

        <div className="lg:col-span-5">
          <FlagshipCard />
        </div>
      </section>

      <section aria-label="Research principles" className="border-line border-t">
        <ul className="grid grid-cols-2 gap-x-6 gap-y-3 py-[clamp(0.6rem,1.8dvh,1.1rem)] md:grid-cols-4">
          {principles.map((p) => (
            <li key={p.title} className="flex gap-3">
              <span className="text-accent font-serif text-lg leading-none">{p.numeral}</span>
              <span>
                <span className="tracking-caps text-primary block text-[0.65rem] uppercase">
                  {p.title}
                </span>
                <span className="text-muted block text-[0.72rem] leading-snug">{p.detail}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
