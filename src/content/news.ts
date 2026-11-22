// News and updates, newest first. Body is plain paragraphs (no Markdown yet).

export type NewsPost = {
  slug: string;
  title: string;
  date: string; // ISO date
  excerpt: string;
  body: string[];
  tags: string[];
};

export const posts: NewsPost[] = [
  {
    slug: "cavalry-research-begins",
    title: "CAVALRY research begins, with its first programme at the protocol stage",
    date: "2026-11-22",
    excerpt:
      "We are starting as a small, research-first group in Dhaka. Our first programme asks how governments reallocate public spending after natural disasters.",
    body: [
      "CAVALRY research is starting as a small, independent research group based in Dhaka, Bangladesh. Our aim is simple to state and hard to do well: investigate important problems carefully, develop credible methods, and turn validated findings into useful tools.",
      "Our first programme asks how governments reallocate public spending between sectors after physically intense natural hazards — cyclones, floods and droughts — and whether that reallocation protects or crowds out health and education.",
      "The programme is at its protocol stage. Before any model is run, we are writing down the research questions, the quantities we want to estimate and the analysis plan. The next step is a data audit that checks the coverage of every candidate source and decides how wide the study can honestly be.",
      "We will post updates here as each stage is completed, along with any changes to the plan and the reasons for them.",
    ],
    tags: ["Announcement", "Disasters and public spending"],
  },
];

export function getPost(slug: string) {
  return posts.find((p) => p.slug === slug) ?? null;
}
