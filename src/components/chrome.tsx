import Link from "next/link";
import type { ReactNode } from "react";
import {
  ChefHat,
  LayoutDashboard,
  Play,
  BookOpen,
  ChartLine,
  ClipboardList,
  Mic,
  Search,
  NotebookPen,
  FolderUp,
  Lightbulb,
  KeyRound,
  Lock,
  ArrowRight,
} from "lucide-react";
import { LogoutButton } from "./client-bits";

/* --------------------------------- Logo --------------------------------- */

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/dashboard" className="group flex items-center gap-2.5">
      <span className="grid size-9 place-items-center rounded-xl bg-amber text-ink transition-transform group-hover:-rotate-6">
        <ChefHat className="size-5" />
      </span>
      {!compact && (
        <span className="leading-none">
          <span className="block font-display text-lg font-semibold tracking-tight">
            Dapur<span className="italic text-amber">SPtLDV</span>
          </span>
          <span className="block font-grotesk text-[10px] uppercase tracking-[0.28em] text-cream-mute">
            PjBL · Tata Boga
          </span>
        </span>
      )}
    </Link>
  );
}

/* ------------------------------- Navigation ------------------------------ */

const LEARN_LINKS = [
  { href: "/belajar/video", label: "Video", icon: Play },
  { href: "/belajar/modul", label: "Modul", icon: BookOpen },
  { href: "/belajar/grafik", label: "Grafik", icon: ChartLine },
  { href: "/belajar/kuis", label: "Kuis", icon: ClipboardList },
];

const PROJECT_LINKS = [
  { href: "/proyek/wawancara", label: "Wawancara", icon: Mic },
  { href: "/proyek/pertidaksamaan", label: "Pertidaksamaan", icon: Search },
  { href: "/proyek/jurnal", label: "Jurnal", icon: NotebookPen },
];

const RESULT_LINKS = [
  { href: "/hasil/portofolio", label: "Portofolio", icon: FolderUp },
  { href: "/hasil/refleksi", label: "Refleksi", icon: Lightbulb },
];

export function StudentNav({
  name,
  groupName,
}: {
  name: string;
  groupName: string | null;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-line-soft bg-ink/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
        <Logo />
        <nav className="ml-4 hidden items-center gap-1 md:flex">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 font-grotesk text-xs tracking-wide text-cream-dim transition-colors hover:bg-card hover:text-cream"
          >
            <LayoutDashboard className="size-3.5" /> Dashboard
          </Link>
          {LEARN_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 font-grotesk text-xs tracking-wide text-cream-dim transition-colors hover:bg-card hover:text-cream"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          {groupName ? (
            <span className="chip !border-sage/50 !text-sage">{groupName}</span>
          ) : (
            <span className="chip !border-amber/50 !text-amber">Belum berkelompok</span>
          )}
          <span className="hidden font-grotesk text-xs text-cream-dim sm:block">{name}</span>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}

export function BottomNav({ member }: { member: boolean }) {
  const links = member ? [...LEARN_LINKS, ...PROJECT_LINKS, ...RESULT_LINKS] : LEARN_LINKS;
  return (
    <section className="card mx-auto mt-12 max-w-6xl p-5">
      <p className="label-caps mb-3">Navigasi Cepat</p>
      <div className="flex flex-wrap gap-2">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="inline-flex items-center gap-2 rounded-xl border border-line bg-card px-3.5 py-2.5 font-grotesk text-xs text-cream-dim transition-all hover:border-amber/60 hover:text-cream"
          >
            <l.icon className="size-3.5 text-amber" /> {l.label}
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------ Page header ------------------------------ */

export function PageHeader({
  kicker,
  title,
  desc,
  icon,
}: {
  kicker: string;
  title: ReactNode;
  desc?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="mb-8">
      <div className="mb-3 flex items-center gap-2">
        {icon}
        <p className="label-caps !text-amber">{kicker}</p>
      </div>
      <h1 className="font-display text-4xl font-medium leading-[1.05] tracking-tight sm:text-5xl">
        {title}
      </h1>
      {desc && <p className="mt-3 max-w-2xl text-sm leading-relaxed text-cream-dim">{desc}</p>}
    </div>
  );
}

/* ------------------------------- Lock gate ------------------------------- */

export function LockGate({
  needPin,
  quizPassed,
}: {
  needPin: boolean;
  quizPassed: boolean;
}) {
  return (
    <div className="mx-auto max-w-lg">
      <div className="card p-8 text-center">
        <span className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl border border-amber/40 bg-amber/10">
          <Lock className="size-6 text-amber" />
        </span>
        <h2 className="font-display text-2xl font-medium">Fitur proyek masih terkunci</h2>
        {needPin ? (
          <>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-cream-dim">
              Kamu belum bergabung ke kelompok. Masukkan{" "}
              <span className="text-amber">PIN 4 digit</span> dari gurumu untuk membuka semua
              fitur proyek.
            </p>
            <Link href="/dashboard#gabung" className="btn-primary mt-6">
              <KeyRound className="size-4" /> Masukkan PIN Sekarang
            </Link>
          </>
        ) : (
          <>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-cream-dim">
              Satu langkah lagi: lulus <span className="text-amber">kuis konsep (nilai ≥ 70)</span>{" "}
              dulu ya, baru proyek bisa dimulai.
            </p>
            <Link href="/belajar/kuis" className="btn-primary mt-6">
              Kerjakan Kuis <ArrowRight className="size-4" />
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

/* ------------------------------- Footer --------------------------------- */

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-line-soft">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-6 py-10 text-center">
        <Logo compact />
        <p className="max-w-md text-xs leading-relaxed text-cream-mute">
          DapurSPtLDV — platform Project Based Learning Sistem Pertidaksamaan Linear Dua Variabel
          untuk SMK Tata Boga. Masak angka, racik solusi.
        </p>
      </div>
    </footer>
  );
}
