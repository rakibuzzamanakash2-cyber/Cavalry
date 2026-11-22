// Site-wide settings. Edit here rather than hard-coding in components.
export const site = {
  name: "CAVALRY research",
  shortName: "CAVALRY",
  tagline: "Research. Develop. Build.",
  description:
    "CAVALRY research is an independent research group investigating important problems with rigorous, reproducible methods and turning validated findings into useful tools.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  location: "Dhaka, Bangladesh",
  // Shown in the footer and contact page only when set.
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "",
  // Optional public profiles, shown on the Contact page when set.
  links: [
    { label: "LinkedIn", href: process.env.NEXT_PUBLIC_LINKEDIN_URL ?? "" },
    { label: "GitHub", href: process.env.NEXT_PUBLIC_GITHUB_URL ?? "" },
  ].filter((l) => l.href),
  nav: [
    { href: "/about", label: "About" },
    { href: "/research", label: "Research" },
    { href: "/publications", label: "Publications" },
    { href: "/team", label: "Team" },
    { href: "/news", label: "News" },
    { href: "/contact", label: "Contact" },
  ],
};
