// Publications and other research outputs. Only list real items with an
// honest status; nothing here should look published before it is.

export type OutputType =
  "Working paper" | "Journal article" | "Preprint" | "Dataset" | "Software" | "Policy brief";

export type OutputStatus = "In preparation" | "Under review" | "Published";

export type Output = {
  slug: string;
  title: string;
  type: OutputType;
  status: OutputStatus;
  authors: string;
  year?: number;
  venue?: string;
  abstract: string;
  programmeSlug?: string;
  links?: { label: string; href: string }[];
  doi?: string;
  pdfUrl?: string;
  codeUrl?: string;
  dataUrl?: string;
  /** Key into LICENCES (src/lib/citation.ts). */
  licence?: string;
};

export const outputs: Output[] = [
  {
    slug: "disasters-public-spending-working-paper",
    title: "Disasters and the composition of public spending",
    type: "Working paper",
    status: "In preparation",
    authors: "CAVALRY research team",
    abstract:
      "How sector shares and real levels of government spending change after physically intense natural hazards, across countries and levels of fiscal space.",
    programmeSlug: "disasters-and-public-spending",
  },
  {
    slug: "disasters-public-spending-replication",
    title: "Replication package: disasters and public spending",
    type: "Software",
    status: "In preparation",
    authors: "CAVALRY research team",
    abstract:
      "Open code, download scripts and a data dictionary that rebuild every table and figure from the original sources.",
    programmeSlug: "disasters-and-public-spending",
  },
];

export const outputKinds = [
  { title: "Papers", detail: "Working papers, preprints and journal articles." },
  { title: "Data", detail: "Documented datasets, where source licences allow sharing." },
  { title: "Code", detail: "Open-source pipelines that reproduce our results." },
  { title: "Briefs", detail: "Short, plain-language notes on what findings mean." },
];
