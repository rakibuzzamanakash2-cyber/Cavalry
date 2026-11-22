import { Wordmark } from "@/components/wordmark";
import { site } from "@/lib/site";

// Temporary landing page. Replaced by the full home page in the next PR.
export default function HomePage() {
  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-24 sm:py-32">
      <Wordmark size="lg" />
      <div className="bg-accent h-1 w-24" aria-hidden />
      <h1 className="max-w-3xl text-4xl leading-tight sm:text-5xl">{site.tagline}</h1>
      <p className="text-muted max-w-2xl text-lg">{site.description}</p>
      <p className="bg-sand text-primary inline-flex w-fit rounded-full px-4 py-1.5 text-sm">
        Website under construction
      </p>
    </section>
  );
}
