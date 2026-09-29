import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ChefHat,
  Play,
  BookOpen,
  ChartLine,
  ClipboardList,
  Mic,
  Search,
  NotebookPen,
  LayoutDashboard,
  FolderUp,
  Lightbulb,
  ArrowRight,
  UserRound,
  KeyRound,
  GraduationCap,
} from "lucide-react";
import { getSession } from "@/lib/session";
import { LoginForm } from "@/components/client-bits";

const FEATURES = [
  { n: "01", icon: Play, t: "Video & Cerita Masalah", d: "Kasus nyata kantin Tata Boga yang butuh keputusan produksi." },
  { n: "02", icon: BookOpen, t: "Modul Materi", d: "Buku digital interaktif SPtLDV dengan contoh bertema kuliner." },
  { n: "03", icon: ChartLine, t: "Grafik Interaktif", d: "Geser stok, lihat daerah penyelesaian berubah. Dibuat khusus, tanpa embed luar." },
  { n: "04", icon: ClipboardList, t: "Kuis Otomatis", d: "10 soal pilihan ganda. Lulus ≥ 70 untuk membuka fase proyek." },
  { n: "05", icon: Mic, t: "Form Wawancara", d: "Input data produk & bahan bebas — sesuai hasil wawancaramu di lapangan." },
  { n: "06", icon: Search, t: "Feedback Bertahap", d: "Sistem memberi petunjuk, bukan jawaban. Revisi sampai modelmu benar." },
  { n: "07", icon: NotebookPen, t: "Jurnal Harian", d: "Wajib setiap hari. Bukti kerja tiap anggota, bukan cuma satu orang." },
  { n: "08", icon: LayoutDashboard, t: "Dashboard Guru", d: "Pantau perkembangan per individu, kirim pengingat otomatis." },
  { n: "09", icon: FolderUp, t: "Portofolio Bebas", d: "Laporan, infografis, presentasi, video, booklet — pilih sendiri." },
  { n: "10", icon: Lightbulb, t: "Refleksi Akhir", d: "Sadari perjalanan belajarmu dari kuis awal sampai proyek selesai." },
];

const MARQUEE = [
  "Sistem Pertidaksamaan Linear Dua Variabel",
  "Project Based Learning",
  "SMK Tata Boga",
  "Model Matematika Produksi",
  "Titik Pojok & Keuntungan Maksimal",
  "Kantin Sekolah",
];

export default async function Home() {
  const session = await getSession();
  if (session?.role === "teacher") redirect("/guru/dashboard");
  if (session?.student) redirect("/dashboard");

  return (
    <main className="overflow-x-clip">
      {/* ------------------------------- HERO ------------------------------- */}
      <section className="relative min-h-[100svh]">
        <Image
          src="/images/hero.jpg"
          alt="Meja kerja dapur dengan kertas grafik matematika"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/82 to-ink/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/60" />

        <div className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col px-4 py-6 sm:px-6">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-xl bg-amber text-ink">
                <ChefHat className="size-5" />
              </span>
              <span className="leading-none">
                <span className="block font-display text-lg font-semibold tracking-tight">
                  Dapur<span className="italic text-amber">SPtLDV</span>
                </span>
                <span className="block font-grotesk text-[10px] uppercase tracking-[0.28em] text-cream-mute">
                  PjBL · Tata Boga
                </span>
              </span>
            </div>
            <Link
              href="/guru"
              className="inline-flex items-center gap-2 rounded-xl border border-line bg-ink/60 px-3.5 py-2 font-grotesk text-xs text-cream-dim backdrop-blur transition-colors hover:border-amber/60 hover:text-cream"
            >
              <GraduationCap className="size-3.5" /> Akses Guru
            </Link>
          </header>

          <div className="grid flex-1 items-center gap-12 py-16 lg:grid-cols-[1.25fr_1fr]">
            <div>
              <p className="label-caps mb-5 flex items-center gap-3 !text-amber">
                <span className="h-px w-10 bg-amber/60" />
                Project Based Learning · Kelas XI Tata Boga
              </p>
              <h1 className="font-display text-[13vw] font-medium leading-[0.95] tracking-tight sm:text-7xl lg:text-[5.4rem]">
                Masak <span className="italic text-amber">Angka.</span>
                <br />
                Racik <span className="italic text-amber">Solusi.</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-cream-dim">
                Kantin Tata Boga bingung menentukan jumlah produksi harian. Kamu dan
                kelompokmu akan menyelidikinya — mewawancarai dapur, menyusun model
                pertidaksamaan, dan menemukan kombinasi paling menguntungkan.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <span className="chip"><UserRound className="size-3 text-amber" /> Login cukup nama</span>
                <span className="chip"><KeyRound className="size-3 text-amber" /> PIN membuka proyek</span>
                <span className="chip"><ChartLine className="size-3 text-amber" /> Grafik rakitan sendiri</span>
              </div>
            </div>

            {/* Login card */}
            <div className="card relative p-7 shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
              <div className="absolute -top-px left-6 right-6 h-px bg-gradient-to-r from-transparent via-amber/70 to-transparent" />
              <p className="label-caps mb-1">Tahap 1 · Masuk</p>
              <h2 className="mb-5 font-display text-2xl font-medium">Siapa namamu?</h2>
              <LoginForm />
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------ MARQUEE ------------------------------ */}
      <div className="border-y border-line-soft bg-espresso/60 py-4">
        <div className="mask-fade-x overflow-hidden">
          <div className="flex w-max animate-marquee gap-10">
            {[...MARQUEE, ...MARQUEE].map((m, i) => (
              <span key={i} className="flex items-center gap-10 whitespace-nowrap font-grotesk text-xs uppercase tracking-[0.3em] text-cream-mute">
                {m} <span className="text-amber">✦</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ------------------------------ 2 STEPS ------------------------------ */}
      <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <p className="label-caps mb-3 !text-amber">Cara Masuk</p>
        <h2 className="max-w-2xl font-display text-4xl font-medium leading-tight sm:text-5xl">
          Dua langkah, <span className="italic text-amber">nol password.</span>
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="card group p-7 transition-colors hover:border-amber/40">
            <div className="mb-5 flex items-center justify-between">
              <span className="grid size-12 place-items-center rounded-2xl bg-amber/10 text-amber">
                <UserRound className="size-6" />
              </span>
              <span className="font-display text-5xl font-light text-outline">01</span>
            </div>
            <h3 className="font-display text-2xl font-medium">Login pakai nama</h3>
            <p className="mt-3 text-sm leading-relaxed text-cream-dim">
              Ketik nama lengkap sesuai absen. Namamu langsung tercatat di daftar guru —
              cepat, mudah, dan terlacak. Kamu langsung bisa mengakses video, modul,
              grafik interaktif, dan kuis.
            </p>
          </div>
          <div className="card group p-7 transition-colors hover:border-amber/40">
            <div className="mb-5 flex items-center justify-between">
              <span className="grid size-12 place-items-center rounded-2xl bg-amber/10 text-amber">
                <KeyRound className="size-6" />
              </span>
              <span className="font-display text-5xl font-light text-outline">02</span>
            </div>
            <h3 className="font-display text-2xl font-medium">Masuk kelompok pakai PIN</h3>
            <p className="mt-3 text-sm leading-relaxed text-cream-dim">
              Guru membagikan PIN 4 digit untuk tiap kelompok. PIN inilah kuncimu ke
              fitur proyek: wawancara, pertidaksamaan, jurnal, portofolio, dan refleksi.
              Tanpa PIN? Tidak bisa ikut proyek. Titik.
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------ FEATURES ------------------------------ */}
      <section className="border-y border-line-soft bg-espresso/40 py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="label-caps mb-3 !text-amber">10 Fitur · 3 Fase</p>
              <h2 className="max-w-xl font-display text-4xl font-medium leading-tight sm:text-5xl">
                Satu dapur, <span className="italic text-amber">sepuluh alat.</span>
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-cream-mute">
              Fase belajar (1–4) terbuka untuk semua. Fase proyek (5–7) dan hasil akhir
              (8–10) khusus anggota kelompok ber-PIN.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {FEATURES.map((f) => (
              <div
                key={f.n}
                className="card group relative overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1 hover:border-amber/40"
              >
                <span className="pointer-events-none absolute -right-2 -top-4 font-display text-[5rem] font-light leading-none text-cream/[0.05] transition-colors group-hover:text-amber/10">
                  {f.n}
                </span>
                <f.icon className="mb-4 size-5 text-amber" />
                <h3 className="font-grotesk text-sm font-semibold tracking-wide">{f.t}</h3>
                <p className="mt-2 text-xs leading-relaxed text-cream-mute">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------- CTA -------------------------------- */}
      <section className="mx-auto max-w-6xl px-4 py-24 text-center sm:px-6">
        <h2 className="mx-auto max-w-3xl font-display text-4xl font-medium leading-tight sm:text-6xl">
          Kantin menunggu <span className="italic text-amber">keputusanmu.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm text-cream-mute">
          Gulir ke atas, tulis namamu, dan mulai petualangan matematika paling enak
          se-SMK.
        </p>
        <a href="#" className="btn-primary mt-8">
          Mulai Sekarang <ArrowRight className="size-4" />
        </a>
      </section>

      <footer className="border-t border-line-soft py-8 text-center">
        <p className="text-xs text-cream-mute">
          DapurSPtLDV · Media PjBL Matematika SMK Tata Boga ·{" "}
          <Link href="/guru" className="text-amber hover:underline">Akses Guru</Link>
        </p>
      </footer>
    </main>
  );
}
