import { sql } from "drizzle-orm";
import { db } from "@/db";
import { students } from "@/db/schema";
import { createSessionToken } from "@/lib/session";
import { err, ok } from "@/lib/api";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const raw = typeof body?.name === "string" ? body.name : "";
  const name = raw.trim().replace(/\s+/g, " ");

  if (name.length < 3) {
    return err("Tulis nama lengkapmu sesuai absen kelas (minimal 3 huruf).");
  }
  if (name.length > 80) {
    return err("Nama terlalu panjang.");
  }

  const existing = await db
    .select()
    .from(students)
    .where(sql`lower(${students.name}) = ${name.toLowerCase()}`)
    .limit(1);

  let student = existing[0];
  if (!student) {
    const inserted = await db
      .insert(students)
      .values({ name })
      .returning();
    student = inserted[0];
  }

  await createSessionToken("student", student.id);

  return ok({ name: student.name });
}
