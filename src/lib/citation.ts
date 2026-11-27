// Citations for published work: a readable reference, BibTeX and RIS, plus the
// licences an output can carry. No server-only imports, so the client copy
// button and tests can use it.

export const LICENCES = {
  "cc-by-4.0": { name: "CC BY 4.0", url: "https://creativecommons.org/licenses/by/4.0/" },
  "cc-by-sa-4.0": { name: "CC BY-SA 4.0", url: "https://creativecommons.org/licenses/by-sa/4.0/" },
  "cc-by-nc-4.0": { name: "CC BY-NC 4.0", url: "https://creativecommons.org/licenses/by-nc/4.0/" },
  cc0: {
    name: "CC0 1.0 (public domain)",
    url: "https://creativecommons.org/publicdomain/zero/1.0/",
  },
  mit: { name: "MIT", url: "https://opensource.org/license/mit" },
  "apache-2.0": { name: "Apache 2.0", url: "https://www.apache.org/licenses/LICENSE-2.0" },
  "all-rights-reserved": { name: "All rights reserved", url: null },
} as const satisfies Record<string, { name: string; url: string | null }>;

export type LicenceKey = keyof typeof LICENCES;

export function licenceOf(key: string | null | undefined) {
  return key && key in LICENCES ? LICENCES[key as LicenceKey] : undefined;
}

export type Citable = {
  slug: string;
  title: string;
  type: string; // site label, e.g. "Working paper"
  authors: string;
  year?: number;
  venue?: string;
  doi?: string;
  /** Canonical page for the work on our site. */
  pageUrl: string;
  publisher: string;
};

const SEPARATOR = /,\s*and\s+|,\s*|\s+and\s+|\s*&\s*/;

/** Author names as a list. */
export function authorList(authors: string) {
  return authors
    .split(SEPARATOR)
    .map((a) => a.trim())
    .filter(Boolean);
}

/** "Rowshan Rubayet" → "Rubayet, R."; single-word names (organisations) stay as they are. */
function apaName(name: string) {
  const parts = name.split(/\s+/);
  if (parts.length < 2 || /team|group|research|cavalry/i.test(name)) return name;
  const last = parts.at(-1)!;
  const initials = parts
    .slice(0, -1)
    .map((p) => `${p[0].toUpperCase()}.`)
    .join(" ");
  return `${last}, ${initials}`;
}

function joinApa(names: string[]) {
  const n = names.map(apaName);
  if (n.length <= 1) return n.join("");
  if (n.length === 2) return `${n[0]}, & ${n[1]}`;
  return `${n.slice(0, -1).join(", ")}, & ${n.at(-1)}`;
}

/** A readable APA-style reference. */
export function formatReference(w: Citable) {
  const authors = joinApa(authorList(w.authors));
  const year = w.year ? `(${w.year})` : "(n.d.)";
  const where =
    w.type === "Journal article" && w.venue
      ? w.venue
      : w.venue
        ? `${w.type}, ${w.venue}`
        : `${w.type}, ${w.publisher}`;
  const link = w.doi ? `https://doi.org/${w.doi}` : w.pageUrl;
  return `${authors} ${year}. ${w.title}. ${where}. ${link}`;
}

function bibEscape(value: string) {
  return value.replace(/([&%$#_])/g, "\\$1").replace(/[{}]/g, "");
}

/** A stable key like rubayet2027disasters. */
export function citationKey(w: Citable) {
  const first = authorList(w.authors)[0] ?? w.publisher;
  const surname = first.split(/\s+/).at(-1) ?? "anon";
  const word =
    w.title
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .find((t) => t.length > 3 && !["with", "from", "that", "this", "into"].includes(t)) ?? "work";
  return `${surname.toLowerCase().replace(/[^a-z0-9]/g, "")}${w.year ?? ""}${word}`;
}

const BIB_TYPE: Record<string, string> = {
  "Journal article": "article",
  "Working paper": "techreport",
  "Policy brief": "techreport",
  Preprint: "misc",
  Dataset: "misc",
  Software: "software",
};

/** A BibTeX entry. */
export function toBibtex(w: Citable) {
  const type = BIB_TYPE[w.type] ?? "misc";
  const fields: [string, string | undefined][] = [
    ["title", `{${bibEscape(w.title)}}`],
    ["author", authorList(w.authors).map(bibEscape).join(" and ")],
    ["year", w.year?.toString()],
    type === "article"
      ? ["journal", w.venue && bibEscape(w.venue)]
      : ["note", w.venue && bibEscape(w.venue)],
    type === "techreport"
      ? ["institution", bibEscape(w.publisher)]
      : ["publisher", bibEscape(w.publisher)],
    type === "techreport"
      ? ["type", w.type]
      : ["howpublished", type === "misc" ? w.type : undefined],
    ["doi", w.doi],
    ["url", w.doi ? `https://doi.org/${w.doi}` : w.pageUrl],
  ];
  const body = fields
    .filter((f): f is [string, string] => Boolean(f[1]))
    .map(([k, v]) => `  ${k} = {${v}}`)
    .join(",\n");
  return `@${type}{${citationKey(w)},\n${body}\n}`;
}

const RIS_TYPE: Record<string, string> = {
  "Journal article": "JOUR",
  "Working paper": "RPRT",
  "Policy brief": "RPRT",
  Preprint: "UNPB",
  Dataset: "DATA",
  Software: "COMP",
};

/** An RIS record (Zotero, Mendeley, EndNote). */
export function toRis(w: Citable) {
  const lines = [
    `TY  - ${RIS_TYPE[w.type] ?? "GEN"}`,
    `TI  - ${w.title}`,
    ...authorList(w.authors).map((a) => `AU  - ${a}`),
    w.year ? `PY  - ${w.year}` : null,
    w.venue ? `${w.type === "Journal article" ? "JO" : "T2"}  - ${w.venue}` : null,
    `PB  - ${w.publisher}`,
    w.doi ? `DO  - ${w.doi}` : null,
    `UR  - ${w.doi ? `https://doi.org/${w.doi}` : w.pageUrl}`,
    "ER  - ",
  ];
  return lines.filter(Boolean).join("\n");
}
