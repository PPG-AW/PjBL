import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { interviews, inequalityAttempts } from "@/db/schema";
import { apiSession, err, ok, isStudent } from "@/lib/api";

export async function GET() {
  const session = await apiSession();
  if (!isStudent(session)) return err("Silakan masuk dulu.", 401);
  if (!session.group) return err("Kamu belum tergabung dalam kelompok.", 403);

  const iv = await db
    .select()
    .from(interviews)
    .where(eq(interviews.groupId, session.group.id))
    .limit(1);

  const attempts = await db
    .select()
    .from(inequalityAttempts)
    .where(eq(inequalityAttempts.groupId, session.group.id))
    .orderBy(desc(inequalityAttempts.createdAt));

  const interview = iv[0];
  return ok({
    hasInterview: !!interview,
    productA: interview?.productA ?? null,
    productB: interview?.productB ?? null,
    rows: interview
      ? [
          ...interview.ingredients.map((i) => ({ label: i.name, unit: i.unit })),
          { label: "Waktu produksi", unit: "menit" },
        ]
      : [],
    attempts: attempts.length,
    solved: attempts.some((a) => a.allCorrect),
    recent: attempts.slice(0, 5).map((a) => ({
      id: a.id,
      allCorrect: a.allCorrect,
      by: null as null,
      createdAt: a.createdAt,
    })),
  });
}
