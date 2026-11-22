import {
  boolean,
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

export const projectStatus = pgEnum("project_status", [
  "planning",
  "active",
  "completed",
  "paused",
]);

export const publicationType = pgEnum("publication_type", [
  "journal",
  "conference",
  "preprint",
  "report",
  "dataset",
  "software",
]);

// People shown on the Team page.
export const teamMembers = pgTable(
  "team_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    role: text("role").notNull(),
    bio: text("bio"),
    photoUrl: text("photo_url"),
    email: text("email"),
    linkedinUrl: text("linkedin_url"),
    githubUrl: text("github_url"),
    scholarUrl: text("scholar_url"),
    isFounder: boolean("is_founder").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
  },
  (t) => [index("team_members_sort_idx").on(t.isActive, t.sortOrder)],
).enableRLS();

// Research projects (the flagship disaster-finance study is the first one).
export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    summary: text("summary").notNull(),
    body: text("body"), // Markdown
    status: projectStatus("status").notNull().default("planning"),
    startedOn: date("started_on"),
    coverImageUrl: text("cover_image_url"),
    isFeatured: boolean("is_featured").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
  },
  (t) => [index("projects_sort_idx").on(t.isFeatured, t.sortOrder)],
).enableRLS();

// Which team members work on which project.
export const projectMembers = pgTable(
  "project_members",
  {
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    memberId: uuid("member_id")
      .notNull()
      .references(() => teamMembers.id, { onDelete: "cascade" }),
    contribution: text("contribution"),
  },
  (t) => [primaryKey({ columns: [t.projectId, t.memberId] })],
).enableRLS();

// Papers, preprints, reports, datasets and code releases.
export const publications = pgTable(
  "publications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    authors: text("authors").notNull(),
    venue: text("venue"),
    type: publicationType("type").notNull(),
    year: integer("year").notNull(),
    abstract: text("abstract"),
    url: text("url"),
    pdfUrl: text("pdf_url"),
    doi: text("doi"),
    projectId: uuid("project_id").references(() => projects.id, { onDelete: "set null" }),
    ...timestamps,
  },
  (t) => [index("publications_year_idx").on(t.year)],
).enableRLS();

// News and updates. A null publishedAt means the post is a draft.
export const newsPosts = pgTable(
  "news_posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    excerpt: text("excerpt").notNull(),
    body: text("body"), // Markdown
    coverImageUrl: text("cover_image_url"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [index("news_posts_published_idx").on(t.publishedAt)],
).enableRLS();

export type TeamMember = typeof teamMembers.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type Publication = typeof publications.$inferSelect;
export type NewsPost = typeof newsPosts.$inferSelect;
