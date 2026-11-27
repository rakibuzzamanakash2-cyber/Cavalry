// Research content. Research areas and principles are site copy and live here.
// Programmes are seeded into the database (npm run db:seed) and read through
// src/data; this file is also the fallback when no database is configured.

/**
 * Research areas, each with its own topic page at /research/areas/<slug>.
 * `tone` is the area's fixed colour, reused in charts. Keep this copy general:
 * research in progress is confidential and must not be described here.
 */
export const researchAreas = [
  {
    slug: "public-finance",
    title: "Public finance",
    tone: "chart-1",
    detail: "How governments allocate and reallocate spending",
    long: "How governments decide what to spend on, and how those priorities shift when budgets come under pressure.",
    intro: [
      "Budgets are where a government's priorities become concrete. We study how spending is divided between sectors such as health, education, social protection and infrastructure, and how that division changes over time.",
      "We are most interested in moments of pressure: when revenue falls, costs rise suddenly or new obligations arrive. Those moments show which commitments a government protects and which it lets go.",
    ],
    questions: [
      "Which kinds of spending are protected when budgets tighten, and which are cut first?",
      "How long do changes in spending priorities last after a shock has passed?",
      "Do countries with more fiscal space respond differently from those with less?",
    ],
    methods: [
      "Harmonised cross-country spending data, with every source and definition documented.",
      "Panel methods that compare a country with itself before and after an event.",
      "Results reported as shares of the budget as well as levels, so priorities stay visible.",
    ],
  },
  {
    slug: "climate-and-disaster-risk",
    title: "Climate & disaster risk",
    tone: "chart-2",
    detail: "Physical hazards and their economic aftermath",
    long: "Cyclones, floods and droughts measured by their physical intensity, and what follows for economies and public services.",
    intro: [
      "Disasters are often measured by the damage they cause, but damage depends on how prepared a place was. We prefer to start from the physical hazard itself: wind speed, rainfall, flood extent or drought severity.",
      "Measuring the hazard separately from its impact lets us ask what a storm or flood of a given strength does to an economy, and why the same event hurts some places far more than others.",
    ],
    questions: [
      "What follows, economically and fiscally, from a hazard of a given physical intensity?",
      "Why do similar events lead to very different losses in different places?",
      "How do public services and budgets adjust in the years after a disaster?",
    ],
    methods: [
      "Hazard measures built from physical records rather than reported losses.",
      "Careful matching of events to the places and years they affected.",
      "Checks that results hold when thresholds and definitions change.",
    ],
  },
  {
    slug: "causal-inference",
    title: "Causal inference",
    tone: "chart-3",
    detail: "Credible estimates from observational data",
    long: "Research designs that separate cause from coincidence when experiments are impossible, with pre-trend and placebo checks.",
    intro: [
      "Most policy questions cannot be answered with an experiment. Nobody can assign disasters, recessions or reforms at random, so the evidence has to come from what actually happened.",
      "Our work in this area is about designs that make such evidence credible: being explicit about what is compared with what, testing the assumptions that comparison relies on, and saying plainly when they fail.",
    ],
    questions: [
      "What is the right comparison for a country or region that experienced an event?",
      "Were treated and untreated units already on different paths before the event?",
      "Do the results survive placebo tests and alternative specifications?",
    ],
    methods: [
      "Estimands and identifying assumptions written into the protocol before analysis.",
      "Event-study and difference-in-differences designs with pre-trend checks.",
      "Placebo tests, leave-one-out checks and honest reporting of uncertainty.",
    ],
  },
  {
    slug: "machine-learning-for-policy",
    title: "Machine learning for policy",
    tone: "chart-4",
    detail: "Forecasts with honest uncertainty",
    long: "Predictive models judged against simple baselines and reported with calibrated intervals, kept distinct from causal claims.",
    intro: [
      "Machine learning is useful for prediction: anticipating needs, spotting risks early and filling gaps in data. It is not, by itself, a way to learn what causes what, and we keep the two kinds of claim apart.",
      "A forecast is only useful if people know how far to trust it. We judge models against simple baselines, test them on data they have not seen and report how often their intervals contain the truth.",
    ],
    questions: [
      "Does a complex model actually beat a simple baseline on data it has not seen?",
      "Are the model's uncertainty intervals well calibrated?",
      "Which forecasts are reliable enough to support real decisions?",
    ],
    methods: [
      "Out-of-sample and time-respecting evaluation, never tuning on the test set.",
      "Comparison with simple, transparent baselines.",
      "Calibrated prediction intervals and clear statements of where a model should not be used.",
    ],
  },
] as const;

export type ResearchArea = (typeof researchAreas)[number];

export function getResearchArea(slug: string): ResearchArea | undefined {
  return researchAreas.find((a) => a.slug === slug);
}

/** Fields people can apply to work in: the research areas, plus engineering and other. */
export const applicationFields = [
  ...researchAreas.map((a) => a.title),
  "Software and data engineering",
  "Other",
] as const;

/** The evidence-gated stages every programme moves through (public). */
export const programmeProcess = [
  { name: "Protocol", detail: "The question, estimands and analysis plan are written down first." },
  { name: "Data audit", detail: "Every source is checked for coverage before the scope is fixed." },
  { name: "Dataset", detail: "A versioned dataset that rebuilds from raw data with one command." },
  { name: "Analysis", detail: "Estimates, robustness and uncertainty, all generated by code." },
  { name: "Publication", detail: "Paper, open code and a replication package." },
] as const;

/** What has to exist before a programme moves past each stage (How we work page). */
export const stageGates = [
  "A written protocol with the question, estimands and analysis plan, reviewed by the team.",
  "A coverage report for every data source, and a decision on scope based on it.",
  "A versioned dataset that rebuilds from raw data, with automated checks passing.",
  "Main results, robustness checks and uncertainty, all produced by code in the repository.",
  "A paper, the code and a replication package that someone outside the team can run.",
] as const;

/** Longer explanations of the principles (How we work page). */
export const principleDetails = [
  "Every programme starts with a written protocol: the question, what exactly we will estimate, the data we expect to use and how we will analyse it. Writing it down first stops the analysis drifting towards whatever looks interesting.",
  "Code lives in version control from day one, and every number in a paper is produced by that code from raw data. When we publish, we share the code and data so anyone can check the work.",
  "We report intervals, not just point estimates, run robustness checks and state the limitations of each result. A finding that only holds under one specification is reported that way.",
  "When a finding is validated, we look for ways to turn it into something people can use, such as a dataset, a dashboard or a tool, and we build it with the same care as the research.",
] as const;

/** Working standards (How we work page). */
export const standards = [
  {
    title: "Data",
    detail:
      "Every source is recorded with its version, licence and coverage. Changes to data are made by code, never by hand, so the dataset can always be rebuilt.",
  },
  {
    title: "Code",
    detail:
      "One shared repository per programme, reviewed changes and automated checks. Results that cannot be regenerated from the repository are not reported.",
  },
  {
    title: "Causal and predictive claims",
    detail:
      "We say clearly whether a result is a causal estimate or a prediction. Forecasts are never presented as evidence of cause and effect.",
  },
  {
    title: "Review",
    detail:
      "Each stage ends with a review by the team against its gate. Moving on depends on the output existing and holding up, not on a date arriving.",
  },
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
