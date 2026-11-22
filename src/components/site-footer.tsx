import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-line shrink-0 border-t pb-[env(safe-area-inset-bottom)]">
      <div className="text-muted mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-4 text-xs sm:px-6 lg:py-3">
        <p>
          {site.name} · {site.location}
        </p>
        {site.email ? (
          <a href={`mailto:${site.email}`} className="hover:text-accent transition-colors">
            {site.email}
          </a>
        ) : null}
      </div>
    </footer>
  );
}
