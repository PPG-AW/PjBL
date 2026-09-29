import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { NotebookPen, Paperclip, CalendarDays, UserRound } from "lucide-react";
import { db } from "@/db";
import { journals, quizAttempts, settings } from "@/db/schema";
import { getSession } from "@/lib/session";
import { TOTAL_DAYS } from "@/lib/sptldv";
import { StudentNav, SiteFooter, PageHeader, LockGate, BottomNav } from "@/components/chrome";
import JournalForm from "@/components/JournalForm";

export const dynamic = "force-dynamic";

export default async function JurnalPage() {
  const session = await getSession();
  if (!session) redirect("/");
  if (session.role === "teacher") redirect("/guru/dashboard");
  const me = session.student!;

  const quizPassed = (
    await db.select({ p: quizAttempts.passed }).from(quizAttempts).where(eq(quizAttempts.studentId, me.id))
  ).some((a) => a.p);

  const locked = !session.group || !quizPassed;

  let entries: {
    id: number;
    day: number;
    activity: string;
    obstacle: string | null;
    fileName: string | null;
    createdAt: Date;
  }[] = [];

  const daySetting = await db.select().from(settings).where(eq(settings.key, "currentDay")).limit(1);
  const currentDay = Math.min(TOTAL_DAYS, Math.max(1, parseInt(daySetting[0]?.value ?? "1", 10) || 1));

  if (!locked) {
    entries = await db
      .select({
        id: journals.id,
        day: journals.day,
        activity: journals.activity,
        obstacle: journals.obstacle,
        fileName: journals.fileName,
        createdAt: journals.createdAt,
      })
      .from(journals)
      .where(eq(journals.studentId, me.id))
      .orderBy(desc(journals.day));
  }

  const filledDays = new Set(entries.map((e) => e.day));

  return (
    <>
      <StudentNav name={me.name} groupName={session.group?.name ?? null} />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <PageHeader
          kicker="Fitur 7 · Fase Proyek"
          title={
            <>
              Jurnal <span className="italic text-amber">Harian</span>
            </>
          }
          desc="Wajib diisi setiap hari oleh SETIAP anggota — bukan satu orang mewakili. Hari yang kosong tercatat “Tidak Ada Kemajuan” di dashboard guru."
          icon={<NotebookPen className="size-4 text-amber" />}
        />

        {locked ? (
          <LockGate needPin={!session.group} quizPassed={quizPassed} />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
            <div className="space-y-6">
              {/* Day strip */}
              <div className="card p-6">
                <p className="label-caps mb-4 flex items-center gap-2">
                  <CalendarDays className="size-3.5" /> Rekap Kehadiran Kerja (Hari ke-{currentDay} dari {TOTAL_DAYS})
                </p>
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1).map((d) => {
                    const filled = filledDays.has(d);
                    const past = d < currentDay;
                    return (
                      <div
                        key={d}
                        className={`flex flex-col items-center gap-1 rounded-xl border px-1 py-2.5 text-center ${
                          filled
                            ? "border-sage/50 bg-sage/10"
                            : past
                              ? "border-chili/40 bg-chili/10"
                              : d === currentDay
                                ? "border-amber/60 bg-amber/10"
                                : "border-line-soft bg-espresso/50"
                        }`}
                      title={filled ? "Sudah diisi" : past ? "Tidak ada kemajuan" : "Belum diisi"}
                      >
                        <span className="font-grotesk text-sm font-bold">{d}</span>
                        <span className={`h-1.5 w-1.5 rounded-full ${filled ? "bg-sage" : past ? "bg-chili" : "bg-cream-mute/40"}`} />
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 space-y-1.5 text-[11px] text-cream-mute">
                  <p><span className="mr-1.5 inline-block size-2 rounded-full bg-sage align-middle" /> Jurnal terisi</p>
                  <p><span className="mr-1.5 inline-block size-2 rounded-full bg-chili align-middle" /> Terlewat — “Tidak Ada Kemajuan”</p>
                  <p><span className="mr-1.5 inline-block size-2 rounded-full bg-cream-mute/40 align-middle" /> Belum berjalan</p>
                </div>
              </div>

              <JournalForm totalDays={TOTAL_DAYS} currentDay={currentDay} />
            </div>

            {/* Entries */}
            <div className="space-y-4">
              <p className="label-caps">Riwayat Jurnalmu ({entries.length})</p>
              {entries.length === 0 && (
                <div className="card p-8 text-center text-sm text-cream-mute">
                  Belum ada jurnal. Isi jurnal pertamamu hari ini!
                </div>
              )}
              {entries.map((e) => (
                <article key={e.id} className="card p-5">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="chip !border-amber/50 !text-amber">Hari ke-{e.day}</span>
                    <span className="font-grotesk text-[11px] text-cream-mute">
                      {new Date(e.createdAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-cream">{e.activity}</p>
                  {e.obstacle && (
                    <p className="mt-2 rounded-lg bg-chili/8 px-3 py-2 text-xs leading-relaxed text-cream-dim">
                      <span className="font-grotesk text-[10px] uppercase tracking-[0.18em] text-chili">Kendala · </span>
                      {e.obstacle}
                    </p>
                  )}
                  {e.fileName && (
                    <a
                      href={`/api/file/journal/${e.id}`}
                      target="_blank"
                      className="mt-3 inline-flex items-center gap-2 rounded-lg border border-line bg-espresso/60 px-3 py-2 font-grotesk text-xs text-teal transition-colors hover:border-teal/50"
                    >
                      <Paperclip className="size-3.5" /> {e.fileName}
                    </a>
                  )}
                  <p className="mt-3 flex items-center gap-1.5 text-[11px] text-cream-mute">
                    <UserRound className="size-3" /> {me.name} · {session.group!.name}
                  </p>
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
