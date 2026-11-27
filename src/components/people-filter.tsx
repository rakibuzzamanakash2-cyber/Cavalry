import Form from "next/form";
import Link from "next/link";
import { ui } from "@/components/ui";
import { tierPlural, type Tier } from "@/lib/people";

type PeopleFilterProps = {
  /** Page the filter lives on, e.g. /admin/users. */
  action: string;
  query: string;
  show: Tier | "all";
  tiers: readonly Tier[];
  counts: Record<Tier, number>;
  total: number;
  placeholder: string;
};

/** Search box plus role tabs. Plain GET links and a GET form, so it works without JavaScript. */
export function PeopleFilter({
  action,
  query,
  show,
  tiers,
  counts,
  total,
  placeholder,
}: PeopleFilterProps) {
  const href = (tier: Tier | "all") => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (tier !== "all") params.set("show", tier);
    const s = params.toString();
    return s ? `${action}?${s}` : action;
  };
  const tab = (active: boolean) =>
    `border-b-2 px-1 pb-2 text-sm transition-colors ${
      active
        ? "border-accent text-primary font-medium"
        : "text-muted hover:text-primary border-transparent"
    }`;

  return (
    <div className="space-y-5">
      <Form action={action} role="search" className="flex flex-col gap-2 sm:flex-row">
        {show !== "all" ? <input type="hidden" name="show" value={show} /> : null}
        <label className="block sm:max-w-md sm:flex-1">
          <span className="sr-only">Search people</span>
          <input
            name="q"
            type="search"
            defaultValue={query}
            placeholder={placeholder}
            autoComplete="off"
            className={`${ui.input} mt-0`}
          />
        </label>
        <button type="submit" className={ui.button}>
          Search
        </button>
        {query ? (
          <Link href={href(show)} className={`${ui.link} self-center px-2`}>
            Clear
          </Link>
        ) : null}
      </Form>
      <nav aria-label="Filter by role" className="border-line flex flex-wrap gap-x-6 border-b">
        <Link
          href={href("all")}
          aria-current={show === "all" ? "page" : undefined}
          className={tab(show === "all")}
        >
          All <span className="text-muted">{total}</span>
        </Link>
        {tiers.map((t) => (
          <Link
            key={t}
            href={href(t)}
            aria-current={show === t ? "page" : undefined}
            className={tab(show === t)}
          >
            {tierPlural[t]} <span className="text-muted">{counts[t]}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
