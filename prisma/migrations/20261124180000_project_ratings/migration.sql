-- AlterTable
ALTER TABLE "project_memberships" ADD COLUMN     "rated_at" TIMESTAMPTZ(6),
ADD COLUMN     "rated_by_id" TEXT,
ADD COLUMN     "rating" INTEGER;

-- AddForeignKey
ALTER TABLE "project_memberships" ADD CONSTRAINT "project_memberships_rated_by_id_fkey" FOREIGN KEY ("rated_by_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
