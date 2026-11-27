import Image from "next/image";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

/** A person's photo, or their initials when there is none. Decorative: the name is shown nearby. */
export function PersonAvatar({
  name,
  photo,
  size = "md",
}: {
  name: string;
  photo?: string;
  size?: "md" | "lg";
}) {
  const box = size === "lg" ? "size-32 text-5xl" : "size-24 text-3xl";
  const px = size === "lg" ? 128 : 96;
  return photo ? (
    <Image
      src={photo}
      alt=""
      width={px}
      height={px}
      // Photos linked from other sites are shown as they are.
      unoptimized={photo.startsWith("http")}
      className={`${box} shrink-0 object-cover`}
    />
  ) : (
    <span
      aria-hidden
      className={`bg-primary text-primary-foreground flex ${box} shrink-0 items-center justify-center font-serif italic`}
    >
      {initials(name)}
    </span>
  );
}
