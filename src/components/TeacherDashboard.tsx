"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Users,
  Shuffle,
  Plus,
  KeyRound,
  Bell,
  CheckCircle2,
  XCircle,
  TriangleAlert,
  RefreshCw,
  Loader2,
  Trash2,
  Copy,
  Check,
} from "lucide-react";

type StudentRow = {
  id: number;
  name: string;
  groupId: number | null;
  lastSeenAt: string;
  video: boolean;
  modul: boolean;
  grafik: boolean;
  bestQuiz: number | null;
  quizAttempts: number;
  quizPassed: boolean;
  ineqAttempts: number;
  journalDays: number[];
  journalTotal: number;
  reflectionDone: boolean;
  hasActivity: boolean;
};

type GroupRow = {
  id: number;
  name: string;
  pin: string;
  members: StudentRow[];
  interviewDone: boolean;
  ineqAttempts: number;
  ineqSolved: boolean;
  portfolioCount: number;
  status: "kosong" | "lancar" | "perhatian" | "masalah";
};

type Data = {
  students: StudentRow[];
  groups: GroupRow[];
  noGroup: StudentRow[];
  warnings: { studentId: number; name: string; kind: string }[];
  currentDay: number;
  totalDays: number;
};

const STATUS_STYLE: Record<GroupRow["status"], { label: string; cls: string }> = {
  lancar: { label: "Lancar", cls: "border-sage/50 bg-sage/10 text-sage" },
  perhatian: { label: "Perlu Perhatian", cls: "border-amber/50 bg-amber/10 text-amber" },
  masalah: { label: "Masalah", cls: "border-chili/50 bg-chili/10 text-chili" },
  kosong: { label: "Kosong", cls: "border-line bg-espresso/60 text-cream-mute" },
};

function QuizChip({ s }: { s: StudentRow }) {
  if (s.bestQuiz === null) return <span className="chip">belum</span>;
  return (
    <span className={`chip ${s.quizPassed ? "!border-sage/50 !text-sage" : "!border-chili/50 !text-chili"}`}>
      {s.quizPassed ? "✓" : "✗"} {s.bestQuiz}
    </span>
  );
}

export default function TeacherDashboard() {
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [size, setSize] = useState(4);
  const [sent, setSent] = useState<Set<number>>(new Set());
  const [copied, setCopied] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/teacher/dashboard");
    const d = await res.json().catch(() => null);
    if (d?.ok) setData(d);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function action(body: Record<string, unknown>, key: string) {
    setBusy(key);
    setError(null);
    const res = await fetch("/api/teacher/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const d = await res.json().catch(() => null);
    setBusy(null);
    if (!res.ok || !d?.ok) {
      setError(d?.error ?? "Aksi gagal.");
      return;
    }
    await load();
  }

  async function remind(studentId: number) {
    setBusy(`remind-${studentId}`);
    await fetch("/api/teacher/remind", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId }),
    });
    setBusy(null);
    setSent((s) => new Set([...s, studentId]));
    setTimeout(() => setSent((s) => { const n = new Set(s); n.delete(studentId); return n; }), 3000);
  }

  if (loading) {
    return (
      <div className="grid place-items-center py-32 text-cream-mute">
        <Loader2 className="size-6 animate-spin" />
      </div>
    );
  }
  if (!data) {
    return <p className="py-20 text-center text-sm text-chili">Gagal memuat data dashboard.</p>;
  }

  const behindJournal = data.students.filter(
    (s) => s.groupId !== null && s.journalTotal < data.currentDay - 1
  );
  const notPassed = data.students.filter((s) => !s.quizPassed);

  return (
    <div className="space-y-8">
      {/* ------------------------------- Stats ------------------------------- */}
      <section className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Siswa terdaftar", v: data.students.length },
          { label: "Kelompok aktif", v: data.groups.filter((g) => g.members.length > 0).length },
          { label: "Belum berkelompok", v: data.noGroup.length, warn: data.noGroup.length > 0 },
          { label: "Hari proyek", v: `ke-${data.currentDay}/${data.totalDays}` },
        ].map((s) => (
          <div key={s.label} className="card p-5">
            <p className={`font-display text-4xl font-medium ${s.warn ? "text-chili" : "text-amber"}`}>{s.v}</p>
            <p className="mt-1 font-grotesk text-xs text-cream-mute">{s.label}</p>
          </div>
        ))}
      </section>

      {/* ------------------------------ Controls ------------------------------ */}
      <section className="card p-5">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
          <div className="flex items-center gap-3">
            <span className="label-caps">Hari ke</span>
            <div className="flex gap-1.5">
              {Array.from({ length: data.totalDays }, (_, i) => i + 1).map((d) => (
                <button
                  key={d}
                  disabled={busy === `day-${d}`}
                  onClick={() => action({ action: "setDay", day: d }, `day-${d}`)}
                  className={`grid size-8 place-items-center rounded-lg font-grotesk text-xs transition-all ${
                    data.currentDay === d ? "bg-amber font-bold text-ink" : "bg-card text-cream-mute hover:text-cream"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="label-caps">Acak kelompok</span>
            <select
              className="field !w-auto !px-2.5 !py-2 text-xs"
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
            >
              {[3, 4, 5, 6].map((n) => <option key={n} value={n}>{n} orang/kelompok</option>)}
            </select>
            <button
              className="btn-primary !px-4 !py-2 text-xs"
              disabled={busy === "randomize" || data.students.length === 0}
              onClick={() => {
                if (confirm("Acak ulang SEMUA kelompok? Anggota saat ini akan dikocok ulang.")) {
                  action({ action: "randomize", size }, "randomize");
                }
              }}
            >
              {busy === "randomize" ? <Loader2 className="size-3.5 animate-spin" /> : <Shuffle className="size-3.5" />}
              Acak
            </button>
          </div>

          <button
            className="btn-ghost !px-4 !py-2 text-xs"
            disabled={busy === "create"}
            onClick={() => action({ action: "create" }, "create")}
          >
            <Plus className="size-3.5" /> Kelompok Baru
          </button>

          <button className="btn-ghost !px-4 !py-2 text-xs" onClick={load}>
            <RefreshCw className="size-3.5" /> Muat Ulang
          </button>
        </div>
        {error && (
          <p className="mt-4 flex items-start gap-2 rounded-xl border border-chili/40 bg-chili/10 px-3.5 py-3 text-sm text-chili">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" /> {error}
          </p>
        )}
      </section>

      {/* ------------------------------ Warnings ------------------------------ */}
      {(data.warnings.length > 0 || notPassed.length > 0 || behindJournal.length > 0) && (
        <section className="card border-amber/30 p-5">
          <p className="label-caps mb-4 flex items-center gap-2 !text-amber">
            <TriangleAlert className="size-4" /> Peringatan
          </p>
          <div className="space-y-2.5">
            {data.warnings.map((w) => (
              <WarningRow key={`zero-${w.studentId}`} tone="chili" text={`${w.name} belum ada aktivitas sama sekali!`} sid={w.studentId} busy={busy} sent={sent} remind={remind} />
            ))}
            {notPassed.filter((s) => s.quizAttempts > 0 && s.bestQuiz !== null).map((s) => (
              <WarningRow key={`quiz-${s.id}`} tone="amber" text={`${s.name} belum lulus kuis (nilai ${s.bestQuiz}).`} sid={s.id} busy={busy} sent={sent} remind={remind} />
            ))}
            {behindJournal.map((s) => (
              <WarningRow key={`jrn-${s.id}`} tone="amber" text={`${s.name} hanya aktif ${s.journalTotal} dari ${data.currentDay} hari jurnal.`} sid={s.id} busy={busy} sent={sent} remind={remind} />
            ))}
          </div>
        </section>
      )}

      {/* ------------------------------- Groups ------------------------------- */}
      <section className="space-y-5">
        {data.groups.map((g) => {
          const st = STATUS_STYLE[g.status];
          return (
            <div key={g.id} className="card overflow-hidden">
              <div className="flex flex-wrap items-center gap-3 border-b border-line-soft bg-espresso/40 px-5 py-4">
                <span className="grid size-9 place-items-center rounded-xl bg-amber/10 text-amber">
                  <Users className="size-4.5" />
                </span>
                <div>
                  <p className="font-grotesk text-sm font-semibold">{g.name}</p>
                  <button
                    className="mt-0.5 inline-flex items-center gap-1.5 font-grotesk text-xs text-cream-mute transition-colors hover:text-amber"
                    onClick={() => {
                      navigator.clipboard?.writeText(g.pin).catch(() => null);
                      setCopied(g.id);
                      setTimeout(() => setCopied(null), 2000);
                    }}
                    title="Salin PIN"
                  >
                    PIN: <span className="tracking-[0.25em] text-amber">{g.pin}</span>
                    {copied === g.id ? <Check className="size-3 text-sage" /> : <Copy className="size-3" />}
                  </button>
                </div>
                <span className={`ml-2 inline-flex items-center rounded-full border px-3 py-1 font-grotesk text-xs ${st.cls}`}>
                  {st.label}
                </span>
                <div className="ml-auto flex flex-wrap items-center gap-3 font-grotesk text-[11px] text-cream-mute">
                  <span className={g.interviewDone ? "text-sage" : ""}>Wawancara {g.interviewDone ? "✓" : "—"}</span>
                  <span className={g.ineqSolved ? "text-sage" : g.ineqAttempts > 0 ? "text-amber" : ""}>
                    Model {g.ineqSolved ? "✓ benar" : g.ineqAttempts > 0 ? `${g.ineqAttempts}× coba` : "—"}
                  </span>
                  <span className={g.portfolioCount > 0 ? "text-sage" : ""}>Portofolio {g.portfolioCount > 0 ? g.portfolioCount : "—"}</span>
                  <button
                    className="btn-ghost !px-2.5 !py-1.5 text-[11px]"
                    disabled={busy === `pin-${g.id}`}
                    onClick={() => action({ action: "resetPin", groupId: g.id }, `pin-${g.id}`)}
                    title="Reset PIN kelompok ini"
                  >
                    {busy === `pin-${g.id}` ? <Loader2 className="size-3 animate-spin" /> : <KeyRound className="size-3" />}
                    Reset PIN
                  </button>
                  {g.members.length === 0 && (
                    <button
                      className="btn-danger !px-2.5 !py-1.5 text-[11px]"
                      disabled={busy === `del-${g.id}`}
                      onClick={() => action({ action: "delete", groupId: g.id }, `del-${g.id}`)}
                    >
                      <Trash2 className="size-3" /> Hapus
                    </button>
                  )}
                </div>
              </div>

              {g.members.length === 0 ? (
                <p className="px-5 py-5 text-sm text-cream-mute">Belum ada anggota. Tugaskan siswa dari daftar di bawah.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-sm">
                    <thead>
                      <tr className="text-left font-grotesk text-[10px] uppercase tracking-[0.15em] text-cream-mute">
                        <th className="px-5 py-3">Siswa</th>
                        <th className="px-3 py-3">Belajar 1–3</th>
                        <th className="px-3 py-3">Kuis</th>
                        <th className="px-3 py-3">Coba Model</th>
                        <th className="px-3 py-3">Jurnal</th>
                        <th className="px-3 py-3">Refleksi</th>
                        <th className="px-5 py-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {g.members.map((s) => (
                        <tr key={s.id} className="border-t border-line-soft/60">
                          <td className="px-5 py-3">
                            <span className="flex items-center gap-2">
                              {!s.hasActivity && <TriangleAlert className="size-3.5 text-chili" />}
                              {s.name}
                            </span>
                          </td>
                          <td className="px-3 py-3 font-grotesk text-xs">
                            {["video", "modul", "grafik"].map((f, i) => {
                              const on = f === "video" ? s.video : f === "modul" ? s.modul : s.grafik;
                              return (
                                <span key={f} className={`mr-1.5 ${on ? "text-sage" : "text-cream-mute/40"}`} title={f}>
                                  {i + 1}{on ? "✓" : "·"}
                                </span>
                              );
                            })}
                          </td>
                          <td className="px-3 py-3"><QuizChip s={s} /></td>
                          <td className="px-3 py-3 font-grotesk text-xs text-cream-dim">
                            {s.ineqAttempts > 0 ? `${s.ineqAttempts}×` : "—"}
                          </td>
                          <td className="px-3 py-3">
                            <span className={`chip ${s.journalTotal >= data.currentDay ? "!border-sage/50 !text-sage" : s.journalTotal === 0 && data.currentDay > 1 ? "!border-chili/50 !text-chili" : ""}`}>
                              {s.journalTotal}/{data.currentDay}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            {s.reflectionDone
                              ? <CheckCircle2 className="size-4 text-sage" />
                              : <XCircle className="size-4 text-cream-mute/40" />}
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center justify-end gap-2">
                              <select
                                className="field !w-28 !px-2 !py-1.5 text-[11px]"
                                value={s.groupId ?? ""}
                                disabled={busy === `assign-${s.id}`}
                                onChange={(e) =>
                                  action(
                                    { action: "assign", studentId: s.id, groupId: e.target.value === "" ? null : Number(e.target.value) },
                                    `assign-${s.id}`
                                  )
                                }
                              >
                                <option value="">— lepas —</option>
                                {data.groups.map((gg) => (
                                  <option key={gg.id} value={gg.id}>{gg.name}</option>
                                ))}
                              </select>
                              <button
                                className="btn-ghost !px-2.5 !py-1.5 text-[11px]"
                                disabled={busy === `remind-${s.id}` || sent.has(s.id)}
                                onClick={() => remind(s.id)}
                              >
                                {sent.has(s.id) ? <Check className="size-3 text-sage" /> : <Bell className="size-3" />}
                                {sent.has(s.id) ? "Terkirim" : "Ingatkan"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* ----------------------------- Unassigned ----------------------------- */}
      {data.noGroup.length > 0 && (
        <section className="card p-5">
          <p className="label-caps mb-4">Siswa Belum Berkelompok ({data.noGroup.length})</p>
          <div className="flex flex-wrap gap-2.5">
            {data.noGroup.map((s) => (
              <div key={s.id} className="flex items-center gap-2 rounded-xl border border-line bg-espresso/60 px-3 py-2">
                <span className="text-sm">{s.name}</span>
                <select
                  className="field !w-24 !px-2 !py-1 text-[11px]"
                  value=""
                  disabled={busy === `assign-${s.id}`}
                  onChange={(e) => {
                    if (e.target.value) {
                      action({ action: "assign", studentId: s.id, groupId: Number(e.target.value) }, `assign-${s.id}`);
                    }
                  }}
                >
                  <option value="">+ kelompok</option>
                  {data.groups.map((gg) => (
                    <option key={gg.id} value={gg.id}>{gg.name}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function WarningRow({
  tone,
  text,
  sid,
  busy,
  sent,
  remind,
}: {
  tone: "chili" | "amber";
  text: string;
  sid: number;
  busy: string | null;
  sent: Set<number>;
  remind: (id: number) => void;
}) {
  return (
    <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${tone === "chili" ? "border-chili/40 bg-chili/8 text-cream" : "border-amber/30 bg-amber/5 text-cream"}`}>
      {tone === "chili" ? <TriangleAlert className="size-4 shrink-0 text-chili" /> : <TriangleAlert className="size-4 shrink-0 text-amber" />}
      <span className="flex-1">{text}</span>
      <button
        className="btn-ghost !px-3 !py-1.5 text-xs"
        disabled={busy === `remind-${sid}` || sent.has(sid)}
        onClick={() => remind(sid)}
      >
        {sent.has(sid) ? <Check className="size-3.5 text-sage" /> : <Bell className="size-3.5" />}
        {sent.has(sid) ? "Terkirim" : "Ingatkan"}
      </button>
    </div>
  );
}
