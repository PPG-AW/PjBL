import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { ChartLine, MousePointerClick, SlidersHorizontal, Search } from "lucide-react";
import { db } from "@/db";
import { progress } from "@/db/schema";
import { getSession } from "@/lib/session";
import { StudentNav, SiteFooter, PageHeader, BottomNav } from "@/components/chrome";
import GrafikSection from "@/components/GrafikSection";

export const dynamic = "force-dynamic";

const GUIDE = [
  {
    icon: SlidersHorizontal,
    t: "Geser slider stok",
    d: "Ubah jumlah tepung, telur, atau waktu oven. Perhatikan garis batas bergeser dan daerah arsiran ikut berubah.",
  },
  {
    icon: Search,
    t: "Perhatikan daerah arsiran",
    d: "Semua titik di dalam daerah arsiran adalah kombinasi produksi yang mungkin. Di luar itu = mustahil dengan stok yang ada.",
  },
  {
    icon: MousePointerClick,
    t: "Klik titik pojok",
    d: "Keputusan terbaik selalu ada di titik pojok. Bandingkan keuntungannya dan temukan yang maksimal.",
  },
];

export default async function GrafikPage() {
  const session = await getSession();
  if (!session) redirect("/");
  if (session.role === "teacher") redirect("/guru/dashboard");
  const me = session.student!;

  const done = (
    await db.select().from(progress).where(eq(progress.studentId, me.id))
  ).some((p) => p.feature === "grafik");

  return (
    <>
      <StudentNav name={me.name} groupName={session.group?.name ?? null} />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <PageHeader
          kicker="Fitur 3 · Fase Belajar"
          title={
            <>
              Laboratorium <span className="italic text-amber">Grafik</span>
            </>
          }
          desc="Rakitan khusus untuk kelas ini — bukan embed aplikasi luar. Mainkan kasus Roti & Donat dari modul dan lihat matematikanya hidup."
          icon={<ChartLine className="size-4 text-amber" />}
        />

        <section className="mb-8 grid gap-4 sm:grid-cols-3">
          {GUIDE.map((g, i) => (
            <div key={i} className="card p-5">
              <g.icon className="mb-3 size-5 text-amber" />
              <p className="font-grotesk text-sm font-semibold">{g.t}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-cream-mute">{g.d}</p>
            </div>
          ))}
        </section>

        <GrafikSection done={done} />

        <BottomNav member={!!session.group} />
      </main>
      <SiteFooter />
    </>
  );
}
