-- Data only: fill in the two co-founder profiles on databases created before
-- this change. Each field is set only if it still holds the original seed
-- value (or is empty), so edits made on the site are kept.

UPDATE "team_members" SET "name" = 'Rowshan Rubayet' WHERE "slug" = 'rubayet' AND "name" = 'Rubayet';
UPDATE "team_members" SET "email" = 'rubayet.off@gmail.com' WHERE "slug" = 'rubayet' AND "email" IS NULL;

UPDATE "team_members" SET "email" = 'rakibuzzaman.akash2@gmail.com' WHERE "slug" = 'rakib' AND "email" IS NULL;
UPDATE "team_members" SET "linkedin_url" = 'https://www.linkedin.com/in/mdrakibuzzamanakash' WHERE "slug" = 'rakib' AND "linkedin_url" IS NULL;
UPDATE "team_members" SET "github_url" = 'https://github.com/rakibuzzamanakash2-cyber' WHERE "slug" = 'rakib' AND "github_url" IS NULL;
UPDATE "team_members"
SET "focus" = 'Public-finance and hazard data, harmonisation and project coordination',
    "bio" = 'A computer science and engineering student at United International University, Dhaka. He leads CAVALRY''s data work — finding, assembling and harmonising public-spending and natural-hazard datasets — and coordinates the protocol, timeline and stage reviews of the flagship programme on disasters and public spending.'
WHERE "slug" = 'rakib'
  AND "bio" = 'Leads the flagship programme''s data work — assembling and harmonising public-spending and hazard datasets — and coordinates the protocol, timeline and stage reviews.';

-- The flagship programme lists its leads by name.
UPDATE "projects" SET "leads" = array_replace("leads", 'Rubayet', 'Rowshan Rubayet') WHERE 'Rubayet' = ANY("leads");
