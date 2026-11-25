import Link from "next/link";

const ITEMS = [
  { href: "/admin/applications", label: "Applications" },
  { href: "/admin/users", label: "Users & roles" },
  { href: "/admin/news", label: "News" },
  { href: "/admin/publications", label: "Publications" },
] as const;

/** Tabs across the admin pages. `current` is the section's base path. */
export function AdminNav({ current }: { current: (typeof ITEMS)[number]["href"] }) {
  return (
    <nav aria-label="Admin" className="border-line border-b">
      <ul className="-mb-px flex flex-wrap gap-x-6">
        {ITEMS.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={item.href === current ? "page" : undefined}
              className={`tracking-caps inline-block border-b-2 py-3 text-xs uppercase transition-colors ${
                item.href === current
                  ? "border-accent text-ink"
                  : "text-muted hover:text-ink border-transparent"
              }`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
