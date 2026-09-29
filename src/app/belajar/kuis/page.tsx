import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { ClipboardList } from "lucide-react";
import { db } from "@/db";
import { quizAttempts } from "@/db/schema";
import { getSession } from "@/lib/session";
import { QUIZ, PASSING_SCORE } from "@/lib/sptldv";
import { StudentNav, SiteFooter, PageHeader, BottomNav } from "@/components/chrome";
import QuizRunner from "@/components/QuizRunner";

export const dynamic = "force-dynamic";

export default async function KuisPage() {
  const session = await getSession();
  if (!session) redirect("/");
  if (session.role === "teacher") redirect("/guru/dashboard");
  const me = session.student!;

  const attempts = await db
    .select()
    .from(quizAttempts)
    .where(eq(quizAttempts.studentId, me.id))
    .orderBy(desc(quizAttempts.createdAt));

  const bestScore = attempts.length ? Math.max(...attempts.map((a) => a.score)) : null;
  const alreadyPassed = attempts.some((a) => a.passed);

  // Strip answer keys before sending to the client bundle.
  const publicQuestions = QUIZ.map(({ q, context, options }) => ({ q, context, options }));

  return (
    <>
      <StudentNav name={me.name} groupName={session.group?.name ?? null} />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <PageHeader
          kicker="Fitur 4 · Fase Belajar"
          title={
            <>
              Kuis <span className="italic text-amber">Konsep</span>
            </>
          }
          desc={`Buktikan kamu paham materinya. Nilai ≥ ${PASSING_SCORE} membuka gerbang fase proyek. Boleh dicoba berkali-kali — nilai terbaik yang tercatat.`}
          icon={<ClipboardList className="size-4 text-amber" />}
        />

        <QuizRunner
          questions={publicQuestions}
          passing={PASSING_SCORE}
          bestScore={bestScore}
          alreadyPassed={alreadyPassed}
        />

        <BottomNav member={!!session.group} />
      </main>
      <SiteFooter />
    </>
  );
}
