import { redirect } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { Lightbulb } from "lucide-react";
import { db } from "@/db";
import { quizAttempts, reflections } from "@/db/schema";
import { getSession } from "@/lib/session";
import { StudentNav, SiteFooter, PageHeader, LockGate, BottomNav } from "@/components/chrome";
import ReflectionForm, { type ReflectionAnswers } from "@/components/ReflectionForm";

export const dynamic = "force-dynamic";

export default async function RefleksiPage() {
  const session = await getSession();
  if (!session) redirect("/");
  if (session.role === "teacher") redirect("/guru/dashboard");
  const me = session.student!;

  const quizPassed = (
    await db.select({ p: quizAttempts.passed }).from(quizAttempts).where(eq(quizAttempts.studentId, me.id))
  ).some((a) => a.p);

  const locked = !session.group || !quizPassed;

  let initial: ReflectionAnswers | null = null;
  let firstScore: number | null = null;
  let bestScore: number | null = null;

  if (!locked) {
    const [refl, attempts] = await Promise.all([
      db.select().from(reflections).where(eq(reflections.studentId, me.id)).limit(1),
      db.select().from(quizAttempts).where(eq(quizAttempts.studentId, me.id)).orderBy(asc(quizAttempts.createdAt)),
    ]);
    initial = (refl[0]?.answers as ReflectionAnswers | undefined) ?? null;
    firstScore = attempts[0]?.score ?? null;
    bestScore = attempts.length ? Math.max(...attempts.map((a) => a.score)) : null;
  }

  return (
    <>
      <StudentNav name={me.name} groupName={session.group?.name ?? null} />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <PageHeader
          kicker="Fitur 10 · Hasil Akhir"
          title={
            <>
              Refleksi <span className="italic text-amber">Belajar</span>
            </>
          }
          desc="Berhenti sejenak. Lihat perjalananmu dari kuis pertama sampai sekarang, lalu jawab dengan jujur — refleksi ini untukmu, bukan untuk nilai."
          icon={<Lightbulb className="size-4 text-amber" />}
        />

        {locked ? (
          <LockGate needPin={!session.group} quizPassed={quizPassed} />
        ) : (
          <ReflectionForm initial={initial} firstScore={firstScore} bestScore={bestScore} />
        )}

        <BottomNav member={!!session.group && quizPassed} />
      </main>
      <SiteFooter />
    </>
  );
}
