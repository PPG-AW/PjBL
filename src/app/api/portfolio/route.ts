import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { portfolios, students } from "@/db/schema";
import { apiSession, err, ok, isStudent, fileToBase64 } from "@/lib/api";

export const CATEGORIES = [
  "Laporan Tertulis",
  "Infografis",
  "Presentasi",
  "Video",
  "Booklet",
  "Lainnya",
] as const;

export async function GET() {
  const session = await apiSession();
  if (!isStudent(session)) return err("Silakan masuk dulu.", 401);
  if (!session.group) return err("Kamu belum tergabung dalam kelompok.", 403);

  const rows = await db
    .select({
      id: portfolios.id,
      category: portfolios.category,
      title: portfolios.title,
      description: portfolios.description,
      fileName: portfolios.fileName,
      fileType: portfolios.fileType,
      createdAt: portfolios.createdAt,
      studentName: students.name,
    })
    .from(portfolios)
    .innerJoin(students, eq(portfolios.studentId, students.id))
    .where(eq(portfolios.groupId, session.group.id))
    .orderBy(desc(portfolios.createdAt));

  return ok({ portfolios: rows });
}

export async function POST(req: Request) {
  const session = await apiSession();
  if (!isStudent(session)) return err("Silakan masuk dulu.", 401);
  if (!session.group) return err("Kamu belum tergabung dalam kelompok.", 403);

  const form = await req.formData();
  const category = String(form.get("category") ?? "").trim();
  const title = String(form.get("title") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();
  const file = form.get("file");

  if (!CATEGORIES.includes(category as (typeof CATEGORIES)[number])) {
    return err("Pilih jenis portofolio yang valid.");
  }
  if (title.length < 3) {
    return err("Judul portofolio terlalu pendek.");
  }

  let stored: { name: string; type: string; data: string } | null = null;
  try {
    stored = await fileToBase64(file instanceof File ? file : null);
  } catch (e) {
    return err(e instanceof Error ? e.message : "File tidak bisa diproses.");
  }
  if (!stored) {
    return err("Lampirkan file hasil akhir kelompokmu ya.");
  }

  await db.insert(portfolios).values({
    groupId: session.group.id,
    studentId: session.student.id,
    category,
    title,
    description: description || null,
    fileName: stored.name,
    fileType: stored.type,
    fileData: stored.data,
  });

  return ok();
}
