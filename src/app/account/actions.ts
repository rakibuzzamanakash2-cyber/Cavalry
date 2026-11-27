"use server";

import { refresh } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { getDb } from "@/lib/db";
import { normalizeUsername, usernameProblem } from "@/lib/identity";
import { requireUser } from "@/lib/session";

export type UsernameState = { ok: boolean; message: string } | null;

/** Set or clear the signed-in person's username. */
export async function setUsername(
  _prev: UsernameState,
  formData: FormData,
): Promise<UsernameState> {
  const user = await requireUser("/account");
  const username = normalizeUsername(String(formData.get("username") ?? ""));

  if (username === "") {
    await getDb().user.update({ where: { id: user.id }, data: { username: null } });
    refresh();
    return { ok: true, message: "Username removed. Sign in with your email or ID." };
  }

  const problem = usernameProblem(username);
  if (problem) return { ok: false, message: problem };
  if (username === user.username) return { ok: true, message: "That is already your username." };

  try {
    await getDb().user.update({ where: { id: user.id }, data: { username } });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { ok: false, message: "That username is taken. Try another." };
    }
    throw e;
  }
  refresh();
  return { ok: true, message: `Saved. You can now sign in as ${username}.` };
}
