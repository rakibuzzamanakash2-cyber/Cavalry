-- Every account gets a permanent ID like CAV00001, numbered in sign-up order.
CREATE SEQUENCE "user_uid_seq";

ALTER TABLE "user" ADD COLUMN "uid" TEXT;
ALTER TABLE "user" ADD COLUMN "username" TEXT;

UPDATE "user" AS u
SET "uid" = 'CAV' || lpad(o.n::text, 5, '0')
FROM (SELECT "id", row_number() OVER (ORDER BY "created_at", "id") AS n FROM "user") AS o
WHERE u."id" = o."id";

SELECT setval('"user_uid_seq"', GREATEST((SELECT count(*) FROM "user"), 1), (SELECT count(*) FROM "user") > 0);

ALTER TABLE "user" ALTER COLUMN "uid" SET DEFAULT ('CAV'::text || lpad((nextval('user_uid_seq'::regclass))::text, 5, '0'::text));
ALTER TABLE "user" ALTER COLUMN "uid" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "user_uid_key" ON "user"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");
