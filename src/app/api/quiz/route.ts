import { db } from "@/db";
import { quizAttempts } from "@/db/schema";
import { apiSession, err, ok, isStudent } from "@/lib/api";
import { QUIZ, PASSING_SCORE } from "@/lib/sptldv";

export async function POST(req: Request) {
  const session = await apiSession();
  if (!isStudent(session)) return err("Silakan masuk dulu.", 401);

  const body = await req.json().catch(() => null);
  const answers = body?.answers;
  if (!Array.isArray(answers) || answers.length !== QUIZ.length) {
    return err("Jawaban belum lengkap.");
  }

  let correct = 0;
  const detail = QUIZ.map((q, i) => {
    const isRight = answers[i] === q.correct;
    if (isRight) correct++;
    return { chosen: answers[i], correct: q.correct, isRight };
  });

  const score = Math.round((correct / QUIZ.length) * 100);
  const passed = score >= PASSING_SCORE;

  await db.insert(quizAttempts).values({
    studentId: session.student.id,
    score,
    passed,
    answers: detail,
  });

  return ok({ score, passed, correct, total: QUIZ.length, detail });
}
