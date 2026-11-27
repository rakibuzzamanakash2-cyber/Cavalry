import Link from "next/link";
import { JoinLink } from "./join-link";
import { researchAreas } from "@/content/research";
import { site } from "@/lib/site";

const heading = "text-ink text-sm font-semibold";
const link = "text-muted hover:text-primary transition-colors";

export function SiteFooter() {
  return (
    <footer className="border-line bg-surface shrink-0 border-t pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 text-sm sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div>
          <p className="text-primary font-serif text-xl font-semibold">{site.name}</p>
          <p className="text-muted mt-2 leading-relaxed">
            Independent research, {site.location}. We publish when work is finished and checked.
          </p>
        </div>
        <nav aria-label="Research areas">
          <p className={heading}>Research areas</p>
          <ul className="mt-3 space-y-2">
            {researchAreas.map((a) => (
              <li key={a.title}>
                <Link href="/research#areas" className={link}>
                  {a.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Organisation">
          <p className={heading}>Organisation</p>
          <ul className="mt-3 space-y-2">
            {[
              { href: "/about", label: "About" },
              { href: "/team", label: "Team" },
              { href: "/publications", label: "Publications" },
              { href: "/news", label: "News" },
            ].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={link}>
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <JoinLink className={link} memberLabel="Workspace">
                Work with us
              </JoinLink>
            </li>
          </ul>
        </nav>
        <div>
          <p className={heading}>Contact</p>
          <ul className="mt-3 space-y-2">
            <li>
              <Link href="/contact" className={link}>
                Contact us
              </Link>
            </li>
            {site.email ? (
              <li>
                <a href={`mailto:${site.email}`} className={`${link} break-all`}>
                  {site.email}
                </a>
              </li>
            ) : null}
            <li className="text-muted">{site.location}</li>
          </ul>
        </div>
      </div>
      <div className="border-line border-t">
        <p className="text-muted mx-auto max-w-6xl px-4 py-4 text-xs sm:px-6">
          © {site.name}. Published work is shared with its data and code.
        </p>
      </div>
    </footer>
  );
}
