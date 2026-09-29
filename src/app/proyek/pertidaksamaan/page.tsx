import Link from "next/link";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { Search, ClipboardList } from "lucide-react";
import { db } from "@/db";
import { interviews, inequalityAttempts, quizAttempts } from "@/db/schema";
import { getSession } from "@/lib/session";
import { StudentNav, SiteFooter, PageHeader, LockGate, BottomNav } from "@/components/chrome";
import InequalityLab, { type RecapRow } from "@/components/InequalityLab";

export const dynamic = "force-dynamic";

export default async function PertidaksamaanPage() {
  const session = await getSession();
  if (!session) redirect("/");
  if (session.role === "teacher") redirect("/guru/dashboard");
  const me = session.student!;

  const quizPassed = (
    await db.select({ p: quizAttempts.passed }).from(quizAttempts).where(eq(quizAttempts.studentId, me.id))
  ).some((a) => a.p);

  const locked = !session.group || !quizPassed;

  let interview = null;
  let attempts = 0;
  let solved = false;

  if (session.group) {
    const [iv, at] = await Promise.all([
      db.select().from(interviews).where(eq(interviews.groupId, session.group.id)).limit(1),
      db.select({ ok: inequalityAttempts.allCorrect }).from(inequalityAttempts).where(eq(inequalityAttempts.groupId, session.group.id)),
    ]);
    interview = iv[0] ?? null;
    attempts = at.length;
    solved = at.some((a) => a.ok);
  }

  const toMinutes = (v: number, u: string) => (u === "jam" ? v * 60 : v);

  let recap: RecapRow[] = [];
  let rows: { label: string; unit: string }[] = [];
  if (interview) {
    recap = [
      ...interview.ingredients.map((i) => ({
        name: i.name, unit: i.unit, perA: i.perA, perB: i.perB, total: i.total,
      })),
      {
        name: "Waktu produksi",
        unit: "menit",
        perA: toMinutes(interview.timePerA, interview.timePerAUnit),
        perB: toMinutes(interview.timePerB, interview.timePerBUnit),
        total: toMinutes(interview.totalTime, interview.totalTimeUnit),
      },
    ];
    rows = recap.map((r) => ({ label: r.name, unit: r.unit }));
  }

  return (
    <>
      <StudentNav name={me.name} groupName={session.group?.name ?? null} />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <PageHeader
          kicker="Fitur 6 · Fase Proyek"
          title={
            <>
              Susun <span className="italic text-amber">Pertidaksamaanmu</span>
            </>
          }
          desc="Tulis sendiri model matematika dari data wawancara kelompokmu. Sistem akan memberi petunjuk — bukan jawaban — sampai modelmu benar."
          icon={<Search className="size-4 text-amber" />}
        />

        {locked ? (
          <LockGate needPin={!session.group} quizPassed={quizPassed} />
        ) : !interview ? (
          <div className="card mx-auto max-w-lg p-8 text-center">
            <span className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-amber/10 text-amber">
              <ClipboardList className="size-6" />
            </span>
            <h2 className="font-display text-2xl font-medium">Isi data wawancara dulu</h2>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-cream-dim">
              Pertidaksamaanmu akan dicek berdasarkan data wawancara kelompokmu. Isi dulu
              di Fitur 5, lalu kembali ke sini.
            </p>
            <Link href="/proyek/wawancara" className="btn-primary mt-6">Ke Form Wawancara</Link>
          </div>
        ) : (
          <InequalityLab
            productA={interview.productA}
            productB={interview.productB}
            recap={recap}
            rows={rows}
            initialAttempts={attempts}
            initialSolved={solved}
          />
        )}

        <BottomNav member={!!session.group && quizPassed} />
      </main>
      <SiteFooter />
    </>
  );
}
