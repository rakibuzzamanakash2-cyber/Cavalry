import Link from "next/link";
import { site } from "@/lib/site";
import { HeaderBrand } from "./header-brand";

export function SiteHeader() {
  return (
    <header className="shrink-0">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-x-6 gap-y-2 px-6 py-4 sm:flex-row">
        <HeaderBrand />
        <nav aria-label="Main">
          <ul className="tracking-caps flex flex-wrap items-center justify-center gap-x-1 text-[0.7rem] uppercase sm:text-xs">
            {site.nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-ink hover:text-accent block px-2 py-2 transition-colors"
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
