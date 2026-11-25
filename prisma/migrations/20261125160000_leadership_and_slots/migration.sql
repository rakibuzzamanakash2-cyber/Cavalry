-- CreateEnum
CREATE TYPE "ProjectPosition" AS ENUM ('member', 'co_leader', 'leader');

-- CreateEnum
CREATE TYPE "SlotRequestStatus" AS ENUM ('pending', 'approved', 'declined', 'cancelled');

-- AlterTable
ALTER TABLE "project_invites" ADD COLUMN     "position" "ProjectPosition" NOT NULL DEFAULT 'member';

-- AlterTable
ALTER TABLE "project_memberships" ADD COLUMN     "position" "ProjectPosition" NOT NULL DEFAULT 'member';

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "slots" INTEGER NOT NULL DEFAULT 5;

-- CreateTable
CREATE TABLE "project_slot_requests" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "requested_by_id" TEXT,
    "extra" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "SlotRequestStatus" NOT NULL DEFAULT 'pending',
    "decided_by_id" TEXT,
    "decided_at" TIMESTAMPTZ(6),
    "admin_note" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_slot_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "project_slot_requests_project_id_idx" ON "project_slot_requests"("project_id");

-- CreateIndex
CREATE INDEX "project_slot_requests_status_idx" ON "project_slot_requests"("status");

-- AddForeignKey
ALTER TABLE "project_slot_requests" ADD CONSTRAINT "project_slot_requests_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_slot_requests" ADD CONSTRAINT "project_slot_requests_requested_by_id_fkey" FOREIGN KEY ("requested_by_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_slot_requests" ADD CONSTRAINT "project_slot_requests_decided_by_id_fkey" FOREIGN KEY ("decided_by_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Data: a project that already has more than 5 people keeps room for them.
UPDATE "projects" p
SET "slots" = LEAST(10, GREATEST(5, (SELECT COUNT(*) FROM "project_memberships" m WHERE m."project_id" = p."id")))
WHERE (SELECT COUNT(*) FROM "project_memberships" m WHERE m."project_id" = p."id") > 5;
