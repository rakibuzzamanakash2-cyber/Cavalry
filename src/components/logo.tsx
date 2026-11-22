import { LOGO_PATH } from "./logo-path";

type LogoProps = {
  /** Show the "RESEARCH · DEVELOP · BUILD" line under the wordmark. */
  withTagline?: boolean;
  className?: string;
  /** Set when the logo is the page's main heading, so screen readers announce it once. */
  title?: string;
};

/**
 * CAVALRY research calligraphic logo as an inline SVG.
 * It uses currentColor, so set the colour with a text-* class.
 */
export function Logo({ withTagline = true, className, title = "CAVALRY research" }: LogoProps) {
  const height = withTagline ? 1050 : 900;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 4434 ${height}`}
      fill="currentColor"
      role="img"
      aria-label={withTagline ? `${title}: Research, Develop, Build` : title}
      className={className}
    >
      <path d={LOGO_PATH} fillRule="evenodd" />
    </svg>
  );
}
