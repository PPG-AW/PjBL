import { eq } from "drizzle-orm";
import { db } from "@/db";
import { groups, groupMembers, students } from "@/db/schema";
import { apiSession, err, ok, isStudent } from "@/lib/api";

export async function POST(req: Request) {
  const session = await apiSession();
  if (!isStudent(session)) return err("Silakan masuk dengan namamu dulu.", 401);

  const body = await req.json().catch(() => null);
  const pin = typeof body?.pin === "string" ? body.pin.trim() : "";
  if (!/^\d{4}$/.test(pin)) {
    return err("PIN kelompok berupa 4 digit angka.");
  }

  const found = await db.select().from(groups).where(eq(groups.pin, pin)).limit(1);
  const group = found[0];
  if (!group) {
    // Track failed attempts so teachers can spot brute-force guessing.
    const me = await db
      .select({ pinFails: students.pinFails })
      .from(students)
      .where(eq(students.id, session.student.id))
      .limit(1);
    const fails = (me[0]?.pinFails ?? 0) + 1;
    await db
      .update(students)
      .set({ pinFails: fails })
      .where(eq(students.id, session.student.id));
    const extra =
      fails >= 3
        ? " Sudah 3 kali salah — sebaiknya tanya langsung ke gurumu daripada menebak."
        : ` Percobaan salah ke-${fails} dari 3.`;
    return err("PIN tidak cocok dengan kelompok mana pun." + extra, 404);
  }

  const existing = await db
    .select()
    .from(groupMembers)
    .where(eq(groupMembers.studentId, session.student.id))
    .limit(1);

  if (existing[0]) {
    if (existing[0].groupId === group.id) {
      return ok({ groupName: group.name, already: true });
    }
    return err(
      "Kamu sudah tergabung di kelompok lain. Minta gurumu untuk memindahkanmu.",
      409
    );
  }

  await db.insert(groupMembers).values({
    groupId: group.id,
    studentId: session.student.id,
  });
  await db
    .update(students)
    .set({ pinFails: 0 })
    .where(eq(students.id, session.student.id));

  return ok({ groupName: group.name });
}
