import { eq } from "drizzle-orm";
import { db } from "@/db";
import { journals, portfolios } from "@/db/schema";
import { apiSession } from "@/lib/api";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ kind: string; id: string }> }
) {
  const session = await apiSession();
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { kind, id } = await params;
  const numId = parseInt(id, 10);
  if (!Number.isInteger(numId)) return new Response("Not found", { status: 404 });

  let row: { fileName: string | null; fileType: string | null; fileData: string | null } | undefined;
  if (kind === "journal") {
    row = (await db.select().from(journals).where(eq(journals.id, numId)).limit(1))[0];
  } else if (kind === "portfolio") {
    row = (await db.select().from(portfolios).where(eq(portfolios.id, numId)).limit(1))[0];
  }

  if (!row?.fileData) return new Response("Not found", { status: 404 });

  const buffer = Buffer.from(row.fileData, "base64");
  return new Response(buffer, {
    headers: {
      "Content-Type": row.fileType || "application/octet-stream",
      "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(row.fileName || "file")}`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
