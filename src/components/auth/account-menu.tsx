"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { authClient } from "@/lib/auth-client";
import type { Role } from "@/lib/roles";

type AccountMenuProps = {
  name: string;
  email: string;
  role: Role;
  variant: "desktop" | "mobile";
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function AccountMenu({ name, email, role, variant }: AccountMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);
  const isMember = role === "member" || role === "admin";

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const signOut = () =>
    startTransition(async () => {
      await authClient.signOut();
      setOpen(false);
      router.push("/");
      router.refresh();
    });

  const links = [
    isMember ? { href: "/workspace", label: "Workspace" } : null,
    role === "admin" ? { href: "/admin/users", label: "Users & roles" } : null,
  ].filter((l): l is { href: string; label: string } => l !== null);

  if (variant === "mobile") {
    return (
      <div className="border-line mt-6 border-t pt-6">
        <p className="font-medium">{name}</p>
        <p className="text-muted text-sm">{email}</p>
        <ul className="mt-4 space-y-3">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="text-primary hover:text-accent font-serif text-xl">
                {l.label}
              </Link>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={signOut}
              disabled={pending}
              className="text-muted hover:text-accent tracking-caps text-xs uppercase"
            >
              Sign out
            </button>
          </li>
        </ul>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="bg-primary text-primary-foreground hover:bg-accent inline-flex size-9 items-center justify-center rounded-full font-serif text-sm italic transition-colors"
      >
        {/* Visible initials are decorative; the spoken name says whose menu it is. */}
        <span aria-hidden>{initials(name)}</span>
        <span className="sr-only">Account menu for {name}</span>
      </button>
      {open ? (
        <div
          role="menu"
          className="border-line bg-surface absolute right-0 z-50 mt-2 w-60 border p-2 shadow-[6px_6px_0_0_var(--color-sand)]"
        >
          <div className="border-line border-b px-2 pt-1 pb-2">
            <p className="truncate font-medium">{name}</p>
            <p className="text-muted truncate text-xs">{email}</p>
          </div>
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="hover:bg-sand block px-2 py-2 text-sm"
            >
              {l.label}
            </Link>
          ))}
          <button
            type="button"
            role="menuitem"
            onClick={signOut}
            disabled={pending}
            className="hover:bg-sand text-muted block w-full px-2 py-2 text-left text-sm"
          >
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}
