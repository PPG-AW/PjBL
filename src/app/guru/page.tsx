import Link from "next/link";
import { redirect } from "next/navigation";
import { GraduationCap, ArrowLeft, ShieldCheck } from "lucide-react";
import { getSession } from "@/lib/session";
import { TeacherLoginForm } from "@/components/client-bits";

export const dynamic = "force-dynamic";

export default async function GuruLoginPage() {
  const session = await getSession();
  if (session?.role === "teacher") redirect("/guru/dashboard");

  return (
    <main className="relative grid min-h-[100svh] place-items-center overflow-hidden px-4 py-16">
      <div className="pointer-events-none absolute -left-32 top-1/4 size-96 rounded-full bg-amber/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-1/4 size-96 rounded-full bg-teal/10 blur-3xl" />

      <div className="relative w-full max-w-md">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 font-grotesk text-xs text-cream-mute transition-colors hover:text-cream"
        >
          <ArrowLeft className="size-3.5" /> Kembali ke beranda
        </Link>

        <div className="card p-8">
          <span className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-amber/10 text-amber">
            <GraduationCap className="size-7" />
          </span>
          <h1 className="text-center font-display text-3xl font-medium">
            Akses <span className="italic text-amber">Guru</span>
          </h1>
          <p className="mx-auto mb-6 mt-2 max-w-xs text-center text-sm leading-relaxed text-cream-dim">
            Dashboard monitoring kelas: bagi kelompok, kelola PIN, dan pantau progres per individu.
          </p>
          <TeacherLoginForm />
          <p className="mt-5 flex items-start justify-center gap-2 text-center text-[11px] leading-relaxed text-cream-mute">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-sage" />
            Kode default: GURU1234 (ganti via env TEACHER_CODE untuk produksi)
          </p>
        </div>
      </div>
    </main>
  );
}
