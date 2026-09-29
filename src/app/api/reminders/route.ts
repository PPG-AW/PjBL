import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { reminders } from "@/db/schema";
import { apiSession, err, ok, isStudent } from "@/lib/api";

export async function GET() {
  const session = await apiSession();
  if (!isStudent(session)) return err("Silakan masuk dulu.", 401);

  const rows = await db
    .select()
    .from(reminders)
    .where(and(eq(reminders.studentId, session.student.id), eq(reminders.read, false)))
    .orderBy(desc(reminders.createdAt));

  return ok({ reminders: rows });
}

export async function POST(req: Request) {
  const session = await apiSession();
  if (!isStudent(session)) return err("Silakan masuk dulu.", 401);

  const body = await req.json().catch(() => null);
  const ids: number[] = Array.isArray(body?.ids) ? body.ids.map(Number).filter(Number.isInteger) : [];
  if (!ids.length) return ok();

  await db
    .update(reminders)
    .set({ read: true })
    .where(and(eq(reminders.studentId, session.student.id), inArray(reminders.id, ids)));

  return ok();
}
