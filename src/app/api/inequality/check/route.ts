import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { interviews, inequalityAttempts } from "@/db/schema";
import { apiSession, err, ok, isStudent } from "@/lib/api";
import { checkLinearRow, parseNonNeg } from "@/lib/sptldv";

export async function POST(req: Request) {
  const session = await apiSession();
  if (!isStudent(session)) return err("Silakan masuk dulu.", 401);
  if (!session.group) return err("Kamu belum tergabung dalam kelompok.", 403);

  const iv = await db
    .select()
    .from(interviews)
    .where(eq(interviews.groupId, session.group.id))
    .limit(1);
  const interview = iv[0];
  if (!interview) {
    return err("Isi dulu data wawancara kelompokmu (Fitur 5) sebelum menyusun pertidaksamaan.");
  }

  const body = await req.json().catch(() => null);
  const rows: string[] = Array.isArray(body?.rows)
    ? body.rows.map((r: unknown) => String(r ?? ""))
    : [];
  const nonNegX = String(body?.nonNegX ?? "");
  const nonNegY = String(body?.nonNegY ?? "");

  // Build the answer key from interview data.
  const keys = interview.ingredients.map((ing) => ({
    key: { a: ing.perA, b: ing.perB, c: ing.total },
    ctx: {
      ingredient: ing.name,
      productA: interview.productA,
      productB: interview.productB,
      unit: ing.unit,
    },
  }));

  const toMinutes = (v: number, unit: string) => (unit === "jam" ? v * 60 : v);
  keys.push({
    key: {
      a: toMinutes(interview.timePerA, interview.timePerAUnit),
      b: toMinutes(interview.timePerB, interview.timePerBUnit),
      c: toMinutes(interview.totalTime, interview.totalTimeUnit),
    },
    ctx: {
      ingredient: "Waktu produksi",
      productA: interview.productA,
      productB: interview.productB,
      unit: "menit",
    },
  });

  const feedback = keys.map((k, i) => ({
    ...checkLinearRow(rows[i] ?? "", k.key, k.ctx),
    row: i,
  }));

  const nx = parseNonNeg(nonNegX, "x");
  const ny = parseNonNeg(nonNegY, "y");
  const nonNegMissing = nx === null || ny === null;
  const nonNegWrong = (nx === false) || (ny === false);
  const allRowsOk = feedback.every((f) => f.ok);
  const allCorrect = allRowsOk && !nonNegMissing && !nonNegWrong;

  const results = { feedback, nx, ny, nonNegMissing, nonNegWrong };
  await db.insert(inequalityAttempts).values({
    groupId: session.group.id,
    studentId: session.student.id,
    answers: [...rows, nonNegX, nonNegY],
    results,
    allCorrect,
  });

  const prev = await db
    .select()
    .from(inequalityAttempts)
    .where(eq(inequalityAttempts.groupId, session.group.id))
    .orderBy(desc(inequalityAttempts.createdAt));

  const response: Record<string, unknown> = {
    allCorrect,
    feedback,
    nonNeg: { nx, ny, missing: nonNegMissing, wrong: nonNegWrong },
    attemptNumber: prev.length,
  };

  if (allCorrect) {
    const profitA = interview.priceA - interview.costA;
    const profitB = interview.priceB - interview.costB;
    response.reward = {
      constraints: [
        ...interview.ingredients.map((i) => ({ a: i.perA, b: i.perB, c: i.total, label: i.name, unit: i.unit })),
        {
          a: toMinutes(interview.timePerA, interview.timePerAUnit),
          b: toMinutes(interview.timePerB, interview.timePerBUnit),
          c: toMinutes(interview.totalTime, interview.totalTimeUnit),
          label: "Waktu",
          unit: "menit",
        },
      ],
      objective: { a: profitA, b: profitB },
      productA: interview.productA,
      productB: interview.productB,
    };
  }

  return ok(response);
}
