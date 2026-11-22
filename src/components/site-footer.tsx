import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-line shrink-0 border-t">
      <div className="text-muted mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-1 px-6 py-4 text-xs">
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
