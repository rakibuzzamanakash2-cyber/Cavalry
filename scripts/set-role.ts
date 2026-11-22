// Set a user's platform role from the command line (needs database access).
// Usage: npm run user:role -- someone@example.com admin
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";
import { PrismaClient } from "../src/generated/prisma/client";
import { ROLES, type Role } from "../src/lib/roles";

config({ path: [".env.local", ".env"], quiet: true });

const [email, role] = process.argv.slice(2);
if (!email || !ROLES.includes(role as Role)) {
  console.error(`Usage: npm run user:role -- <email> <${ROLES.join("|")}>`);
  process.exit(1);
}

const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!url) throw new Error("Set DATABASE_URL in .env.local first.");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url, max: 1 }) });

async function main() {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) {
    console.error(`No account with email ${email}. Sign up on the site first.`);
    process.exitCode = 1;
    return;
  }
  await prisma.user.update({ where: { id: user.id }, data: { role } });
  await prisma.session.deleteMany({ where: { userId: user.id } });
  console.log(`${user.name} <${user.email}> is now ${role}. They need to sign in again.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
