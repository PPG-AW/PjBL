import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { FolderUp, Download, UserRound } from "lucide-react";
import { db } from "@/db";
import { portfolios, students, quizAttempts } from "@/db/schema";
import { getSession } from "@/lib/session";
import { StudentNav, SiteFooter, PageHeader, LockGate, BottomNav } from "@/components/chrome";
import PortfolioForm from "@/components/PortfolioForm";

export const dynamic = "force-dynamic";

const CAT_COLORS: Record<string, string> = {
  "Laporan Tertulis": "!border-amber/50 !text-amber",
  Infografis: "!border-teal/50 !text-teal",
  Presentasi: "!border-sage/50 !text-sage",
  Video: "!border-chili/50 !text-chili",
  Booklet: "!border-amber-hi/50 !text-amber-hi",
  Lainnya: "",
};

export default async function PortofolioPage() {
  const session = await getSession();
  if (!session) redirect("/");
  if (session.role === "teacher") redirect("/guru/dashboard");
  const me = session.student!;

  const quizPassed = (
    await db.select({ p: quizAttempts.passed }).from(quizAttempts).where(eq(quizAttempts.studentId, me.id))
  ).some((a) => a.p);

  const locked = !session.group || !quizPassed;

  let items: {
    id: number;
    category: string;
    title: string;
    description: string | null;
    fileName: string | null;
    createdAt: Date;
    studentName: string;
  }[] = [];

  if (!locked) {
    items = await db
      .select({
        id: portfolios.id,
        category: portfolios.category,
        title: portfolios.title,
        description: portfolios.description,
        fileName: portfolios.fileName,
        createdAt: portfolios.createdAt,
        studentName: students.name,
      })
      .from(portfolios)
      .innerJoin(students, eq(portfolios.studentId, students.id))
      .where(eq(portfolios.groupId, session.group!.id))
      .orderBy(desc(portfolios.createdAt));
  }

  return (
    <>
      <StudentNav name={me.name} groupName={session.group?.name ?? null} />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <PageHeader
          kicker="Fitur 9 · Hasil Akhir"
          title={
            <>
              Portofolio <span className="italic text-amber">Kelompok</span>
            </>
          }
          desc="Pilih sendiri bentuk hasil akhirmu: laporan, infografis, presentasi, video, booklet, atau apa pun yang paling mewakili kerja kelompokmu."
          icon={<FolderUp className="size-4 text-amber" />}
        />

        {locked ? (
          <LockGate needPin={!session.group} quizPassed={quizPassed} />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
            <PortfolioForm />
            <div className="space-y-4">
              <p className="label-caps">Karya {session.group!.name} ({items.length})</p>
              {items.length === 0 && (
                <div className="card p-8 text-center text-sm text-cream-mute">
                  Belum ada karya terunggah. Jadilah yang pertama mengunggah!
                </div>
              )}
              {items.map((p) => (
                <article key={p.id} className="card group p-5 transition-colors hover:border-amber/40">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className={`chip ${CAT_COLORS[p.category] ?? ""}`}>{p.category}</span>
                    <span className="font-grotesk text-[11px] text-cream-mute">
                      {new Date(p.createdAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-medium">{p.title}</h3>
                  {p.description && (
                    <p className="mt-1.5 text-sm leading-relaxed text-cream-dim">{p.description}</p>
                  )}
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <p className="flex items-center gap-1.5 text-[11px] text-cream-mute">
                      <UserRound className="size-3" /> diunggah oleh {p.studentName}
                    </p>
                    {p.fileName && (
                      <a
                        href={`/api/file/portfolio/${p.id}`}
                        target="_blank"
                        className="inline-flex items-center gap-2 rounded-lg border border-line bg-espresso/60 px-3 py-2 font-grotesk text-xs text-teal transition-colors hover:border-teal/50"
                      >
                        <Download className="size-3.5" /> {p.fileName}
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        <BottomNav member={!!session.group && quizPassed} />
      </main>
      <SiteFooter />
    </>
  );
}
