// Research content. Research areas and principles are site copy and live here.
// Programmes are seeded into the database (npm run db:seed) and read through
// src/data; this file is also the fallback when no database is configured.

/** Research areas. `tone` is the area's fixed colour, reused in charts. */
export const researchAreas = [
  {
    title: "Public finance",
    tone: "chart-1",
    detail: "How governments allocate and reallocate spending",
    long: "How governments decide what to spend on, and how those priorities shift when budgets come under pressure.",
  },
  {
    title: "Climate & disaster risk",
    tone: "chart-2",
    detail: "Physical hazards and their economic aftermath",
    long: "Cyclones, floods and droughts measured by their physical intensity, and what follows for economies and public services.",
  },
  {
    title: "Causal inference",
    tone: "chart-3",
    detail: "Credible estimates from observational data",
    long: "Research designs that separate cause from coincidence when experiments are impossible, with pre-trend and placebo checks.",
  },
  {
    title: "Machine learning for policy",
    tone: "chart-4",
    detail: "Forecasts with honest uncertainty",
    long: "Predictive models judged against simple baselines and reported with calibrated intervals, kept distinct from causal claims.",
  },
] as const;

/** Fields people can apply to work in: the research areas, plus engineering and other. */
export const applicationFields = [
  ...researchAreas.map((a) => a.title),
  "Software and data engineering",
  "Other",
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

export type StageStatus = "done" | "current" | "next";

export type Programme = {
  slug: string;
  number: string;
  label: string;
  title: string;
  status: string;
  lastUpdated: string; // ISO date
  leads: string[];
  areas: string[];
  summary: string;
  question: string;
  whyItMatters: string[];
  subQuestions: { id: string; question: string; hypothesis: string }[];
  design: { term: string; value: string }[];
  dataSources: { need: string; source: string; role: string }[];
  approach: { title: string; detail: string }[];
  scopes: { plan: string; scope: string; why: string }[];
  stages: { name: string; detail: string }[];
  currentStage: number;
  outputs: string[];
  commitments: string[];
  /** Short facts for the home page card. */
  highlights: { term: string; value: string }[];
  isFeatured: boolean;
};

export const programmes: Programme[] = [
  {
    slug: "disasters-and-public-spending",
    number: "01",
    label: "Flagship programme 01",
    title: "Disasters and the composition of public spending",
    status: "In progress",
    lastUpdated: "2026-11-22",
    leads: ["Md Rakibuzzaman", "Rowshan Rubayet"],
    areas: ["Public finance", "Climate & disaster risk", "Causal inference"],
    summary:
      "A multi-country study of how governments reallocate spending between sectors after physically intense natural hazards — and whether that reallocation protects or crowds out health and education.",
    question:
      "When a country is hit by a physically intense natural hazard, how do the shares and real levels of government spending on each sector change in the following years?",
    whyItMatters: [
      "Disasters force governments to find money quickly. What gets cut, what grows and for how long shapes recovery long after the emergency ends — especially in countries with little fiscal space.",
      "Most existing evidence relies on reported monetary damage, which is larger in richer countries simply because there is more to damage. Measuring the hazard itself — wind speed, rainfall, drought — gives a cleaner, more comparable shock.",
      "Looking at both sector shares and real spending levels separates genuine reprioritisation from a budget that is simply growing or shrinking overall.",
    ],
    subQuestions: [
      {
        id: "RQ1",
        question: "Does hazard exposure change the sector composition of spending?",
        hypothesis:
          "Shares of social protection and housing rise, and capital-heavy sectors fall, in the first one to two years.",
      },
      {
        id: "RQ2",
        question: "Is the change a reallocation, or a change in the total budget?",
        hypothesis:
          "Real total spending rises by less than relief needs, so some sectors fall in real terms.",
      },
      {
        id: "RQ3",
        question: "Do effects differ with fiscal space and poverty?",
        hypothesis:
          "High-debt and low-income countries show stronger crowding-out of health and education.",
      },
      {
        id: "RQ4",
        question: "Can post-shock sector budgets be forecast with useful uncertainty?",
        hypothesis:
          "Calibrated forecast intervals beat a simple persistence baseline on held-out years. (Extension, only after the main analysis is stable.)",
      },
    ],
    design: [
      { term: "Unit", value: "Country-year, with national fiscal years mapped to event dates" },
      {
        term: "Outcomes",
        value:
          "Sector shares of total spending; real per-capita sector spending; total spending as a share of GDP",
      },
      {
        term: "Exposure",
        value:
          "Population-weighted physical intensity — cyclone wind speed, rainfall anomalies, drought index — plus a binary ‘major event’ version",
      },
      {
        term: "Timing",
        value:
          "Events assigned to the fiscal year they fall in; late-year events also tested as hitting the next year",
      },
      {
        term: "Moderators",
        value:
          "Public debt, poverty, income level, aid inflows; conflict and election years as controls",
      },
    ],
    dataSources: [
      {
        need: "Sector spending",
        source: "IMF Government Finance Statistics — expenditure by function (COFOG)",
        role: "Official functional classification; coverage varies by country and year",
      },
      {
        need: "Sector spending",
        source: "IFPRI SPEED (2019 release)",
        role: "164 countries, 1980–2017, ten sectors; long backbone for the panel",
      },
      {
        need: "Cyclones",
        source: "IBTrACS best-track data",
        role: "Storm tracks for modelled wind speed on a grid",
      },
      {
        need: "Rainfall and drought",
        source: "ERA5 reanalysis, CHIRPS, SPEI",
        role: "Gridded rainfall anomalies and drought index",
      },
      {
        need: "Event validation",
        source: "EM-DAT, GDIS",
        role: "Event dates and locations for checking; EM-DAT data is not redistributed",
      },
      {
        need: "Weights and controls",
        source: "GPW / WorldPop, World Bank WDI, IMF WEO, IMF Global Debt Database",
        role: "Population weights, prices, GDP, debt and poverty",
      },
    ],
    approach: [
      {
        title: "Local projections",
        detail:
          "Trace each sector's response at horizons of zero to three years, with country and year fixed effects.",
      },
      {
        title: "Event study",
        detail:
          "For major events, a heterogeneity-robust staggered design with pre-event coefficients to test for pre-trends.",
      },
      {
        title: "Compositional check",
        detail:
          "Re-estimate with log-ratio shares so that sector effects stay mutually consistent.",
      },
      {
        title: "Robustness",
        detail:
          "Placebo tests with future shocks, alternative intensity thresholds, dropping mega-events, and comparing data sources.",
      },
      {
        title: "Heterogeneity",
        detail: "Interactions with debt and poverty, reported with multiple-testing correction.",
      },
    ],
    scopes: [
      {
        plan: "A",
        scope: "Global panel, all three hazards",
        why: "Broadest evidence base, if coverage allows",
      },
      {
        plan: "B",
        scope: "Cyclone-exposed countries only",
        why: "Cleanest physical shock and strongest hazard data",
      },
      {
        plan: "C",
        scope: "South and Southeast Asia, with a Bangladesh deep-dive",
        why: "Regional relevance and richer national budget detail",
      },
    ],
    stages: [
      {
        name: "Protocol",
        detail: "Questions, estimands, timing rule and sector definitions written and reviewed.",
      },
      {
        name: "Data audit",
        detail:
          "Coverage of every source checked; decision on scope A, B or C recorded before analysis.",
      },
      {
        name: "Dataset",
        detail: "Harmonised panel rebuilt from raw data by one command, with a data dictionary.",
      },
      {
        name: "Analysis",
        detail:
          "Main estimates, event studies, robustness and heterogeneity, all generated by code.",
      },
      {
        name: "Paper",
        detail: "Working paper, external feedback, preprint and journal submission.",
      },
    ],
    currentStage: 0,
    outputs: [
      "Working paper and journal submission",
      "Open-source code under an open licence",
      "Replication package with download scripts and a data dictionary",
      "Short policy brief on what the results mean for budgeting after disasters",
    ],
    commitments: [
      "Protocol written before analysis; later changes logged with date and reason.",
      "Exploratory and confirmatory results kept separate.",
      "Uncertainty, missing data and limitations reported, not hidden.",
      "No causal claims beyond what the design supports.",
      "Every source cited and used within its licence.",
    ],
    highlights: [
      { term: "Approach", value: "Local projections · event-study design" },
      { term: "Data", value: "IMF COFOG · IFPRI SPEED · IBTrACS · ERA5" },
      { term: "Scope", value: "Multi-country panel, sized by the data audit" },
      { term: "Output", value: "Working paper · open code · replication package" },
    ],
    isFeatured: true,
  },
];

export function stageStatus(index: number, current: number): StageStatus {
  return index < current ? "done" : index === current ? "current" : "next";
}
