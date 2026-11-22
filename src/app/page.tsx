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
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 sm:px-6">
      <script
        type="application/ld+json"
        // Static, trusted content: tells search engines this is a research organisation.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <section className="grid flex-1 grid-cols-[minmax(0,1fr)] items-center gap-10 py-8 sm:py-12 lg:grid-cols-12 lg:gap-12 lg:py-[clamp(0.5rem,2dvh,1.5rem)]">
        <div className="flex flex-col items-center gap-5 text-center sm:gap-6 lg:col-span-7 lg:items-start lg:gap-[clamp(0.75rem,2.2dvh,1.5rem)] lg:text-left">
          <p className="tracking-caps text-accent-strong text-[0.65rem] uppercase">
            Independent research group · {site.location}
          </p>
          <h1 className="sr-only">{site.name}</h1>
          <Logo className="text-primary h-auto w-full max-w-[34rem] lg:-ml-[3%] lg:w-[clamp(320px,calc((100dvh-24rem)*4.22),620px)] lg:max-w-none" />
          <p className="text-muted max-w-xl font-serif text-lg leading-snug italic sm:text-xl lg:text-[clamp(1.05rem,2.3dvh,1.3rem)]">
            We study hard questions with rigorous, reproducible methods — and turn validated
            findings into tools people can use.
          </p>

          <div className="w-full max-w-xl">
            <p className="tracking-caps text-muted text-[0.65rem] uppercase">Research areas</p>
            <ul className="border-line mt-2 grid grid-cols-1 border-t border-l text-left min-[420px]:grid-cols-2">
              {researchAreas.map((area) => (
                <li key={area.title} className="border-line border-r border-b px-3 py-2.5">
                  <p className="text-primary font-serif text-base font-semibold sm:text-[1.05rem] lg:text-[clamp(0.95rem,1.9dvh,1.05rem)]">
                    {area.title}
                  </p>
                  <p className="text-muted text-xs leading-snug lg:text-[0.72rem]">{area.detail}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="tracking-caps flex w-full flex-col items-stretch gap-3 text-xs uppercase sm:w-auto sm:flex-row sm:items-center">
            <Link
              href="/research"
              className="bg-primary text-primary-foreground hover:bg-accent px-5 py-3.5 text-center transition-colors lg:py-2.5"
            >
              Explore the research
            </Link>
            <Link
              href="/publications"
              className="border-primary text-primary hover:border-accent hover:text-accent border px-5 py-3.5 text-center transition-colors lg:py-2.5"
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
        <ul className="grid grid-cols-1 gap-x-6 gap-y-4 py-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-y-3 lg:py-[clamp(0.6rem,1.8dvh,1.1rem)]">
          {principles.map((p) => (
            <li key={p.title} className="flex gap-3">
              <span className="text-accent font-serif text-lg leading-none">{p.numeral}</span>
              <span>
                <span className="tracking-caps text-primary block text-[0.65rem] uppercase">
                  {p.title}
                </span>
                <span className="text-muted block text-xs leading-snug lg:text-[0.72rem]">
                  {p.detail}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
