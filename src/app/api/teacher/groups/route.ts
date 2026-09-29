import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  students,
  groups,
  groupMembers,
  interviews,
  portfolios,
  settings,
} from "@/db/schema";
import { apiSession, err, ok } from "@/lib/api";
import { TOTAL_DAYS } from "@/lib/sptldv";

async function uniquePin(): Promise<string> {
  for (let i = 0; i < 25; i++) {
    const pin = String(Math.floor(1000 + Math.random() * 9000));
    const clash = await db.select().from(groups).where(eq(groups.pin, pin)).limit(1);
    if (!clash[0]) return pin;
  }
  return String(Math.floor(1000 + Math.random() * 9000));
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function POST(req: Request) {
  const session = await apiSession();
  if (!session || session.role !== "teacher") return err("Khusus guru.", 401);

  const body = await req.json().catch(() => null);
  const action = body?.action;

  /* ----------------------------- Randomize ----------------------------- */
  if (action === "randomize") {
    const size = Math.min(6, Math.max(3, parseInt(String(body?.size ?? "4"), 10) || 4));
    const allStudents = await db.select().from(students);
    if (allStudents.length === 0) return err("Belum ada siswa yang login.");

    await db.delete(groupMembers);
    const shuffled = shuffle(allStudents);
    const needed = Math.max(1, Math.ceil(shuffled.length / size));

    let allGroups = await db.select().from(groups);
    while (allGroups.length < needed) {
      const pin = await uniquePin();
      const created = await db
        .insert(groups)
        .values({ name: `Kelompok ${allGroups.length + 1}`, pin })
        .returning();
      allGroups = [...allGroups, created[0]];
    }

    const use = allGroups.slice(0, needed);
    const rows = shuffled.map((s, i) => ({
      groupId: use[Math.floor(i / size)].id,
      studentId: s.id,
    }));
    if (rows.length) await db.insert(groupMembers).values(rows);

    // Remove unused empty groups that hold no project data.
    const unused = allGroups.slice(needed);
    for (const g of unused) {
      const hasInterview = await db
        .select({ id: interviews.id })
        .from(interviews)
        .where(eq(interviews.groupId, g.id))
        .limit(1);
      const hasPortfolio = await db
        .select({ id: portfolios.id })
        .from(portfolios)
        .where(eq(portfolios.groupId, g.id))
        .limit(1);
      if (!hasInterview[0] && !hasPortfolio[0]) {
        await db.delete(groups).where(eq(groups.id, g.id));
      }
    }

    return ok({ count: needed });
  }

  /* ------------------------------- Create ------------------------------- */
  if (action === "create") {
    const allGroups = await db.select().from(groups);
    const name = String(body?.name ?? "").trim() || `Kelompok ${allGroups.length + 1}`;
    const pin = await uniquePin();
    const created = await db.insert(groups).values({ name, pin }).returning();
    return ok({ group: created[0] });
  }

  /* ------------------------------- Assign ------------------------------- */
  if (action === "assign") {
    const studentId = parseInt(String(body?.studentId ?? ""), 10);
    const groupId = body?.groupId === null ? null : parseInt(String(body?.groupId ?? ""), 10);
    if (!Number.isInteger(studentId)) return err("Siswa tidak valid.");
    await db.delete(groupMembers).where(eq(groupMembers.studentId, studentId));
    if (groupId !== null) {
      if (!Number.isInteger(groupId)) return err("Kelompok tidak valid.");
      await db.insert(groupMembers).values({ studentId, groupId });
    }
    return ok();
  }

  /* ------------------------------ Reset PIN ----------------------------- */
  if (action === "resetPin") {
    const groupId = parseInt(String(body?.groupId ?? ""), 10);
    if (!Number.isInteger(groupId)) return err("Kelompok tidak valid.");
    const pin = await uniquePin();
    await db.update(groups).set({ pin }).where(eq(groups.id, groupId));
    return ok({ pin });
  }

  /* ---------------------------- Rename group ---------------------------- */
  if (action === "rename") {
    const groupId = parseInt(String(body?.groupId ?? ""), 10);
    const name = String(body?.name ?? "").trim();
    if (!Number.isInteger(groupId) || name.length < 2) return err("Data tidak valid.");
    await db.update(groups).set({ name }).where(eq(groups.id, groupId));
    return ok();
  }

  /* ------------------------------ Set day ------------------------------- */
  if (action === "setDay") {
    const day = Math.min(TOTAL_DAYS, Math.max(1, parseInt(String(body?.day ?? "1"), 10) || 1));
    const existing = await db.select().from(settings).where(eq(settings.key, "currentDay")).limit(1);
    if (existing[0]) {
      await db.update(settings).set({ value: String(day) }).where(eq(settings.key, "currentDay"));
    } else {
      await db.insert(settings).values({ key: "currentDay", value: String(day) });
    }
    return ok({ day });
  }

  /* ---------------------------- Delete empty ---------------------------- */
  if (action === "delete") {
    const groupId = parseInt(String(body?.groupId ?? ""), 10);
    if (!Number.isInteger(groupId)) return err("Kelompok tidak valid.");
    const mem = await db.select().from(groupMembers).where(eq(groupMembers.groupId, groupId)).limit(1);
    if (mem[0]) return err("Kelompok masih berisi anggota. Kosongkan dulu.");
    const iv = await db.select({ id: interviews.id }).from(interviews).where(eq(interviews.groupId, groupId)).limit(1);
    const pf = await db.select({ id: portfolios.id }).from(portfolios).where(eq(portfolios.groupId, groupId)).limit(1);
    if (iv[0] || pf[0]) return err("Kelompok punya data proyek tersimpan, tidak bisa dihapus.");
    await db.delete(groups).where(eq(groups.id, groupId));
    return ok();
  }

  return err("Aksi tidak dikenal.");
}

export async function GET() {
  const session = await apiSession();
  if (!session || session.role !== "teacher") return err("Khusus guru.", 401);
  const gs = await db.select().from(groups);
  return ok({ groups: gs });
}
