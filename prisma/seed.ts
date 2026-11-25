// Loads the content in src/content into the database.
// Run with: npm run db:seed. Safe to re-run: content is edited on the site now,
// so rows are only created if missing (by slug) and never overwritten.
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";
import { posts } from "../src/content/news";
import { outputs } from "../src/content/publications";
import { programmes } from "../src/content/research";
import { openRoles, people } from "../src/content/team";
import { PrismaClient } from "../src/generated/prisma/client";
import type { OutputStatus, OutputType } from "../src/generated/prisma/enums";

config({ path: [".env.local", ".env"], quiet: true });

const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!url) throw new Error("Set DATABASE_URL (and DIRECT_URL on Neon) in .env.local first.");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url, max: 1 }) });

const typeValue: Record<string, OutputType> = {
  "Working paper": "working_paper",
  "Journal article": "journal_article",
  Preprint: "preprint",
  Dataset: "dataset",
  Software: "software",
  "Policy brief": "policy_brief",
};

const statusValue: Record<string, OutputStatus> = {
  "In preparation": "in_preparation",
  "Under review": "under_review",
  Published: "published",
};

const adminEmails = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const date = (iso: string) => new Date(`${iso}T00:00:00.000Z`);

async function main() {
  // Team
  for (const [i, p] of people.entries()) {
    const data = {
      name: p.name,
      role: p.role,
      focus: p.focus,
      bio: p.bio,
      photoUrl: p.photo ?? null,
      email: p.email ?? null,
      linkedinUrl: p.links?.find((l) => l.label === "LinkedIn")?.href ?? null,
      githubUrl: p.links?.find((l) => l.label === "GitHub")?.href ?? null,
      scholarUrl: p.links?.find((l) => l.label === "Google Scholar")?.href ?? null,
      isFounder: p.isFounder ?? false,
      sortOrder: i,
    };
    // Edited on the site (admin): create if missing, never overwrite.
    await prisma.teamMember.upsert({
      where: { slug: p.slug },
      create: { slug: p.slug, ...data },
      update: {},
    });
  }

  for (const [i, r] of openRoles.entries()) {
    const data = { title: r.title, background: r.background, owns: r.owns, sortOrder: i };
    await prisma.openRole.upsert({
      where: { slug: r.slug },
      create: { slug: r.slug, ...data },
      update: {},
    });
  }

  // Programmes, linked to the people who lead them
  for (const [i, p] of programmes.entries()) {
    const data = {
      number: p.number,
      label: p.label,
      title: p.title,
      summary: p.summary,
      question: p.question,
      status: "active" as const,
      statusLabel: p.status,
      currentStage: p.currentStage,
      leads: p.leads,
      areas: p.areas,
      whyItMatters: p.whyItMatters,
      subQuestions: p.subQuestions,
      design: p.design,
      dataSources: p.dataSources,
      approach: p.approach,
      scopes: p.scopes,
      stages: p.stages,
      outputs: p.outputs,
      commitments: p.commitments,
      highlights: p.highlights,
      isFeatured: p.isFeatured,
      sortOrder: i,
      lastUpdated: date(p.lastUpdated),
    };
    // Projects are edited on the site now, so the seed only creates missing
    // ones and never overwrites what leaders have changed.
    const project = await prisma.project.upsert({
      where: { slug: p.slug },
      create: { slug: p.slug, ...data },
      update: {},
    });

    // Give a seeded project a leader so its team can be managed: the first
    // admin account (from ADMIN_EMAILS) that exists. Never replaces a leader.
    if (!project.leaderId) {
      const leader = await prisma.user.findFirst({
        where: { email: { in: adminEmails }, role: "admin" },
        orderBy: { createdAt: "asc" },
      });
      if (leader) {
        await prisma.project.update({ where: { id: project.id }, data: { leaderId: leader.id } });
        await prisma.projectMembership.upsert({
          where: { projectId_userId: { projectId: project.id, userId: leader.id } },
          create: { projectId: project.id, userId: leader.id, role: "Team leader" },
          update: {},
        });
        console.log(`${p.slug}: ${leader.email} is now the team leader.`);
      }
    }

    const leads = await prisma.teamMember.findMany({ where: { name: { in: p.leads } } });
    for (const member of leads) {
      await prisma.projectMember.upsert({
        where: { projectId_memberId: { projectId: project.id, memberId: member.id } },
        create: { projectId: project.id, memberId: member.id, contribution: member.focus },
        update: { contribution: member.focus },
      });
    }
  }

  // Publications
  for (const [i, o] of outputs.entries()) {
    const project = o.programmeSlug
      ? await prisma.project.findUnique({ where: { slug: o.programmeSlug } })
      : null;
    const data = {
      title: o.title,
      type: typeValue[o.type],
      status: statusValue[o.status],
      authors: o.authors,
      year: o.year ?? null,
      venue: o.venue ?? null,
      abstract: o.abstract,
      projectId: project?.id ?? null,
      sortOrder: i,
    };
    // Edited on the site (admin): create if missing, never overwrite.
    await prisma.publication.upsert({
      where: { slug: o.slug },
      create: { slug: o.slug, ...data },
      update: {},
    });
  }

  // News
  for (const post of posts) {
    const data = {
      title: post.title,
      excerpt: post.excerpt,
      body: post.body.join("\n\n"),
      tags: post.tags,
      visibility: post.visibility ?? ("members" as const),
      publishedAt: date(post.date),
    };
    // Edited on the site (admin): create if missing, never overwrite.
    await prisma.newsPost.upsert({
      where: { slug: post.slug },
      create: { slug: post.slug, ...data },
      update: {},
    });
  }

  const counts = await Promise.all([
    prisma.teamMember.count(),
    prisma.openRole.count(),
    prisma.project.count(),
    prisma.publication.count(),
    prisma.newsPost.count(),
  ]);
  console.log(
    `Seed complete: ${counts[0]} people, ${counts[1]} open roles, ${counts[2]} programmes, ${counts[3]} publications, ${counts[4]} news posts.`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
