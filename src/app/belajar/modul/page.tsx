import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { BookOpen, ChefHat, Lightbulb, ListOrdered, Calculator, Flame } from "lucide-react";
import { db } from "@/db";
import { progress } from "@/db/schema";
import { getSession } from "@/lib/session";
import { StudentNav, SiteFooter, PageHeader, BottomNav } from "@/components/chrome";
import { MarkComplete } from "@/components/client-bits";

export const dynamic = "force-dynamic";

const TOC = [
  { id: "definisi", label: "Apa itu SPtLDV?" },
  { id: "bentuk", label: "Bentuk Umum" },
  { id: "langkah", label: "Racik Langkah" },
  { id: "contoh", label: "Contoh Kasus Dapur" },
  { id: "rangkuman", label: "Rangkuman" },
];

function Callout({
  icon: Icon,
  title,
  children,
  tone = "amber",
}: {
  icon: typeof Lightbulb;
  title: string;
  children: React.ReactNode;
  tone?: "amber" | "teal" | "sage";
}) {
  const tones = {
    amber: "border-amber/40 bg-amber/8 text-amber",
    teal: "border-teal/40 bg-teal/8 text-teal",
    sage: "border-sage/40 bg-sage/8 text-sage",
  }[tone];
  return (
    <div className={`rounded-2xl border p-5 ${tones}`}>
      <p className="mb-2 flex items-center gap-2 font-grotesk text-xs font-semibold uppercase tracking-[0.18em]">
        <Icon className="size-4" /> {title}
      </p>
      <div className="text-sm leading-relaxed text-cream">{children}</div>
    </div>
  );
}

export default async function ModulPage() {
  const session = await getSession();
  if (!session) redirect("/");
  if (session.role === "teacher") redirect("/guru/dashboard");
  const me = session.student!;

  const done = (
    await db.select().from(progress).where(eq(progress.studentId, me.id))
  ).some((p) => p.feature === "modul");

  return (
    <>
      <StudentNav name={me.name} groupName={session.group?.name ?? null} />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <PageHeader
          kicker="Fitur 2 · Fase Belajar"
          title={
            <>
              Modul <span className="italic text-amber">SPtLDV</span> Rasa Boga
            </>
          }
          desc="Buku digital yang bisa kamu buka berulang kali. Baca pelan-pelan — konsep di sini adalah resep untuk menyelesaikan proyekmu."
          icon={<BookOpen className="size-4 text-amber" />}
        />

        <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
          {/* TOC */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-1">
              <p className="label-caps mb-3">Daftar Isi</p>
              {TOC.map((t, i) => (
                <a
                  key={t.id}
                  href={`#${t.id}`}
                  className="group flex items-baseline gap-3 rounded-lg px-3 py-2 font-grotesk text-xs text-cream-mute transition-colors hover:bg-card hover:text-cream"
                >
                  <span className="text-amber/70">{String(i + 1).padStart(2, "0")}</span>
                  {t.label}
                </a>
              ))}
              <div className="!mt-6 px-3">
                <MarkComplete feature="modul" done={done} />
              </div>
            </div>
          </aside>

          {/* Content */}
          <div className="max-w-2xl space-y-14">
            <section id="definisi" className="scroll-mt-28">
              <p className="label-caps mb-2 !text-amber">01</p>
              <h2 className="font-display text-3xl font-medium">Apa itu SPtLDV?</h2>
              <p className="mt-4 leading-relaxed text-cream-dim">
                <strong className="text-cream">Sistem Pertidaksamaan Linear Dua Variabel (SPtLDV)</strong>{" "}
                adalah kumpulan dua atau lebih pertidaksamaan linear yang memiliki dua
                variabel (biasanya <em>x</em> dan <em>y</em>) dan diselesaikan secara
                bersama-sama.
              </p>
              <p className="mt-3 leading-relaxed text-cream-dim">
                Dalam dunia dapur, SPtLDV adalah bahasa untuk mengatakan:{" "}
                <em className="text-cream">
                  “kombinasi produk mana saja yang masih masuk akal dengan bahan dan
                  waktu yang terbatas?”
                </em>
              </p>
              <div className="mt-5">
                <Callout icon={ChefHat} title="Analogi Dapur">
                  Resep mengatakan bahan yang <em>tepat</em>. Tapi stok dapur berkata
                  sebaliknya: “tepung <em>maksimal</em> 4 kg”. Kata “maksimal”, “minimal”,
                  “tidak melebihi”, “setidaknya” — itulah pertidaksamaan menyamar dalam
                  kalimat sehari-hari.
                </Callout>
              </div>
            </section>

            <section id="bentuk" className="scroll-mt-28">
              <p className="label-caps mb-2 !text-amber">02</p>
              <h2 className="font-display text-3xl font-medium">Bentuk Umum</h2>
              <div className="card mt-4 p-6 text-center">
                <code className="font-grotesk text-2xl text-amber-hi sm:text-3xl">
                  ax + by ≤ c
                </code>
                <p className="mt-3 font-grotesk text-xs uppercase tracking-[0.2em] text-cream-mute">
                  tanda bisa juga &nbsp;&lt; &nbsp;≥ &nbsp;&gt;
                </p>
              </div>
              <ul className="mt-5 space-y-2.5 text-sm leading-relaxed text-cream-dim">
                <li><strong className="text-cream">a, b</strong> → koefisien: kebutuhan sumber daya per satu unit produk (misal 100 gram tepung per roti).</li>
                <li><strong className="text-cream">x, y</strong> → variabel keputusan: banyak produk A dan produk B yang diproduksi.</li>
                <li><strong className="text-cream">c</strong> → konstanta: total sumber daya yang tersedia (stok harian).</li>
              </ul>
              <div className="mt-5">
                <Callout icon={Lightbulb} title="Kamus Tanda" tone="teal">
                  <div className="grid grid-cols-2 gap-2 font-grotesk text-xs">
                    <span>“maksimal / tidak melebihi”</span><span className="text-right text-teal">≤</span>
                    <span>“minimal / setidaknya”</span><span className="text-right text-teal">≥</span>
                    <span>“kurang dari”</span><span className="text-right text-teal">&lt;</span>
                    <span>“lebih dari”</span><span className="text-right text-teal">&gt;</span>
                  </div>
                </Callout>
              </div>
            </section>

            <section id="langkah" className="scroll-mt-28">
              <p className="label-caps mb-2 !text-amber">03</p>
              <h2 className="font-display text-3xl font-medium">Racik Langkah Penyelesaian</h2>
              <div className="mt-5 space-y-3">
                {[
                  ["Tentukan variabel", "Putuskan apa x dan y. Biasanya jumlah masing-masing produk."],
                  ["Susun model", "Ubah setiap kalimat keterbatasan menjadi pertidaksamaan ax + by ≤ c. Jangan lupa syarat realistis: x ≥ 0 dan y ≥ 0."],
                  ["Gambar garis batas", "Untuk tiap pertidaksamaan, gambar garis ax + by = c lewat dua titik potong sumbu: (c/a, 0) dan (0, c/b)."],
                  ["Arsir daerah penyelesaian", "Uji titik (0,0). Jika memenuhi, arsir sisi garis yang memuat (0,0). Irisan semua arsiran = daerah penyelesaian (DP)."],
                  ["Cari titik pojok", "Titik-titik sudut daerah penyelesaian adalah kandidat solusi terbaik."],
                  ["Uji fungsi tujuan", "Substitusi tiap titik pojok ke Z (misal keuntungan). Nilai terbesar = keputusan optimal."],
                ].map(([t, d], i) => (
                  <div key={i} className="card flex gap-4 p-4">
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-amber/10 font-grotesk text-sm font-bold text-amber">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-grotesk text-sm font-semibold">{t}</p>
                      <p className="mt-1 text-xs leading-relaxed text-cream-mute">{d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section id="contoh" className="scroll-mt-28">
              <p className="label-caps mb-2 !text-amber">04</p>
              <h2 className="font-display text-3xl font-medium">Contoh Kasus Dapur</h2>
              <p className="mt-3 text-sm leading-relaxed text-cream-dim">
                Kantin Ceria memproduksi <strong className="text-cream">Roti (x)</strong> dan{" "}
                <strong className="text-cream">Donat (y)</strong>. Data dapur:
              </p>
              <div className="card mt-4 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-line-soft text-left font-grotesk text-[11px] uppercase tracking-[0.15em] text-cream-mute">
                      <th className="px-5 py-3">Sumber Daya</th>
                      <th className="px-3 py-3">Roti</th>
                      <th className="px-3 py-3">Donat</th>
                      <th className="px-5 py-3">Stok</th>
                    </tr>
                  </thead>
                  <tbody className="font-grotesk text-xs sm:text-sm">
                    <tr className="border-b border-line-soft/60">
                      <td className="px-5 py-3 font-sans font-medium">Tepung</td>
                      <td className="px-3 py-3 text-cream-dim">100 g</td>
                      <td className="px-3 py-3 text-cream-dim">50 g</td>
                      <td className="px-5 py-3 text-amber-hi">4.000 g</td>
                    </tr>
                    <tr className="border-b border-line-soft/60">
                      <td className="px-5 py-3 font-sans font-medium">Telur</td>
                      <td className="px-3 py-3 text-cream-dim">1</td>
                      <td className="px-3 py-3 text-cream-dim">1</td>
                      <td className="px-5 py-3 text-amber-hi">50</td>
                    </tr>
                    <tr>
                      <td className="px-5 py-3 font-sans font-medium">Waktu oven</td>
                      <td className="px-3 py-3 text-cream-dim">15 mnt</td>
                      <td className="px-3 py-3 text-cream-dim">10 mnt</td>
                      <td className="px-5 py-3 text-amber-hi">600 mnt</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-cream-dim">
                Keuntungan per roti Rp4.000 dan per donat Rp3.000. Berapa produksi optimal?
              </p>
              <details className="card group mt-4 overflow-hidden">
                <summary className="flex cursor-pointer items-center gap-2 px-5 py-4 font-grotesk text-sm font-semibold text-amber transition-colors hover:bg-card">
                  <Calculator className="size-4" /> Lihat Pembahasan Lengkap
                </summary>
                <div className="space-y-4 border-t border-line-soft px-5 py-5 text-sm leading-relaxed text-cream-dim">
                  <div>
                    <p className="font-grotesk text-xs uppercase tracking-[0.18em] text-cream-mute">Langkah 1–2 · Model</p>
                    <div className="mt-2 space-y-1 font-grotesk text-cream">
                      <p>100x + 50y ≤ 4.000 <span className="text-cream-mute">(tepung)</span></p>
                      <p>x + y ≤ 50 <span className="text-cream-mute">(telur)</span></p>
                      <p>15x + 10y ≤ 600 <span className="text-cream-mute">(waktu)</span></p>
                      <p>x ≥ 0, &nbsp;y ≥ 0</p>
                      <p className="pt-1 text-amber-hi">Z = 4.000x + 3.000y <span className="text-cream-mute">(maksimumkan)</span></p>
                    </div>
                  </div>
                  <div>
                    <p className="font-grotesk text-xs uppercase tracking-[0.18em] text-cream-mute">Langkah 3–5 · Titik pojok daerah penyelesaian</p>
                    <p className="mt-2 font-grotesk">(0, 0) · (40, 0) · (20, 30) · (0, 50)</p>
                    <p className="mt-1 text-xs text-cream-mute">
                      (20, 30) adalah irisan garis telur dan waktu oven: x + y = 50 dengan 15x + 10y = 600.
                    </p>
                  </div>
                  <div>
                    <p className="font-grotesk text-xs uppercase tracking-[0.18em] text-cream-mute">Langkah 6 · Uji Z</p>
                    <div className="mt-2 space-y-1 font-grotesk text-xs sm:text-sm">
                      <p>Z(0, 0) = 0</p>
                      <p>Z(40, 0) = Rp160.000</p>
                      <p>Z(20, 30) = 80.000 + 90.000 = <span className="text-amber-hi">Rp170.000 ← maksimum</span></p>
                      <p>Z(0, 50) = Rp150.000</p>
                    </div>
                  </div>
                  <p className="rounded-xl border border-sage/40 bg-sage/10 px-4 py-3 text-sage">
                    Kesimpulan: produksi 20 roti dan 30 donat memberi keuntungan terbesar,
                    Rp170.000 per hari.
                  </p>
                </div>
              </details>
            </section>

            <section id="rangkuman" className="scroll-mt-28">
              <p className="label-caps mb-2 !text-amber">05</p>
              <h2 className="font-display text-3xl font-medium">Rangkuman</h2>
              <div className="mt-4">
                <Callout icon={Flame} title="Yang Wajib Kamu Ingat" tone="sage">
                  <ul className="list-disc space-y-1.5 pl-5">
                    <li>Pertidaksamaan = kalimat keterbatasan (stok, waktu, alat).</li>
                    <li>Garis batas ditemukan lewat titik potong kedua sumbu.</li>
                    <li>Daerah penyelesaian = irisan semua arsiran, selalu dengan x ≥ 0 dan y ≥ 0.</li>
                    <li>Nilai optimum fungsi tujuan selalu ada di titik pojok.</li>
                  </ul>
                </Callout>
              </div>
              <div className="mt-6 flex items-center gap-4">
                <MarkComplete feature="modul" done={done} />
                <a href="/belajar/grafik" className="btn-ghost">
                  Lanjut ke Grafik Interaktif →
                </a>
              </div>
            </section>
          </div>
        </div>

        <BottomNav member={!!session.group} />
      </main>
      <SiteFooter />
    </>
  );
}
