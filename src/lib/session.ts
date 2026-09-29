import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { sessions, students, groupMembers, groups } from "@/db/schema";

export const SESSION_COOKIE = "pjbl_session";

export type SessionInfo = {
  role: "student" | "teacher";
  student: { id: number; name: string } | null;
  group: { id: number; name: string; pin: string } | null;
};

export async function createSessionToken(
  role: "student" | "teacher",
  studentId?: number
) {
  const token = randomBytes(24).toString("hex");
  await db.insert(sessions).values({ token, role, studentId: studentId ?? null });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return token;
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.delete(sessions).where(eq(sessions.token, token));
  }
  jar.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionInfo | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const rows = await db
    .select()
    .from(sessions)
    .where(eq(sessions.token, token))
    .limit(1);
  const sess = rows[0];
  if (!sess) return null;

  if (sess.role === "teacher") {
    return { role: "teacher", student: null, group: null };
  }
  if (!sess.studentId) return null;

  const stu = await db
    .select()
    .from(students)
    .where(eq(students.id, sess.studentId))
    .limit(1);
  const student = stu[0];
  if (!student) return null;

  await db
    .update(students)
    .set({ lastSeenAt: new Date() })
    .where(eq(students.id, student.id));

  let group: SessionInfo["group"] = null;
  const mem = await db
    .select({
      groupId: groups.id,
      groupName: groups.name,
      pin: groups.pin,
    })
    .from(groupMembers)
    .innerJoin(groups, eq(groupMembers.groupId, groups.id))
    .where(eq(groupMembers.studentId, student.id))
    .limit(1);
  if (mem[0]) {
    group = { id: mem[0].groupId, name: mem[0].groupName, pin: mem[0].pin };
  }

  return {
    role: "student",
    student: { id: student.id, name: student.name },
    group,
  };
}

export const TEACHER_CODE = process.env.TEACHER_CODE ?? "GURU1234";
