"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

/** Remove one subscriber (e.g. on request by email). Admins only. */
export async function removeSubscriber(formData: FormData): Promise<void> {
  await requireAdmin("/admin/subscribers");
  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) return;
  await getDb().newsletterSubscriber.deleteMany({ where: { id: id.data } });
  refresh();
}
