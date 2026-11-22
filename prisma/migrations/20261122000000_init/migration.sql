-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('planning', 'active', 'completed', 'paused');

-- CreateEnum
CREATE TYPE "OutputType" AS ENUM ('working_paper', 'journal_article', 'preprint', 'dataset', 'software', 'policy_brief');

-- CreateEnum
CREATE TYPE "OutputStatus" AS ENUM ('in_preparation', 'under_review', 'published');

-- CreateTable
CREATE TABLE "team_members" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "focus" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "photo_url" TEXT,
    "email" TEXT,
    "linkedin_url" TEXT,
    "github_url" TEXT,
    "scholar_url" TEXT,
    "is_founder" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "open_roles" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "background" TEXT NOT NULL,
    "owns" TEXT NOT NULL,
    "is_open" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "open_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'planning',
    "status_label" TEXT NOT NULL,
    "current_stage" INTEGER NOT NULL DEFAULT 0,
    "leads" TEXT[],
    "areas" TEXT[],
    "why_it_matters" JSONB NOT NULL,
    "sub_questions" JSONB NOT NULL,
    "design" JSONB NOT NULL,
    "data_sources" JSONB NOT NULL,
    "approach" JSONB NOT NULL,
    "scopes" JSONB NOT NULL,
    "stages" JSONB NOT NULL,
    "outputs" JSONB NOT NULL,
    "commitments" JSONB NOT NULL,
    "highlights" JSONB NOT NULL,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "last_updated" DATE NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_members" (
    "project_id" UUID NOT NULL,
    "member_id" UUID NOT NULL,
    "contribution" TEXT,

    CONSTRAINT "project_members_pkey" PRIMARY KEY ("project_id","member_id")
);

-- CreateTable
CREATE TABLE "publications" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "OutputType" NOT NULL,
    "status" "OutputStatus" NOT NULL,
    "authors" TEXT NOT NULL,
    "year" INTEGER,
    "venue" TEXT,
    "abstract" TEXT NOT NULL,
    "url" TEXT,
    "pdf_url" TEXT,
    "doi" TEXT,
    "project_id" UUID,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "publications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_posts" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "tags" TEXT[],
    "published_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "news_posts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "team_members_slug_key" ON "team_members"("slug");

-- CreateIndex
CREATE INDEX "team_members_is_active_sort_order_idx" ON "team_members"("is_active", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "open_roles_slug_key" ON "open_roles"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "projects_slug_key" ON "projects"("slug");

-- CreateIndex
CREATE INDEX "projects_is_featured_sort_order_idx" ON "projects"("is_featured", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "publications_slug_key" ON "publications"("slug");

-- CreateIndex
CREATE INDEX "publications_status_year_idx" ON "publications"("status", "year");

-- CreateIndex
CREATE UNIQUE INDEX "news_posts_slug_key" ON "news_posts"("slug");

-- CreateIndex
CREATE INDEX "news_posts_published_at_idx" ON "news_posts"("published_at");

-- AddForeignKey
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "team_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publications" ADD CONSTRAINT "publications_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
