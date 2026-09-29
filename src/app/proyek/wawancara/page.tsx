import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { Mic, Info } from "lucide-react";
import { db } from "@/db";
import { interviews, quizAttempts } from "@/db/schema";
import { getSession } from "@/lib/session";
import { StudentNav, SiteFooter, PageHeader, LockGate, BottomNav } from "@/components/chrome";
import InterviewForm from "@/components/InterviewForm";

export const dynamic = "force-dynamic";

export default async function WawancaraPage() {
  const session = await getSession();
  if (!session) redirect("/");
  if (session.role === "teacher") redirect("/guru/dashboard");
  const me = session.student!;

  const quizPassed = (
    await db.select({ passed: quizAttempts.passed }).from(quizAttempts).where(eq(quizAttempts.studentId, me.id))
  ).some((a) => a.passed);

  let interview = null;
  if (session.group) {
    const rows = await db.select().from(interviews).where(eq(interviews.groupId, session.group.id)).limit(1);
    interview = rows[0] ?? null;
  }

  return (
    <>
      <StudentNav name={me.name} groupName={session.group?.name ?? null} />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <PageHeader
          kicker="Fitur 5 · Fase Proyek"
          title={
            <>
              Data <span className="italic text-amber">Wawancara</span> Dapur
            </>
          }
          desc="Setelah mewawancarai pengelola dapur/kantin, catat datanya di sini. Form ini fleksibel — nama produk dan bahan mengikuti temuan kelompokmu di lapangan."
          icon={<Mic className="size-4 text-amber" />}
        />

        {!session.group || !quizPassed ? (
          <LockGate needPin={!session.group} quizPassed={quizPassed} />
        ) : (
          <>
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-teal/30 bg-teal/5 px-5 py-4">
              <Info className="mt-0.5 size-4 shrink-0 text-teal" />
              <p className="text-sm leading-relaxed text-cream-dim">
                Data ini tersimpan untuk <strong className="text-cream">{session.group.name}</strong> dan
                otomatis menjadi <strong className="text-teal">kunci pengecekan</strong> saat kamu menyusun
                pertidaksamaan di Fitur 6. Pastikan angkanya sesuai hasil wawancara asli, ya.
              </p>
            </div>
            <InterviewForm initial={interview} />
          </>
        )}

        <BottomNav member={!!session.group && quizPassed} />
      </main>
      <SiteFooter />
    </>
  );
}
