import { redirect } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { getSession } from "@/lib/session";
import { Logo, SiteFooter } from "@/components/chrome";
import { LogoutButton } from "@/components/client-bits";
import TeacherDashboard from "@/components/TeacherDashboard";

export const dynamic = "force-dynamic";

export default async function GuruDashboardPage() {
  const session = await getSession();
  if (!session || session.role !== "teacher") redirect("/guru");

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line-soft bg-ink/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
          <Logo />
          <span className="chip !border-amber/50 !text-amber">
            <GraduationCap className="size-3" /> Mode Guru
          </span>
          <div className="ml-auto">
            <LogoutButton to="/guru" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-8">
          <p className="label-caps mb-2 !text-amber">Fitur 8 · Monitoring</p>
          <h1 className="font-display text-4xl font-medium tracking-tight sm:text-5xl">
            Dashboard <span className="italic text-amber">Kelas</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-cream-dim">
            Pantau perkembangan per individu — siapa yang aktif, siapa yang menumpang nama,
            dan siapa yang butuh diingatkan.
          </p>
        </div>

        <TeacherDashboard />
      </main>
      <SiteFooter />
    </>
  );
}
