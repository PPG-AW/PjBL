import Image from "next/image";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { Play, Flame, HelpCircle, Database } from "lucide-react";
import { db } from "@/db";
import { progress } from "@/db/schema";
import { getSession } from "@/lib/session";
import { StudentNav, SiteFooter, PageHeader, BottomNav } from "@/components/chrome";
import { MarkComplete } from "@/components/client-bits";

export const dynamic = "force-dynamic";

const STORY = [
  {
    act: "Babak 1 · Pagi di Dapur",
    title: "Stok menumpuk, roti sisa banyak",
    body: "Kantin Ceria menjual dua produk andalan buatan siswa Tata Boga: Roti Manis dan Donat Gula. Setiap hari Ibu Rani, pengelola kantin, harus memutuskan berapa banyak masing-masing produk dibuat. Masalahnya: kemarin 18 roti tidak laku dan terbuang. Minggu lalu donat malah habis sebelum istirahat kedua.",
  },
  {
    act: "Babak 2 · Bahan Terbatas",
    title: "Dapur bukan pabrik tanpa batas",
    body: "Stok tepung, telur, dan gula terbatas setiap hari. Waktu oven juga hanya 10 jam. Ibu Rani tidak bisa asal memperbanyak produksi — setiap roti dan donat 'memakan' jatah bahan dan waktu yang sama-sama terbatas.",
  },
  {
    act: "Babak 3 · Tantangan untuk Kalian",
    title: "Berapa roti? Berapa donat?",
    body: "Di sinilah kalian masuk. Kelompok kalian akan mewawancarai dapur kantin, mencatat kebutuhan bahan tiap produk, lalu memodelkannya dengan matematika untuk menemukan kombinasi produksi paling menguntungkan. Alatnya? Sistem Pertidaksamaan Linear Dua Variabel.",
  },
];

const SAMPLE_DATA = [
  { bahan: "Tepung terigu", perA: "100 gram", perB: "50 gram", stok: "4.000 gram" },
  { bahan: "Telur", perA: "1 butir", perB: "1 butir", stok: "50 butir" },
  { bahan: "Waktu oven", perA: "15 menit", perB: "10 menit", stok: "600 menit" },
];

const QUESTIONS = [
  "Kalau semua stok tepung dipakai untuk roti saja, berapa roti maksimal yang terbuat?",
  "Apakah mungkin membuat 30 roti DAN 30 donat sekaligus? Bahan mana yang habis duluan?",
  "Keuntungan apa yang hilang kalau Ibu Rani terus menebak-nebak jumlah produksi?",
];

export default async function VideoPage() {
  const session = await getSession();
  if (!session) redirect("/");
  if (session.role === "teacher") redirect("/guru/dashboard");
  const me = session.student!;

  const done = (
    await db
      .select()
      .from(progress)
      .where(eq(progress.studentId, me.id))
  ).some((p) => p.feature === "video");

  return (
    <>
      <StudentNav name={me.name} groupName={session.group?.name ?? null} />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <PageHeader
          kicker="Fitur 1 · Fase Belajar"
          title={
            <>
              Masalah di <span className="italic text-amber">Kantin Ceria</span>
            </>
          }
          desc="Tonton video dan baca ceritanya baik-baik. Semua yang kamu butuhkan untuk proyek dimulai dari masalah nyata ini."
          icon={<Play className="size-4 text-amber" />}
        />

        {/* ------------------------------ Video player ------------------------------ */}
        <section className="card group relative overflow-hidden">
          <div className="relative aspect-video w-full overflow-hidden bg-espresso">
            <video
              controls
              playsInline
              preload="metadata"
              poster="/images/kantin.jpg"
              className="h-full w-full object-cover"
            >
              <source
                src="https://videos.pexels.com/video-files/11265881/11265881-hd_1280_720_25fps.mp4"
                type="video/mp4"
              />
              Browsermu tidak mendukung pemutar video.
            </video>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line-soft px-5 py-3.5">
            <p className="font-grotesk text-xs text-cream-mute">
              ▶ “Dapur Produksi Pagi Hari” · 3 menit · Video ilustrasi: Pexels
            </p>
            <MarkComplete feature="video" done={done} />
          </div>
        </section>

        {/* --------------------------------- Story --------------------------------- */}
        <section className="mt-14 grid gap-6 lg:grid-cols-3">
          {STORY.map((s, i) => (
            <article key={i} className="card relative overflow-hidden p-6">
              <span className="pointer-events-none absolute -right-2 -top-5 font-display text-[6rem] font-light leading-none text-cream/[0.04]">
                {i + 1}
              </span>
              <p className="label-caps mb-2 !text-amber">{s.act}</p>
              <h3 className="font-display text-xl font-medium">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-cream-dim">{s.body}</p>
            </article>
          ))}
        </section>

        {/* ------------------------------ Data pengantar ------------------------------ */}
        <section className="mt-14 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <div className="card overflow-hidden">
            <div className="flex items-center gap-2.5 border-b border-line-soft px-6 py-4">
              <Database className="size-4 text-amber" />
              <h3 className="font-display text-xl font-medium">Data Pengantar Dapur</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line-soft text-left font-grotesk text-[11px] uppercase tracking-[0.15em] text-cream-mute">
                  <th className="px-6 py-3">Bahan</th>
                  <th className="px-4 py-3">Per Roti</th>
                  <th className="px-4 py-3">Per Donat</th>
                  <th className="px-6 py-3">Stok/Hari</th>
                </tr>
              </thead>
              <tbody>
                {SAMPLE_DATA.map((r) => (
                  <tr key={r.bahan} className="border-b border-line-soft/60 last:border-0">
                    <td className="px-6 py-3.5 font-medium">{r.bahan}</td>
                    <td className="px-4 py-3.5 font-grotesk text-cream-dim">{r.perA}</td>
                    <td className="px-4 py-3.5 font-grotesk text-cream-dim">{r.perB}</td>
                    <td className="px-6 py-3.5 font-grotesk text-amber-hi">{r.stok}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="border-t border-line-soft px-6 py-3.5 text-xs text-cream-mute">
              Angka di atas hanya contoh. Kelompokmu akan mengumpulkan data asli lewat
              wawancara pada Fitur 5.
            </p>
          </div>

          <div className="card border-amber/30 p-6">
            <div className="mb-4 flex items-center gap-2.5">
              <Flame className="size-4 text-amber" />
              <h3 className="font-display text-xl font-medium">Pertanyaan Pemantik</h3>
            </div>
            <div className="space-y-4">
              {QUESTIONS.map((q, i) => (
                <div key={i} className="flex gap-3">
                  <HelpCircle className="mt-0.5 size-4 shrink-0 text-amber" />
                  <p className="text-sm leading-relaxed text-cream-dim">{q}</p>
                </div>
              ))}
            </div>
            <p className="mt-5 rounded-xl bg-espresso/70 px-4 py-3 text-xs leading-relaxed text-cream-mute">
              Simpan pertanyaan ini di kepalamu — kamu akan menjawabnya dengan grafik di
              Fitur 3.
            </p>
          </div>
        </section>

        <div className="relative mt-10 overflow-hidden rounded-2xl border border-line-soft">
          <Image
            src="/images/kantin.jpg"
            alt="Suasana kantin sekolah"
            width={1400}
            height={500}
            className="h-52 w-full object-cover opacity-70"
          />
          <p className="absolute inset-0 grid place-items-center bg-ink/50 px-6 text-center font-display text-2xl italic text-cream sm:text-3xl">
            “Setiap keputusan produksi adalah soal matematika yang menyamar.”
          </p>
        </div>

        <BottomNav member={!!session.group} />
      </main>
      <SiteFooter />
    </>
  );
}
