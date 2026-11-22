import Link from "next/link";
import { site } from "@/lib/site";
import { Wordmark } from "./wordmark";

export function SiteHeader() {
  return (
    <header className="border-line bg-surface/90 border-b backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <Link href="/" aria-label={`${site.name} home`}>
          <Wordmark />
        </Link>
        <nav aria-label="Main">
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            {site.nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-ink hover:text-accent-strong transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
