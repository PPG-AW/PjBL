import Link from "next/link";
import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import {
  Play,
  BookOpen,
  ChartLine,
  ClipboardList,
  Mic,
  Search,
  NotebookPen,
  FolderUp,
  Lightbulb,
  Lock,
  CheckCircle2,
  ArrowRight,
  Users,
  KeyRound,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { db } from "@/db";
import {
  progress,
  quizAttempts,
  journals,
  portfolios,
  reflections,
  interviews,
  inequalityAttempts,
  groupMembers,
  students,
  settings,
} from "@/db/schema";
import { getSession } from "@/lib/session";
import { PASSING_SCORE, TOTAL_DAYS } from "@/lib/sptldv";
import { StudentNav, SiteFooter, BottomNav } from "@/components/chrome";
import { PinForm, RemindersBanner } from "@/components/client-bits";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/");
  if (session.role === "teacher") redirect("/guru/dashboard");
  const me = session.student!;

  const [
    progRows,
    quizRows,
    journalRows,
    reflRows,
    daySetting,
  ] = await Promise.all([
    db.select().from(progress).where(eq(progress.studentId, me.id)),
    db
      .select()
      .from(quizAttempts)
      .where(eq(quizAttempts.studentId, me.id))
      .orderBy(desc(quizAttempts.createdAt)),
    db.select({ id: journals.id, day: journals.day }).from(journals).where(eq(journals.studentId, me.id)),
    db.select({ id: reflections.id }).from(reflections).where(eq(reflections.studentId, me.id)),
    db.select().from(settings).where(eq(settings.key, "currentDay")).limit(1),
  ]);

  const currentDay = Math.min(TOTAL_DAYS, Math.max(1, parseInt(daySetting[0]?.value ?? "1", 10) || 1));

  const feats = new Set(progRows.map((p) => p.feature));
  const bestQuiz = quizRows.length ? Math.max(...quizRows.map((q) => q.score)) : null;
  const quizPassed = quizRows.some((q) => q.passed);
  const isMember = !!session.group;

  let interviewDone = false;
  let ineqSolved = false;
  let ineqCount = 0;
  let portfolioCount = 0;
  let members: { id: number; name: string }[] = [];

  if (session.group) {
    const gid = session.group.id;
    const [iv, ineq, pf, mem] = await Promise.all([
      db.select({ id: interviews.id }).from(interviews).where(eq(interviews.groupId, gid)).limit(1),
      db.select({ allCorrect: inequalityAttempts.allCorrect }).from(inequalityAttempts).where(eq(inequalityAttempts.groupId, gid)),
      db.select({ id: portfolios.id }).from(portfolios).where(eq(portfolios.groupId, gid)),
      db
        .select({ id: students.id, name: students.name })
        .from(groupMembers)
        .innerJoin(students, eq(groupMembers.studentId, students.id))
        .where(eq(groupMembers.groupId, gid)),
    ]);
    interviewDone = iv.length > 0;
    ineqSolved = ineq.some((a) => a.allCorrect);
    ineqCount = ineq.length;
    portfolioCount = pf.length;
    members = mem;
  }

  const steps = [
    { done: feats.has("video") },
    { done: feats.has("modul") },
    { done: feats.has("grafik") },
    { done: quizPassed },
    { done: isMember && interviewDone },
    { done: isMember && ineqSolved },
    { done: isMember && journalRows.length > 0 },
    { done: isMember && portfolioCount > 0 },
    { done: isMember && reflRows.length > 0 },
  ];
  const pct = Math.round((steps.filter((s) => s.done).length / steps.length) * 100);

  const learnCards = [
    {
      href: "/belajar/video", icon: Play, n: "1", title: "Video & Cerita Masalah",
      desc: "Kenali masalah kantin Tata Boga yang akan kamu pecahkan.",
      done: feats.has("video"), status: feats.has("video") ? "Selesai" : "Belum dibuka",
    },
    {
      href: "/belajar/modul", icon: BookOpen, n: "2", title: "Modul Materi SPtLDV",
      desc: "Buku digital interaktif dengan contoh bertema kuliner.",
      done: feats.has("modul"), status: feats.has("modul") ? "Selesai" : "Belum dibuka",
    },
    {
      href: "/belajar/grafik", icon: ChartLine, n: "3", title: "Grafik Interaktif",
      desc: "Geser stok bahan dan lihat daerah penyelesaian berubah.",
      done: feats.has("grafik"), status: feats.has("grafik") ? "Selesai" : "Belum dicoba",
    },
    {
      href: "/belajar/kuis", icon: ClipboardList, n: "4", title: "Kuis Konsep",
      desc: `10 soal pilihan ganda. Lulus dengan nilai ≥ ${PASSING_SCORE}.`,
      done: quizPassed,
      status: quizPassed ? `Lulus · ${bestQuiz}` : bestQuiz !== null ? `Terbaik: ${bestQuiz}` : "Belum dikerjakan",
    },
  ];

  const projectCards = [
    {
      href: "/proyek/wawancara", icon: Mic, n: "5", title: "Form Wawancara",
      desc: "Input data produk & bahan hasil wawancara dengan dapur.",
      done: interviewDone, status: interviewDone ? "Data tersimpan" : "Belum diisi",
    },
    {
      href: "/proyek/pertidaksamaan", icon: Search, n: "6", title: "Susun Pertidaksamaan",
      desc: "Tulis model, dapatkan petunjuk, revisi sampai benar.",
      done: ineqSolved, status: ineqSolved ? "Model benar!" : ineqCount > 0 ? `${ineqCount}× percobaan` : "Belum dicoba",
    },
    {
      href: "/proyek/jurnal", icon: NotebookPen, n: "7", title: "Jurnal Harian",
      desc: "Wajib diisi setiap hari oleh setiap anggota kelompok.",
      done: journalRows.length > 0,
      status: `${journalRows.length} hari terisi (hari ke-${currentDay})`,
    },
    {
      href: "/hasil/portofolio", icon: FolderUp, n: "9", title: "Upload Portofolio",
      desc: "Laporan, infografis, presentasi, video, atau booklet.",
      done: portfolioCount > 0, status: portfolioCount > 0 ? `${portfolioCount} karya` : "Belum ada",
    },
    {
      href: "/hasil/refleksi", icon: Lightbulb, n: "10", title: "Refleksi Belajar",
      desc: "Pikirkan kembali perjalanan belajarmu selama proyek.",
      done: reflRows.length > 0, status: reflRows.length > 0 ? "Sudah diisi" : "Belum diisi",
    },
  ];

  const projectUnlocked = isMember && quizPassed;

  return (
    <>
      <StudentNav name={me.name} groupName={session.group?.name ?? null} />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <RemindersBanner />

        {/* ------------------------- Greeting + progress ------------------------- */}
        <section className="card relative mt-2 overflow-hidden p-7 sm:p-9">
          <div className="absolute -right-16 -top-16 size-56 rounded-full bg-amber/10 blur-3xl" />
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="label-caps mb-2 !text-amber">Dashboard Siswa</p>
              <h1 className="font-display text-4xl font-medium tracking-tight sm:text-5xl">
                Halo, <span className="italic text-amber">{me.name.split(" ")[0]}</span>.
              </h1>
              <p className="mt-2 max-w-lg text-sm text-cream-dim">
                {isMember
                  ? `Kamu tergabung di ${session.group!.name}. Lanjutkan tahapan proyekmu di bawah.`
                  : "Kamu sudah terdaftar! Sekarang gabung ke kelompokmu dengan PIN dari guru untuk membuka fitur proyek."}
              </p>
            </div>
            <div className="min-w-52">
              <div className="mb-2 flex items-baseline justify-between font-grotesk text-xs text-cream-mute">
                <span>Progres keseluruhan</span>
                <span className="text-amber">{pct}%</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-espresso">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber to-amber-hi transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------- Group / PIN section ------------------------- */}
        {isMember ? (
          <section className="card mt-6 p-6">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-xl bg-sage/15 text-sage">
                  <Users className="size-5" />
                </span>
                <div>
                  <p className="font-grotesk text-sm font-semibold">{session.group!.name}</p>
                  <p className="font-grotesk text-xs text-cream-mute">
                    PIN: <span className="tracking-[0.3em] text-amber">{session.group!.pin}</span>
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {members.map((m) => (
                  <span
                    key={m.id}
                    className={`chip ${m.id === me.id ? "!border-amber/60 !text-amber" : ""}`}
                  >
                    {m.name}
                    {m.id === me.id && " (kamu)"}
                  </span>
                ))}
              </div>
            </div>
            {!quizPassed && (
              <p className="mt-4 flex items-start gap-2 rounded-xl border border-amber/40 bg-amber/10 px-4 py-3 text-sm text-amber-hi">
                <TriangleAlert className="mt-0.5 size-4 shrink-0" />
                Fitur proyekmu terbuka setelah lulus kuis konsep (≥ {PASSING_SCORE}).{" "}
                <Link href="/belajar/kuis" className="font-semibold underline underline-offset-2">
                  Kerjakan kuis
                </Link>
              </p>
            )}
          </section>
        ) : (
          <section id="gabung" className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
            <div className="card border-amber/30 p-7">
              <p className="label-caps mb-2 flex items-center gap-2 !text-amber">
                <KeyRound className="size-3.5" /> Tahap 2 · Gabung Kelompok
              </p>
              <h2 className="mb-4 font-display text-2xl font-medium">Punya PIN kelompok?</h2>
              <PinForm />
              <p className="mt-4 text-xs leading-relaxed text-cream-mute">
                Belum punya PIN? Tanya gurumu. PIN diberikan setelah guru membagi kelompok
                di kelas.
              </p>
            </div>
            <div className="card p-7">
              <h3 className="mb-4 font-display text-xl font-medium">Aksesmu saat ini</h3>
              <div className="space-y-2.5 text-sm">
                {[
                  ["Tonton video masalah", true],
                  ["Baca modul materi", true],
                  ["Coba grafik interaktif", true],
                  ["Kerjakan kuis konsep", true],
                  ["Upload data wawancara", false],
                  ["Susun pertidaksamaan", false],
                  ["Isi jurnal harian", false],
                  ["Upload portofolio & refleksi", false],
                ].map(([label, open]) => (
                  <div key={label as string} className="flex items-center gap-2.5">
                    {open ? (
                      <CheckCircle2 className="size-4 text-sage" />
                    ) : (
                      <Lock className="size-4 text-cream-mute" />
                    )}
                    <span className={open ? "text-cream" : "text-cream-mute line-through decoration-cream-mute/40"}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-4 rounded-xl border border-line bg-espresso/60 px-4 py-3 text-xs leading-relaxed text-cream-mute">
                Tanpa PIN, kamu tidak bisa mengerjakan proyek. Koordinasi dengan gurumu
                dan teman sekelompokmu, ya!
              </p>
            </div>
          </section>
        )}

        {/* ----------------------------- Learning cards ---------------------------- */}
        <section className="mt-12">
          <div className="mb-5 flex items-center gap-3">
            <Sparkles className="size-4 text-amber" />
            <h2 className="font-display text-2xl font-medium">Fase Belajar</h2>
            <span className="label-caps">Terbuka untuk semua</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {learnCards.map((c) => (
              <Link
                key={c.n}
                href={c.href}
                className="card group relative overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1 hover:border-amber/50"
              >
                <span className="pointer-events-none absolute -right-1 -top-3 font-display text-[4.5rem] font-light leading-none text-cream/[0.06]">
                  {c.n}
                </span>
                <c.icon className="mb-4 size-5 text-amber" />
                <h3 className="font-grotesk text-sm font-semibold">{c.title}</h3>
                <p className="mt-1.5 min-h-12 text-xs leading-relaxed text-cream-mute">{c.desc}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className={`chip ${c.done ? "!border-sage/50 !text-sage" : ""}`}>{c.status}</span>
                  <ArrowRight className="size-4 text-cream-mute transition-transform group-hover:translate-x-1 group-hover:text-amber" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ----------------------------- Project cards ----------------------------- */}
        <section className="mt-12">
          <div className="mb-5 flex items-center gap-3">
            <Users className="size-4 text-amber" />
            <h2 className="font-display text-2xl font-medium">Fase Proyek & Hasil Akhir</h2>
            <span className="label-caps">Butuh PIN + kuis lulus</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {projectCards.map((c) =>
              projectUnlocked ? (
                <Link
                  key={c.n}
                  href={c.href}
                  className="card group relative overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1 hover:border-amber/50"
                >
                  <span className="pointer-events-none absolute -right-1 -top-3 font-display text-[4.5rem] font-light leading-none text-cream/[0.06]">
                    {c.n}
                  </span>
                  <c.icon className="mb-4 size-5 text-amber" />
                  <h3 className="font-grotesk text-sm font-semibold">{c.title}</h3>
                  <p className="mt-1.5 min-h-12 text-xs leading-relaxed text-cream-mute">{c.desc}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className={`chip ${c.done ? "!border-sage/50 !text-sage" : ""}`}>{c.status}</span>
                    <ArrowRight className="size-4 text-cream-mute transition-transform group-hover:translate-x-1 group-hover:text-amber" />
                  </div>
                </Link>
              ) : (
                <div key={c.n} className="card relative overflow-hidden p-5 opacity-50">
                  <span className="pointer-events-none absolute -right-1 -top-3 font-display text-[4.5rem] font-light leading-none text-cream/[0.06]">
                    {c.n}
                  </span>
                  <Lock className="mb-4 size-5 text-cream-mute" />
                  <h3 className="font-grotesk text-sm font-semibold text-cream-dim">{c.title}</h3>
                  <p className="mt-1.5 min-h-12 text-xs leading-relaxed text-cream-mute">{c.desc}</p>
                  <span className="chip mt-3">Terkunci</span>
                </div>
              )
            )}
          </div>
        </section>

        <BottomNav member={isMember && quizPassed} />
      </main>
      <SiteFooter />
    </>
  );
}
