import { createSessionToken, TEACHER_CODE } from "@/lib/session";
import { err, ok } from "@/lib/api";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const code = typeof body?.code === "string" ? body.code.trim() : "";
  if (!code || code !== TEACHER_CODE) {
    return err("Kode guru salah. Coba lagi.", 401);
  }
  await createSessionToken("teacher");
  return ok();
}
