// Research content shown on the home page. Kept honest to the current plan:
// update the stage and wording as the programme moves forward.
// (Moves to the database once the admin panel exists.)

export const researchAreas = [
  { title: "Public finance", detail: "How governments allocate and reallocate spending" },
  { title: "Climate & disaster risk", detail: "Physical hazards and their economic aftermath" },
  { title: "Causal inference", detail: "Credible estimates from observational data" },
  { title: "Machine learning for policy", detail: "Forecasts with honest uncertainty" },
] as const;

export const principles = [
  { numeral: "I", title: "Question first", detail: "A written protocol before any model is run." },
  {
    numeral: "II",
    title: "Open & reproducible",
    detail: "Version-controlled code; every result rebuilt from raw data.",
  },
  {
    numeral: "III",
    title: "Honest uncertainty",
    detail: "Intervals, robustness checks and stated limitations.",
  },
  {
    numeral: "IV",
    title: "Research to tools",
    detail: "Validated findings become usable systems.",
  },
] as const;

export const flagship = {
  label: "Flagship programme 01",
  slug: "disasters-and-public-spending",
  title: "Disasters and the composition of public spending",
  question:
    "When a country is hit by a physically intense natural hazard, how do the shares and real levels of government spending on each sector change in the following years?",
  facts: [
    { term: "Approach", value: "Local projections · event-study design · compositional checks" },
    { term: "Data", value: "IMF GFS (COFOG), IFPRI SPEED, IBTrACS, ERA5 / CHIRPS" },
    { term: "Scope", value: "Multi-country panel, set by the data-feasibility audit" },
    { term: "Output", value: "Working paper, open code and replication package" },
  ],
  stages: ["Protocol", "Data audit", "Dataset", "Analysis", "Paper"],
  currentStage: 0, // index into stages
} as const;
