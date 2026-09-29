import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { progress } from "@/db/schema";
import { apiSession, err, ok, isStudent } from "@/lib/api";

const FEATURES = ["video", "modul", "grafik"] as const;

export async function POST(req: Request) {
  const session = await apiSession();
  if (!isStudent(session)) return err("Silakan masuk dulu.", 401);

  const body = await req.json().catch(() => null);
  const feature = body?.feature;
  if (!FEATURES.includes(feature)) return err("Fitur tidak dikenal.");

  const existing = await db
    .select()
    .from(progress)
    .where(
      and(eq(progress.studentId, session.student.id), eq(progress.feature, feature))
    )
    .limit(1);

  if (!existing[0]) {
    await db.insert(progress).values({ studentId: session.student.id, feature });
  }
  return ok();
}
