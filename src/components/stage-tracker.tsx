import { stageStatus } from "@/content/research";

type StageTrackerProps = {
  stages: readonly string[];
  current: number;
  className?: string;
};

/**
 * Horizontal progress bar of research stages, with the current one highlighted.
 * Per-stage labels appear only when the tracker is at least 26rem wide; in
 * narrow spaces the heading line names the current stage (labels stay
 * available to screen readers).
 */
export function StageTracker({ stages, current, className = "" }: StageTrackerProps) {
  return (
    <div className={`@container ${className}`}>
      <p className="text-muted tracking-caps text-xs uppercase">
        Stage {current + 1} of {stages.length} · {stages[current]}
      </p>
      <ol
        className="mt-2 grid gap-1"
        style={{ gridTemplateColumns: `repeat(${stages.length}, minmax(0, 1fr))` }}
        aria-label="Research stages"
      >
        {stages.map((stage, i) => {
          const state = stageStatus(i, current);
          return (
            <li key={stage} aria-current={state === "current" ? "step" : undefined}>
              <span
                className={`block h-1 ${state === "next" ? "bg-line" : state === "current" ? "bg-accent" : "bg-primary"}`}
              />
              <span
                className={`sr-only mt-1 text-xs leading-tight uppercase @min-[26rem]:not-sr-only @min-[26rem]:block ${state === "current" ? "text-accent-strong" : "text-muted"}`}
              >
                {stage}
                <span className="sr-only">
                  {state === "done" ? " (done)" : state === "current" ? " (current)" : ""}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
