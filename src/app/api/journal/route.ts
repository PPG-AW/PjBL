import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { journals } from "@/db/schema";
import { apiSession, err, ok, isStudent, fileToBase64 } from "@/lib/api";
import { TOTAL_DAYS } from "@/lib/sptldv";

export async function GET() {
  const session = await apiSession();
  if (!isStudent(session)) return err("Silakan masuk dulu.", 401);

  const rows = await db
    .select({
      id: journals.id,
      day: journals.day,
      activity: journals.activity,
      obstacle: journals.obstacle,
      fileName: journals.fileName,
      fileType: journals.fileType,
      createdAt: journals.createdAt,
      groupId: journals.groupId,
    })
    .from(journals)
    .where(eq(journals.studentId, session.student.id))
    .orderBy(desc(journals.day));

  return ok({ journals: rows, totalDays: TOTAL_DAYS });
}

export async function POST(req: Request) {
  const session = await apiSession();
  if (!isStudent(session)) return err("Silakan masuk dulu.", 401);
  if (!session.group) return err("Kamu belum tergabung dalam kelompok.", 403);

  const form = await req.formData();
  const day = parseInt(String(form.get("day") ?? ""), 10);
  const activity = String(form.get("activity") ?? "").trim();
  const obstacle = String(form.get("obstacle") ?? "").trim();
  const file = form.get("file");

  if (!Number.isInteger(day) || day < 1 || day > TOTAL_DAYS) {
    return err(`Hari harus antara 1 sampai ${TOTAL_DAYS}.`);
  }
  if (activity.length < 5) {
    return err("Ceritakan kegiatan hari ini sedikit lebih panjang ya.");
  }

  let stored: { name: string; type: string; data: string } | null = null;
  try {
    stored = await fileToBase64(file instanceof File ? file : null);
  } catch (e) {
    return err(e instanceof Error ? e.message : "File tidak bisa diproses.");
  }

  await db.insert(journals).values({
    studentId: session.student.id,
    groupId: session.group.id,
    day,
    activity,
    obstacle: obstacle || null,
    fileName: stored?.name ?? null,
    fileType: stored?.type ?? null,
    fileData: stored?.data ?? null,
  });

  return ok();
}
