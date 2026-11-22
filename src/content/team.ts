// People and open roles. Photos are optional: without one, initials are shown.

export type Person = {
  slug: string;
  name: string;
  role: string;
  focus: string;
  bio: string;
  photo?: string; // path under /public, e.g. "/team/rakib.jpg"
  isFounder?: boolean;
  links?: { label: string; href: string }[];
};

export const people: Person[] = [
  {
    slug: "rakib",
    isFounder: true,
    name: "Md Rakibuzzaman",
    role: "Co-founder · Project and data lead",
    focus: "Fiscal data, harmonisation and project coordination",
    bio: "Leads the flagship programme's data work — assembling and harmonising public-spending and hazard datasets — and coordinates the protocol, timeline and stage reviews.",
  },
  {
    slug: "rubayet",
    isFounder: true,
    name: "Rubayet",
    role: "Co-founder · Technical lead",
    focus: "Modelling, codebase and reproducible pipelines",
    bio: "Leads the shared codebase and modelling work, including the reproducible data pipeline, automated checks and the forecasting extension.",
  },
];

export type OpenRole = {
  slug: string;
  title: string;
  background: string;
  owns: string;
};

export const openRoles: OpenRole[] = [
  {
    slug: "geospatial-hazard-data",
    title: "Geospatial and hazard data",
    background: "Computer science or a related field",
    owns: "Building hazard exposure measures for cyclones, floods and droughts from gridded data",
  },
  {
    slug: "data-quality-reproducibility",
    title: "Data quality and reproducibility",
    background: "Computer science or a related field",
    owns: "Tests, validation checks, the data dictionary and the replication package",
  },
  {
    slug: "public-finance-literature",
    title: "Public finance and literature",
    background: "Business, economics or finance — statistics coursework is a strong plus",
    owns: "Literature review, sector definitions, fiscal-year rules and interpreting results",
  },
];

export const joiningNotes = [
  "Everyone joins as a member; responsibilities grow with reviewed, completed work.",
  "We ask for a short sample of past work and a small written task.",
  "Contributions are credited on every output using the CRediT roles.",
];
