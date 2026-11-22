"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/lib/site";
import { Logo } from "./logo";

/** Small logo in the header. Hidden on the home page, where the full logo is the hero. */
export function HeaderBrand() {
  const pathname = usePathname();
  if (pathname === "/") return <span aria-hidden className="hidden w-px sm:block" />;
  return (
    <Link href="/" aria-label={`${site.name} home`} className="text-primary">
      <Logo withTagline={false} className="h-9 w-auto sm:h-10" />
    </Link>
  );
}
