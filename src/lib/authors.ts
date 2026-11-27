// Splitting author lists ("A, B and C") so names can link to profile pages.
// Kept free of server-only imports so tests can use it.

export type AuthorPart = { text: string; slug?: string };

const SEPARATOR = /(,\s*and\s+|,\s*|\s+and\s+|\s*&\s*)/;

function normalize(name: string) {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

/** Split an author string into names (linked when they match a profile) and separators. */
export function splitAuthors(
  authors: string,
  people: { name: string; slug: string }[],
): AuthorPart[] {
  const bySlug = new Map(people.map((p) => [normalize(p.name), p.slug]));
  return authors
    .split(SEPARATOR)
    .filter((part) => part !== "")
    .map((part, i) =>
      i % 2 === 0 ? { text: part, slug: bySlug.get(normalize(part)) } : { text: part },
    );
}

/** Whether a person is one of the authors. */
export function isAuthor(authors: string, name: string) {
  const target = normalize(name);
  return authors
    .split(SEPARATOR)
    .filter((_, i) => i % 2 === 0)
    .some((part) => normalize(part) === target);
}
