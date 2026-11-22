import { Suspense } from "react";
import { AccountArea, SignInLink } from "./auth/account-area";
import { HeaderBrand, HeaderBrandLink } from "./header-brand";
import { MainNav, MainNavFallback } from "./main-nav";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  return (
    <header className="bg-surface/90 supports-[backdrop-filter]:bg-surface/75 sticky top-0 z-50 shrink-0 backdrop-blur">
      <div className="mx-auto flex h-[var(--header-h)] max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Suspense fallback={<HeaderBrandLink />}>
          <HeaderBrand />
        </Suspense>
        <div className="flex items-center gap-1 md:gap-3">
          <Suspense fallback={<MainNavFallback />}>
            <MainNav />
          </Suspense>
          <ThemeToggle />
          <div className="hidden lg:block">
            <Suspense fallback={<SignInLink />}>
              <AccountArea />
            </Suspense>
          </div>
        </div>
      </div>
    </header>
  );
}
