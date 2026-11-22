import { HeaderBrand } from "./header-brand";
import { MainNav } from "./main-nav";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  return (
    <header className="bg-surface/90 supports-[backdrop-filter]:bg-surface/75 sticky top-0 z-50 shrink-0 backdrop-blur">
      <div className="mx-auto flex h-[var(--header-h)] max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <HeaderBrand />
        <div className="flex items-center gap-1 md:gap-3">
          <MainNav />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
