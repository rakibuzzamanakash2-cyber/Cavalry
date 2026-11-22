"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { site } from "@/lib/site";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Desktop link row (md and up) plus a slide-down menu for phones and small tablets. */
export function MainNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close the menu after navigating (adjusting state during render, per React docs).
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  // Escape closes; lock page scroll while the menu is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    // Close if the window grows to the desktop layout while the menu is open.
    const desktop = window.matchMedia("(min-width: 48rem)");
    const onResize = (e: MediaQueryListEvent) => e.matches && setOpen(false);
    desktop.addEventListener("change", onResize);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Keep keyboard and screen-reader focus inside the header and open menu.
    const background = [document.getElementById("main"), document.querySelector("body > footer")];
    background.forEach((el) => el?.setAttribute("inert", ""));
    return () => {
      document.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onResize);
      document.body.style.overflow = previous;
      background.forEach((el) => el?.removeAttribute("inert"));
    };
  }, [open]);

  return (
    <>
      <nav aria-label="Main" className="hidden md:block">
        <ul className="tracking-caps flex items-center gap-x-1 text-xs uppercase">
          {site.nav.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`hover:text-accent block px-2 py-2 transition-colors ${
                    active ? "text-accent-strong" : "text-ink"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        className="text-ink hover:bg-sand inline-flex size-10 items-center justify-center rounded-full transition-colors md:hidden"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          className="size-6"
          aria-hidden
        >
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h10" />}
        </svg>
      </button>

      {open
        ? createPortal(
            <div
              id="mobile-menu"
              className="bg-surface fixed inset-x-0 top-[var(--header-h)] bottom-0 z-40 overflow-y-auto md:hidden"
            >
              <nav aria-label="Mobile" className="mx-auto max-w-6xl px-6 pt-4 pb-10">
                <ul className="divide-line border-line divide-y border-y">
                  {site.nav.map((item, i) => {
                    const active = isActive(pathname, item.href);
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          aria-current={active ? "page" : undefined}
                          className={`hover:text-accent flex items-baseline gap-4 py-4 font-serif text-2xl transition-colors ${
                            active ? "text-accent-strong" : "text-primary"
                          }`}
                        >
                          <span className="text-muted w-6 font-sans text-xs tabular-nums">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
                <p className="tracking-caps text-muted mt-8 text-xs uppercase">{site.tagline}</p>
              </nav>
            </div>,
            // Rendered at <body> level: the header's backdrop blur would otherwise
            // trap a fixed-position menu inside the header box.
            document.body,
          )
        : null}
    </>
  );
}
