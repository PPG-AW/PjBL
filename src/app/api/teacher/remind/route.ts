import { db } from "@/db";
import { reminders, students } from "@/db/schema";
import { eq } from "drizzle-orm";
import { apiSession, err, ok } from "@/lib/api";

export async function POST(req: Request) {
  const session = await apiSession();
  if (!session || session.role !== "teacher") return err("Khusus guru.", 401);

  const body = await req.json().catch(() => null);
  const studentId = parseInt(String(body?.studentId ?? ""), 10);
  if (!Number.isInteger(studentId)) return err("Siswa tidak valid.");

  const stu = await db.select().from(students).where(eq(students.id, studentId)).limit(1);
  if (!stu[0]) return err("Siswa tidak ditemukan.", 404);

  const message =
    String(body?.message ?? "").trim() ||
    "Segera kejar progres proyekmu ya — cek dashboard PjBL dan lanjutkan tahapan yang belum selesai. Semangat!";

  await db.insert(reminders).values({ studentId, message });
  return ok();
}
