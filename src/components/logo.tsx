import { preload } from "react-dom";

type LogoProps = {
  /** Show the "RESEARCH · DEVELOP · BUILD" line under the wordmark. */
  withTagline?: boolean;
  /** Size with width classes (e.g. "w-64"); height follows the logo's aspect ratio. */
  className?: string;
  title?: string;
};

const FILES = {
  full: { src: "/brand/cavalry-logo.svg", ratio: "4434 / 1050" },
  wordmark: { src: "/brand/cavalry-wordmark.svg", ratio: "4434 / 900" },
} as const;

/**
 * CAVALRY research calligraphic logo.
 *
 * Drawn as a CSS mask over the current text colour, so it recolours with
 * text-* classes and both themes, while the SVG itself is a small cached file
 * instead of ~44 KB of path data repeated in every page's HTML.
 */
export function Logo({
  withTagline = true,
  className = "",
  title = "CAVALRY research",
}: LogoProps) {
  const file = withTagline ? FILES.full : FILES.wordmark;
  // CSS masks fetch in CORS mode, so the preload must match or the browser ignores it.
  preload(file.src, { as: "image", fetchPriority: "high", crossOrigin: "anonymous" });

  return (
    <span
      role="img"
      aria-label={withTagline ? `${title}: Research, Develop, Build` : title}
      className={`block bg-current ${className}`}
      style={{
        aspectRatio: file.ratio,
        WebkitMask: `url(${file.src}) center / contain no-repeat`,
        mask: `url(${file.src}) center / contain no-repeat`,
      }}
    />
  );
}
