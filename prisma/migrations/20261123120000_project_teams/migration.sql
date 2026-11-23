-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "leader_id" TEXT;

-- CreateTable
CREATE TABLE "project_memberships" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "joined_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "project_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_invites" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "note" TEXT,
    "created_by_id" TEXT,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "accepted_by_id" TEXT,
    "accepted_at" TIMESTAMPTZ(6),
    "revoked_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_invites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "project_memberships_user_id_idx" ON "project_memberships"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_memberships_project_id_user_id_key" ON "project_memberships"("project_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_invites_token_hash_key" ON "project_invites"("token_hash");

-- CreateIndex
CREATE INDEX "project_invites_project_id_idx" ON "project_invites"("project_id");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_leader_id_fkey" FOREIGN KEY ("leader_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_memberships" ADD CONSTRAINT "project_memberships_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_memberships" ADD CONSTRAINT "project_memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_invites" ADD CONSTRAINT "project_invites_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_invites" ADD CONSTRAINT "project_invites_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_invites" ADD CONSTRAINT "project_invites_accepted_by_id_fkey" FOREIGN KEY ("accepted_by_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
