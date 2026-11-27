import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArticleSkeleton } from "@/components/article-skeleton";
import { AdminNav } from "@/components/admin-nav";
import { PageHeader } from "@/components/page-header";
import { getDb } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { PeopleFilter } from "@/components/people-filter";
import {
  TIERS,
  byTierThenName,
  cleanQuery,
  countTiers,
  matchesQuery,
  tierLabel,
  tierOf,
  toTierFilter,
} from "@/lib/people";
import { toRole } from "@/lib/roles";
import { tierBadge } from "@/lib/tier-badge";
import { requireAdmin } from "@/lib/session";
import { RoleForm } from "./role-form";

export const metadata: Metadata = {
  title: "Users and roles",
  robots: { index: false, follow: false },
};

// Depends on who is signed in; see the note in app/workspace/layout.tsx.
export const instant = false;

export default function AdminUsersPage({ searchParams }: PageProps<"/admin/users">) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
      <PageHeader eyebrow="Admin" title="Users and roles">
        Admins first, then project leaders, members and signed-in users. Search by name, email,
        username or ID. Changing someone&apos;s role signs them out so the change applies straight
        away.{" "}
        <Link href="/admin/applications" className="text-ink hover:text-accent underline">
          Review applications
        </Link>
      </PageHeader>
      <AdminNav current="/admin/users" />
      <Suspense fallback={<ArticleSkeleton />}>
        <UserTable searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function UserTable({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const admin = await requireAdmin();
  const params = await searchParams;
  const query = cleanQuery(params.q);
  const show = toTierFilter(params.show);

  const users = await getDb().user.findMany({
    select: {
      id: true,
      uid: true,
      username: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      ledProjects: { select: { number: true } },
      memberships: {
        where: { position: "co_leader" },
        select: { project: { select: { number: true } } },
      },
    },
  });

  const people = users
    .map((u) => {
      const role = toRole(u.role);
      const leads = u.ledProjects.map((p) => p.number);
      const coLeads = u.memberships.map((m) => m.project.number);
      return { ...u, role, leads, coLeads, tier: tierOf(role, leads.length + coLeads.length > 0) };
    })
    .filter((u) => matchesQuery(query, [u.name, u.email, u.username, u.uid]))
    .sort(byTierThenName);

  const counts = countTiers(people);
  const shown = show === "all" ? people : people.filter((u) => u.tier === show);

  return (
    <section aria-label="Users" className="space-y-6 py-8 sm:py-10">
      <PeopleFilter
        action="/admin/users"
        query={query}
        show={show}
        tiers={TIERS}
        counts={counts}
        total={people.length}
        placeholder="Name, email, username or ID"
      />
      {shown.length === 0 ? (
        <p className="text-muted">No one matches{query ? ` “${query}”` : ""}.</p>
      ) : (
        <ul className="border-line divide-line divide-y border-y" data-testid="user-list">
          {shown.map((u) => (
            <li key={u.id} className="grid gap-3 py-4 md:grid-cols-12 md:items-center md:gap-6">
              <div className="min-w-0 md:col-span-5">
                <p className="flex flex-wrap items-baseline gap-x-2">
                  <span className="font-medium">{u.name}</span>
                  <span className={tierBadge[u.tier]}>{tierLabel[u.tier]}</span>
                </p>
                <p className="text-muted truncate text-sm">{u.email}</p>
                <p className="text-muted font-mono text-xs">
                  {u.uid}
                  {u.username ? ` · @${u.username}` : ""}
                </p>
              </div>
              <p className="text-muted text-sm md:col-span-3">
                {u.leads.length > 0 ? (
                  <>
                    Leads {u.leads.map((n) => `Programme ${n}`).join(", ")}
                    <br />
                  </>
                ) : null}
                {u.coLeads.length > 0 ? (
                  <>
                    Co-leads {u.coLeads.map((n) => `Programme ${n}`).join(", ")}
                    <br />
                  </>
                ) : null}
                Joined {formatDate(u.createdAt.toISOString().slice(0, 10))}
              </p>
              <div className="md:col-span-4">
                <RoleForm
                  userId={u.id}
                  userName={u.name}
                  role={u.role}
                  isSelf={u.id === admin.id}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
