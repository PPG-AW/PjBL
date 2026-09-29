import { NextResponse } from "next/server";
import { getSession, type SessionInfo } from "@/lib/session";

export function err(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export function ok(data: Record<string, unknown> = {}) {
  return NextResponse.json({ ok: true, ...data });
}

export type StudentSession = SessionInfo & {
  role: "student";
  student: { id: number; name: string };
};

export async function apiSession(): Promise<SessionInfo | null> {
  return getSession();
}

export function isStudent(s: SessionInfo | null): s is StudentSession {
  return !!s && s.role === "student" && !!s.student;
}

export function genPin(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export const MAX_FILE_BYTES = 3 * 1024 * 1024; // 3 MB

export async function fileToBase64(
  file: File | null
): Promise<{ name: string; type: string; data: string } | null> {
  if (!file || file.size === 0) return null;
  if (file.size > MAX_FILE_BYTES) {
    throw new Error("Ukuran file melebihi 3 MB. Kompres dulu ya.");
  }
  const buf = Buffer.from(await file.arrayBuffer());
  return {
    name: file.name,
    type: file.type || "application/octet-stream",
    data: buf.toString("base64"),
  };
}
