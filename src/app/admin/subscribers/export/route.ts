import { getDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { site } from "@/lib/site";

// CSV of newsletter subscribers for sending updates from a mail service.
// Admins only; never cached.
export async function GET() {
  const user = await getCurrentUser();
  if (user?.role !== "admin") return new Response("Not allowed", { status: 403 });

  const rows = await getDb().newsletterSubscriber.findMany({
    select: { email: true, unsubscribeToken: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
  const escape = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  const csv = [
    "email,subscribed_at,unsubscribe_url",
    ...rows.map((r) =>
      [
        r.email,
        r.createdAt.toISOString(),
        `${site.url}/newsletter/unsubscribe?token=${r.unsubscribeToken}`,
      ]
        .map(escape)
        .join(","),
    ),
  ].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="cavalry-subscribers.csv"',
      "Cache-Control": "no-store",
    },
  });
}
