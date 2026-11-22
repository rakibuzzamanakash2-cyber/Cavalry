import { site } from "@/lib/site";
import { Wordmark } from "./wordmark";

export function SiteFooter() {
  return (
    <footer className="bg-primary text-primary-foreground mt-auto">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <Wordmark inverted />
          <p className="text-primary-foreground/75 max-w-sm text-sm">{site.tagline}</p>
        </div>
        <div className="text-primary-foreground/75 space-y-1 text-sm">
          <p>{site.location}</p>
          {site.email ? (
            <p>
              <a href={`mailto:${site.email}`} className="hover:text-primary-foreground">
                {site.email}
              </a>
            </p>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
