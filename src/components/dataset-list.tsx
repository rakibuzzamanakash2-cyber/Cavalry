import Link from "next/link";
import { ui } from "@/components/ui";
import type { DatasetRow } from "@/data/datasets";
import { formatDate } from "@/lib/format";

/** A list of datasets with their links; used on the datasets page and project pages. */
export function DatasetList({
  datasets,
  showProject = false,
}: {
  datasets: DatasetRow[];
  showProject?: boolean;
}) {
  return (
    <ul className="border-line divide-line divide-y border-y">
      {datasets.map((d) => (
        <li key={d.id} id={`dataset-${d.id}`} className="scroll-mt-24 py-5">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            <h3 className="text-xl leading-snug">{d.name}</h3>
            <p className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <a
                href={d.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-accent tracking-caps text-xs uppercase transition-colors"
              >
                Open on {d.kind === "Link" ? "the web" : d.kind}
                <span className="sr-only">: {d.name} (opens in a new tab)</span>{" "}
                <span aria-hidden>↗</span>
              </a>
              {d.canEdit ? (
                <Link href={`/workspace/datasets/${d.id}/edit`} className={ui.link}>
                  Edit<span className="sr-only"> {d.name}</span>
                </Link>
              ) : null}
            </p>
          </div>
          <dl className="mt-3 grid gap-x-8 gap-y-3 text-sm leading-relaxed md:grid-cols-2">
            <div>
              <dt className={ui.label}>What it is</dt>
              <dd className="mt-1">{d.description}</dd>
            </div>
            <div>
              <dt className={ui.label}>What we use it for</dt>
              <dd className="mt-1">{d.usedFor}</dd>
            </div>
          </dl>
          <p className="text-muted mt-3 text-xs">
            {showProject ? (
              d.project ? (
                <>
                  <Link
                    href={`/workspace/projects/${d.project.slug}`}
                    className="hover:text-accent underline"
                  >
                    Programme {d.project.number}: {d.project.title}
                  </Link>{" "}
                  team only ·{" "}
                </>
              ) : (
                "Shared with every member · "
              )
            ) : null}
            {d.addedBy ? `Added by ${d.addedBy} · ` : null}updated{" "}
            <time dateTime={d.updatedAt}>{formatDate(d.updatedAt)}</time>
          </p>
        </li>
      ))}
    </ul>
  );
}
