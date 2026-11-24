import { RATING_MAX, ratingText } from "@/lib/ratings";

const STAR = "M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z";

/**
 * A 0–5 star display (supports halves, e.g. an average of 4.5). Screen readers
 * hear "4.5 out of 5" instead of the stars.
 */
export function Stars({
  value,
  size = "md",
  showValue = true,
}: {
  value: number | null;
  size?: "sm" | "md";
  showValue?: boolean;
}) {
  const px = size === "sm" ? 14 : 18;
  return (
    <span className="inline-flex items-center gap-2 align-middle">
      <span aria-hidden className="inline-flex">
        {Array.from({ length: RATING_MAX }, (_, i) => {
          const fill = value === null ? 0 : Math.max(0, Math.min(1, value - i));
          return (
            <span key={i} className="relative inline-block" style={{ width: px, height: px }}>
              <svg
                viewBox="0 0 24 24"
                width={px}
                height={px}
                className="text-line absolute inset-0"
              >
                <path d={STAR} fill="currentColor" />
              </svg>
              {fill > 0 ? (
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${fill * 100}%` }}
                >
                  <svg viewBox="0 0 24 24" width={px} height={px} className="text-accent">
                    <path d={STAR} fill="currentColor" />
                  </svg>
                </span>
              ) : null}
            </span>
          );
        })}
      </span>
      {showValue ? (
        <span className="text-muted text-sm">
          {value === null ? "Not rated" : value.toFixed(1)}
        </span>
      ) : null}
      <span className="sr-only">{ratingText(value)}</span>
    </span>
  );
}
