import Link from "next/link";
import { Logo } from "@/components/logo";
import { site } from "@/lib/site";

// One-screen landing page: the logo is the hero and nothing scrolls.
// The logo width is capped by viewport height so everything fits above the fold.
export default function HomePage() {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-[clamp(1rem,3.5dvh,2.5rem)] px-6 py-4 text-center">
      <h1 className="sr-only">{site.name}</h1>
      <Logo className="text-primary h-auto w-[min(92vw,1000px,calc((100dvh-21rem)*4.22))]" />

      <div className="text-accent flex items-center gap-4" aria-hidden>
        <span className="h-px w-12 bg-current" />
        <span className="size-1.5 rotate-45 bg-current" />
        <span className="h-px w-12 bg-current" />
      </div>

      <p className="text-muted max-w-xl font-serif text-[clamp(1.05rem,2.4dvh,1.4rem)] leading-snug italic">
        {site.description}
      </p>

      <div className="tracking-caps flex flex-wrap items-center justify-center gap-3 text-xs uppercase">
        <Link
          href="/research"
          className="bg-primary text-primary-foreground hover:bg-accent px-6 py-3 transition-colors"
        >
          Our research
        </Link>
        <Link
          href="/about"
          className="border-primary text-primary hover:border-accent hover:text-accent border px-6 py-3 transition-colors"
        >
          About us
        </Link>
      </div>
    </section>
  );
}
