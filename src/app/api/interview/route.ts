import { eq } from "drizzle-orm";
import { db } from "@/db";
import { interviews, type Ingredient } from "@/db/schema";
import { apiSession, err, ok, isStudent } from "@/lib/api";

export async function GET() {
  const session = await apiSession();
  if (!isStudent(session)) return err("Silakan masuk dulu.", 401);
  if (!session.group) return err("Kamu belum tergabung dalam kelompok.", 403);

  const rows = await db
    .select()
    .from(interviews)
    .where(eq(interviews.groupId, session.group.id))
    .limit(1);

  return ok({ interview: rows[0] ?? null });
}

const UNITS = ["gram", "kg", "butir", "ml", "liter", "sdm", "sdt", "buah", "lembar", "pack"];
const TIME_UNITS = ["menit", "jam"];

function num(v: unknown, fallback = 0): number {
  const n = typeof v === "number" ? v : parseFloat(String(v));
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

export async function PUT(req: Request) {
  const session = await apiSession();
  if (!isStudent(session)) return err("Silakan masuk dulu.", 401);
  if (!session.group) return err("Kamu belum tergabung dalam kelompok.", 403);

  const body = await req.json().catch(() => null);
  if (!body) return err("Data tidak valid.");

  const productA = String(body.productA ?? "").trim();
  const productB = String(body.productB ?? "").trim();
  if (productA.length < 2 || productB.length < 2) {
    return err("Nama kedua produk wajib diisi.");
  }

  const rawIngs = Array.isArray(body.ingredients) ? body.ingredients : [];
  const ingredients: Ingredient[] = [];
  for (const r of rawIngs) {
    const name = String(r?.name ?? "").trim();
    if (!name) continue;
    const unit = UNITS.includes(r?.unit) ? r.unit : "gram";
    ingredients.push({
      name,
      unit,
      perA: num(r?.perA),
      perB: num(r?.perB),
      total: num(r?.total),
    });
  }
  if (ingredients.length === 0) {
    return err("Minimal satu bahan baku harus diisi.");
  }
  if (ingredients.length > 12) {
    return err("Maksimal 12 bahan baku.");
  }

  const values = {
    productA,
    productB,
    ingredients,
    timePerA: num(body.timePerA),
    timePerAUnit: TIME_UNITS.includes(body.timePerAUnit) ? body.timePerAUnit : "menit",
    timePerB: num(body.timePerB),
    timePerBUnit: TIME_UNITS.includes(body.timePerBUnit) ? body.timePerBUnit : "menit",
    totalTime: num(body.totalTime),
    totalTimeUnit: TIME_UNITS.includes(body.totalTimeUnit) ? body.totalTimeUnit : "jam",
    priceA: Math.round(num(body.priceA)),
    costA: Math.round(num(body.costA)),
    priceB: Math.round(num(body.priceB)),
    costB: Math.round(num(body.costB)),
    updatedBy: session.student.name,
    updatedAt: new Date(),
  };

  const existing = await db
    .select({ id: interviews.id })
    .from(interviews)
    .where(eq(interviews.groupId, session.group.id))
    .limit(1);

  if (existing[0]) {
    await db.update(interviews).set(values).where(eq(interviews.id, existing[0].id));
  } else {
    await db.insert(interviews).values({ ...values, groupId: session.group.id });
  }

  return ok();
}
