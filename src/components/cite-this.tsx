"use client";

import { useId, useState } from "react";

type Format = "reference" | "bibtex" | "ris";

const LABEL: Record<Format, string> = { reference: "Reference", bibtex: "BibTeX", ris: "RIS" };
const FILE: Record<Exclude<Format, "reference">, { ext: string; type: string }> = {
  bibtex: { ext: "bib", type: "application/x-bibtex" },
  ris: { ext: "ris", type: "application/x-research-info-systems" },
};

/** Citation in three formats with copy and download buttons. */
export function CiteThis({
  fileName,
  reference,
  bibtex,
  ris,
}: {
  fileName: string;
  reference: string;
  bibtex: string;
  ris: string;
}) {
  const [format, setFormat] = useState<Format>("reference");
  const [copied, setCopied] = useState(false);
  const id = useId();
  const text = { reference, bibtex, ris }[format];

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  function download() {
    if (format === "reference") return;
    const { ext, type } = FILE[format];
    const url = URL.createObjectURL(new Blob([text], { type }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const button =
    "border-line text-primary hover:bg-sand border px-3 py-1.5 text-sm font-medium transition-colors";

  return (
    <div className="border-line bg-sand/40 border p-5 sm:p-6">
      <h2 id={`${id}-title`} className="text-2xl">
        Cite this
      </h2>
      <div role="tablist" aria-labelledby={`${id}-title`} className="mt-4 flex gap-5 text-sm">
        {(Object.keys(LABEL) as Format[]).map((f) => (
          <button
            key={f}
            type="button"
            role="tab"
            id={`${id}-tab-${f}`}
            aria-selected={format === f}
            aria-controls={`${id}-panel`}
            onClick={() => {
              setFormat(f);
              setCopied(false);
            }}
            className={`border-b-2 pb-1 transition-colors ${
              format === f
                ? "border-accent text-primary font-medium"
                : "text-muted hover:text-primary border-transparent"
            }`}
          >
            {LABEL[f]}
          </button>
        ))}
      </div>
      <pre
        id={`${id}-panel`}
        role="tabpanel"
        aria-labelledby={`${id}-tab-${format}`}
        tabIndex={0}
        data-testid="citation-text"
        className={`bg-paper border-line text-ink mt-3 overflow-x-auto border p-4 text-sm leading-relaxed ${
          format === "reference" ? "font-sans whitespace-pre-wrap" : "font-mono"
        }`}
      >
        {text}
      </pre>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button type="button" onClick={copy} className={button}>
          Copy
        </button>
        {format !== "reference" ? (
          <button type="button" onClick={download} className={button}>
            Download .{FILE[format].ext}
          </button>
        ) : null}
        <span role="status" className="text-muted text-sm">
          {copied ? "Copied" : ""}
        </span>
      </div>
    </div>
  );
}
