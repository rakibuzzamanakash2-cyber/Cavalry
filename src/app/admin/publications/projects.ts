import "server-only";
import { getDb } from "@/lib/db";

/** Programmes a publication can be linked to (admin forms only). */
export async function getProjectOptions() {
  const rows = await getDb().project.findMany({
    orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
    select: { id: true, number: true, title: true, status: true },
  });
  return rows.map((p) => ({
    id: p.id,
    number: p.number,
    title: p.title,
    isPublic: p.status === "completed",
  }));
}
