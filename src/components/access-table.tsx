import {
  ACCESS_LEVELS,
  accessLabel,
  accessLevelInfo,
  accessMatrix,
  type Access,
  type AccessLevel,
} from "@/content/access";

const mark: Record<Access, string> = { yes: "●", team: "◐", basic: "◔", no: "–" };

/** The "who can see what" table. `highlight` marks the viewer's own column. */
export function AccessTable({ highlight }: { highlight?: AccessLevel }) {
  return (
    // Scrolls sideways on phones, so it can take keyboard focus.
    <div
      role="region"
      aria-label="Who can see what (scrolls sideways on small screens)"
      tabIndex={0}
      className="border-line focus-visible:outline-primary overflow-x-auto border focus-visible:outline-2"
    >
      <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
        <caption className="sr-only">Who can see what on the CAVALRY site</caption>
        <thead>
          <tr className="bg-sand/60">
            <th scope="col" className="p-3 font-medium">
              Part of the site
            </th>
            {ACCESS_LEVELS.map((level) => (
              <th
                key={level}
                scope="col"
                className={`p-3 text-center font-medium ${level === highlight ? "bg-primary text-primary-foreground" : ""}`}
              >
                {accessLevelInfo[level].name}
                {level === highlight ? (
                  <span className="block text-xs font-normal">You</span>
                ) : null}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {accessMatrix.map((row) => (
            <tr key={row.area} className="border-line border-t">
              <th scope="row" className="p-3 align-top font-normal">
                <span className="text-ink block font-medium">{row.area}</span>
                <span className="text-muted text-xs">{row.detail}</span>
              </th>
              {ACCESS_LEVELS.map((level) => {
                const a = row.access[level];
                return (
                  <td
                    key={level}
                    className={`p-3 text-center align-top ${level === highlight ? "bg-sand/50" : ""} ${a === "no" ? "text-muted" : "text-primary"}`}
                  >
                    <span aria-hidden className="block text-base leading-none">
                      {mark[a]}
                    </span>
                    <span className="mt-1 block text-xs">{accessLabel[a]}</span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
