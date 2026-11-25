import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArticleSkeleton } from "@/components/article-skeleton";
import { AdminNav } from "@/components/admin-nav";
import { PageHeader } from "@/components/page-header";
import { getDb } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { roleLabel, toRole } from "@/lib/roles";
import { requireAdmin } from "@/lib/session";
import { RoleForm } from "./role-form";

export const metadata: Metadata = {
  title: "Users and roles",
  robots: { index: false, follow: false },
};

// Depends on who is signed in; see the note in app/workspace/layout.tsx.
export const instant = false;

export default function AdminUsersPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
      <PageHeader eyebrow="Admin" title="Users and roles">
        Members can see the research workspace. Changing someone&apos;s role signs them out so the
        change applies straight away.{" "}
        <Link href="/admin/applications" className="text-ink hover:text-accent underline">
          Review applications
        </Link>
      </PageHeader>
      <AdminNav current="/admin/users" />
      <Suspense fallback={<ArticleSkeleton />}>
        <UserTable />
      </Suspense>
    </div>
  );
}

async function UserTable() {
  const admin = await requireAdmin();
  const users = await getDb().user.findMany({
    orderBy: [{ createdAt: "asc" }],
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  const counts = { user: 0, member: 0, admin: 0 };
  for (const u of users) counts[toRole(u.role)]++;

  return (
    <section aria-label="Users" className="py-8 sm:py-10">
      <p className="text-muted text-sm">
        {users.length} accounts · {counts.admin} {roleLabel.admin.toLowerCase()}s · {counts.member}{" "}
        members · {counts.user} signed-in users
      </p>
      <ul className="border-line divide-line mt-4 divide-y border-y">
        {users.map((u) => (
          <li key={u.id} className="grid gap-3 py-4 md:grid-cols-12 md:items-center md:gap-6">
            <div className="min-w-0 md:col-span-5">
              <p className="font-medium">{u.name}</p>
              <p className="text-muted truncate text-sm">{u.email}</p>
            </div>
            <p className="text-muted text-sm md:col-span-2">
              Joined {formatDate(u.createdAt.toISOString().slice(0, 10))}
            </p>
            <div className="md:col-span-5">
              <RoleForm
                userId={u.id}
                userName={u.name}
                role={toRole(u.role)}
                isSelf={u.id === admin.id}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
