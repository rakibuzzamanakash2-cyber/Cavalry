/** "Flood shocks & budgets" → "flood-shocks-budgets" (max 60 characters). */
export function slugify(text: string, fallback = "item") {
  return (
    text
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60)
      .replace(/-+$/, "") || fallback
  );
}

/** The first of base, base-2, base-3… that `taken` says is free. */
export async function uniqueSlug(base: string, taken: (slug: string) => Promise<boolean>) {
  let slug = base;
  for (let n = 2; await taken(slug); n++) slug = `${base}-${n}`;
  return slug;
}
