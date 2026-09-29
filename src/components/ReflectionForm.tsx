"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Save, Loader2, TriangleAlert, CheckCircle2 } from "lucide-react";

export type ReflectionAnswers = { q1: string; q2: string; q3: string; rating: number };

const QUESTIONS = [
  {
    key: "q1" as const,
    label: "Apa hal paling menarik yang kamu pelajari dari proyek ini?",
    placeholder: "cth: Ternyata matematika bisa langsung menjawab pertanyaan bisnis nyata…",
  },
  {
    key: "q2" as const,
    label: "Bagian tersulit apa, dan bagaimana kelompokmu mengatasinya?",
    placeholder: "cth: Menyusun koefisien waktu oven — kami hampir salah satuan jam vs menit…",
  },
  {
    key: "q3" as const,
    label: "Menurutmu, bagaimana SPtLDV bisa membantu usaha makanan di sekitarmu?",
    placeholder: "cth: Warung ibuku bisa tahu kombinasi gorengan paling untung tiap pagi…",
  },
];

export default function ReflectionForm({
  initial,
  firstScore,
  bestScore,
}: {
  initial: ReflectionAnswers | null;
  firstScore: number | null;
  bestScore: number | null;
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<ReflectionAnswers>(
    initial ?? { q1: "", q2: "", q3: "", rating: 4 }
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function save() {
    setBusy(true);
    setError(null);
    setSaved(false);
    const res = await fetch("/api/reflection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers }),
    });
    const data = await res.json().catch(() => null);
    setBusy(false);
    if (!res.ok || !data?.ok) {
      setError(data?.error ?? "Gagal menyimpan refleksi.");
      return;
    }
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 3500);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
      {/* ------------------------- Score comparison ------------------------- */}
      <div className="space-y-6">
        <div className="card p-6">
          <p className="label-caps mb-5">Perjalanan Nilai Kuis</p>
          {firstScore === null ? (
            <p className="text-sm text-cream-mute">Kamu belum pernah mengerjakan kuis.</p>
          ) : (
            <div className="space-y-5">
              {[
                { label: "Percobaan pertama", v: firstScore, color: "bg-cream-mute" },
                { label: "Nilai terbaik", v: bestScore ?? firstScore, color: "bg-gradient-to-r from-amber to-amber-hi" },
              ].map((b) => (
                <div key={b.label}>
                  <div className="mb-1.5 flex items-baseline justify-between font-grotesk text-xs">
                    <span className="text-cream-dim">{b.label}</span>
                    <span className="text-lg font-bold text-cream">{b.v}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-espresso">
                    <div className={`h-full rounded-full ${b.color} transition-all duration-1000`} style={{ width: `${b.v}%` }} />
                  </div>
                </div>
              ))}
              {bestScore !== null && bestScore > (firstScore ?? 0) && (
                <p className="rounded-xl border border-sage/40 bg-sage/10 px-4 py-3 text-sm text-sage">
                  Naik {bestScore - (firstScore ?? 0)} poin dari percobaan pertamamu. Itu bukti
                  belajarmu nyata.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="card p-6">
          <p className="label-caps mb-4">Seberapa paham kamu sekarang?</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                onClick={() => setAnswers((a) => ({ ...a, rating: s }))}
                className={`grid size-11 place-items-center rounded-xl border transition-all ${
                  answers.rating >= s
                    ? "border-amber bg-amber/15 text-amber"
                    : "border-line-soft bg-espresso/50 text-cream-mute hover:text-cream"
                }`}
                title={`${s} dari 5`}
              >
                <Star className={`size-5 ${answers.rating >= s ? "fill-amber" : ""}`} />
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-cream-mute">
            {["", "Masih bingung", "Lumayan paham", "Cukup paham", "Paham", "Sangat paham — siap mengajari teman!"][answers.rating]}
          </p>
        </div>
      </div>

      {/* ------------------------------ Questions ------------------------------ */}
      <div className="card p-6">
        <p className="label-caps mb-5">Pertanyaan Refleksi</p>
        <div className="space-y-5">
          {QUESTIONS.map((q, i) => (
            <div key={q.key}>
              <label className="mb-2 block text-sm font-medium text-cream">
                {i + 1}. {q.label}
              </label>
              <textarea
                className="field min-h-24 resize-y"
                placeholder={q.placeholder}
                value={answers[q.key]}
                onChange={(e) => setAnswers((a) => ({ ...a, [q.key]: e.target.value }))}
              />
            </div>
          ))}
        </div>

        {error && (
          <p className="mt-4 flex items-start gap-2 rounded-xl border border-chili/40 bg-chili/10 px-3.5 py-3 text-sm text-chili">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" /> {error}
          </p>
        )}

        <div className="mt-6 flex items-center gap-4">
          <button className="btn-primary" onClick={save} disabled={busy}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {initial ? "Perbarui Refleksi" : "Simpan Refleksi"}
          </button>
          {saved && (
            <span className="inline-flex items-center gap-2 font-grotesk text-sm text-sage">
              <CheckCircle2 className="size-4" /> Tersimpan. Terima kasih sudah bercermin!
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
