type WordmarkProps = {
  size?: "sm" | "lg";
  inverted?: boolean;
};

/** CAVALRY (dominant, uppercase) + research (small, lowercase, accent). */
export function Wordmark({ size = "sm", inverted = false }: WordmarkProps) {
  const big = size === "lg";
  return (
    <span className="inline-flex flex-col leading-none">
      <span
        className={`tracking-wordmark font-serif font-bold ${big ? "text-6xl sm:text-8xl" : "text-xl"} ${
          inverted ? "text-primary-foreground" : "text-primary"
        }`}
      >
        CAVALRY
      </span>
      <span
        className={`tracking-descriptor text-accent lowercase ${big ? "mt-3 text-base sm:text-lg" : "mt-1 text-[0.6rem]"}`}
      >
        research
      </span>
    </span>
  );
}
