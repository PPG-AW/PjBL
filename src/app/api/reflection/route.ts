import { eq } from "drizzle-orm";
import { db } from "@/db";
import { reflections } from "@/db/schema";
import { apiSession, err, ok, isStudent } from "@/lib/api";

export async function GET() {
  const session = await apiSession();
  if (!isStudent(session)) return err("Silakan masuk dulu.", 401);

  const rows = await db
    .select()
    .from(reflections)
    .where(eq(reflections.studentId, session.student.id))
    .limit(1);

  return ok({ reflection: rows[0] ?? null });
}

export async function POST(req: Request) {
  const session = await apiSession();
  if (!isStudent(session)) return err("Silakan masuk dulu.", 401);
  if (!session.group) return err("Kamu belum tergabung dalam kelompok.", 403);

  const body = await req.json().catch(() => null);
  const answers = body?.answers;
  if (!answers || typeof answers !== "object") return err("Data tidak valid.");

  const required = ["q1", "q2", "q3"] as const;
  for (const key of required) {
    if (typeof answers[key] !== "string" || answers[key].trim().length < 10) {
      return err("Jawaban refleksi masih ada yang terlalu pendek (minimal 10 karakter).");
    }
  }
  const rating = Math.min(5, Math.max(1, parseInt(String(answers.rating ?? "3"), 10) || 3));

  const payload = {
    q1: String(answers.q1).trim(),
    q2: String(answers.q2).trim(),
    q3: String(answers.q3).trim(),
    rating,
  };

  const existing = await db
    .select({ id: reflections.id })
    .from(reflections)
    .where(eq(reflections.studentId, session.student.id))
    .limit(1);

  if (existing[0]) {
    await db.update(reflections).set({ answers: payload }).where(eq(reflections.id, existing[0].id));
  } else {
    await db.insert(reflections).values({ studentId: session.student.id, answers: payload });
  }

  return ok();
}
