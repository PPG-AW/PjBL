import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  students,
  groups,
  groupMembers,
  progress,
  quizAttempts,
  interviews,
  inequalityAttempts,
  journals,
  portfolios,
  reflections,
  settings,
} from "@/db/schema";
import { apiSession, err, ok } from "@/lib/api";
import { TOTAL_DAYS } from "@/lib/sptldv";

export async function GET() {
  const session = await apiSession();
  if (!session || session.role !== "teacher") return err("Khusus guru.", 401);

  const [
    allStudents,
    allGroups,
    allMembers,
    allProgress,
    allQuiz,
    allInterviews,
    allIneq,
    allJournals,
    allPortfolios,
    allReflections,
    daySetting,
  ] = await Promise.all([
    db.select().from(students),
    db.select().from(groups),
    db.select().from(groupMembers),
    db.select().from(progress),
    db.select().from(quizAttempts),
    db.select().from(interviews),
    db.select().from(inequalityAttempts),
    db.select().from(journals),
    db
      .select({
        id: portfolios.id,
        groupId: portfolios.groupId,
        studentId: portfolios.studentId,
        category: portfolios.category,
        title: portfolios.title,
      })
      .from(portfolios),
    db.select({ id: reflections.id, studentId: reflections.studentId }).from(reflections),
    db.select().from(settings).where(eq(settings.key, "currentDay")).limit(1),
  ]);

  const currentDay = Math.min(
    TOTAL_DAYS,
    Math.max(1, parseInt(daySetting[0]?.value ?? "1", 10) || 1)
  );

  const memberByStudent = new Map(allMembers.map((m) => [m.studentId, m.groupId]));
  const memberIdsByGroup = new Map<number, number[]>();
  for (const m of allMembers) {
    const arr = memberIdsByGroup.get(m.groupId) ?? [];
    arr.push(m.studentId);
    memberIdsByGroup.set(m.groupId, arr);
  }

  const studentRows = allStudents.map((s) => {
    const feats = allProgress.filter((p) => p.studentId === s.id).map((p) => p.feature);
    const quiz = allQuiz.filter((q) => q.studentId === s.id);
    const bestQuiz = quiz.length ? Math.max(...quiz.map((q) => q.score)) : null;
    const j = allJournals.filter((jr) => jr.studentId === s.id);
    const ineq = allIneq.filter((a) => a.studentId === s.id);
    const hasActivity =
      feats.length > 0 || quiz.length > 0 || j.length > 0 || ineq.length > 0;
    return {
      id: s.id,
      name: s.name,
      groupId: memberByStudent.get(s.id) ?? null,
      lastSeenAt: s.lastSeenAt,
      video: feats.includes("video"),
      modul: feats.includes("modul"),
      grafik: feats.includes("grafik"),
      bestQuiz,
      quizAttempts: quiz.length,
      quizPassed: quiz.some((q) => q.passed),
      ineqAttempts: ineq.length,
      journalDays: j.map((x) => x.day).sort((a, b) => a - b),
      journalTotal: j.length,
      reflectionDone: allReflections.some((r) => r.studentId === s.id),
      hasActivity,
    };
  });

  const groupRows = allGroups
    .map((g) => {
      const memberIds = memberIdsByGroup.get(g.id) ?? [];
      const members = memberIds
        .map((id) => studentRows.find((s) => s.id === id))
        .filter(Boolean);
      const interviewDone = allInterviews.some((i) => i.groupId === g.id);
      const ineq = allIneq.filter((a) => a.groupId === g.id);
      const ineqSolved = ineq.some((a) => a.allCorrect);
      const portfolioCount = allPortfolios.filter((p) => p.groupId === g.id).length;

      let status: "kosong" | "lancar" | "perhatian" | "masalah" = "kosong";
      if (members.length > 0) {
        const anyZero = members.some((m) => !m!.hasActivity);
        const anyNotPassed = members.some((m) => !m!.quizPassed);
        const journalBehind = members.some((m) => m!.journalTotal < currentDay - 1);
        status = anyZero ? "masalah" : anyNotPassed || journalBehind ? "perhatian" : "lancar";
      }

      return {
        id: g.id,
        name: g.name,
        pin: g.pin,
        members,
        interviewDone,
        ineqAttempts: ineq.length,
        ineqSolved,
        portfolioCount,
        status,
      };
    })
    .sort((a, b) => a.id - b.id);

  const noGroup = studentRows.filter((s) => s.groupId === null);
  const warnings = studentRows
    .filter((s) => s.groupId !== null && !s.hasActivity)
    .map((s) => ({ studentId: s.id, name: s.name, kind: "pasif" as const }));

  return ok({
    students: studentRows.sort((a, b) => a.name.localeCompare(b.name)),
    groups: groupRows,
    noGroup,
    warnings,
    currentDay,
    totalDays: TOTAL_DAYS,
  });
}
