"use client";

import { useState } from "react";
import {
  Search,
  CheckCircle2,
  XCircle,
  Lightbulb,
  TriangleAlert,
  Loader2,
  PartyPopper,
  RotateCcw,
} from "lucide-react";
import GrafikInteraktif from "./GrafikInteraktif";

export type RecapRow = {
  name: string;
  unit: string;
  perA: number;
  perB: number;
  total: number;
};

type FeedbackItem = {
  row: number;
  label: string;
  ok: boolean;
  empty: boolean;
  hint: string | null;
};

type Reward = {
  constraints: { a: number; b: number; c: number; label: string; unit: string }[];
  objective: { a: number; b: number };
  productA: string;
  productB: string;
};

export default function InequalityLab({
  productA,
  productB,
  recap,
  rows,
  initialAttempts,
  initialSolved,
}: {
  productA: string;
  productB: string;
  recap: RecapRow[];
  rows: { label: string; unit: string }[];
  initialAttempts: number;
  initialSolved: boolean;
}) {
  const [answers, setAnswers] = useState<string[]>(Array(rows.length).fill(""));
  const [nonNegX, setNonNegX] = useState("");
  const [nonNegY, setNonNegY] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackItem[] | null>(null);
  const [nonNegState, setNonNegState] = useState<{ missing: boolean; wrong: boolean } | null>(null);
  const [attempts, setAttempts] = useState(initialAttempts);
  const [solved, setSolved] = useState(initialSolved);
  const [reward, setReward] = useState<Reward | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function check() {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/inequality/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows: answers, nonNegX, nonNegY }),
    });
    const data = await res.json().catch(() => null);
    setBusy(false);
    if (!res.ok || !data?.ok) {
      setError(data?.error ?? "Gagal memeriksa jawaban.");
      return;
    }
    setFeedback(data.feedback);
    setNonNegState(data.nonNeg);
    setAttempts(data.attemptNumber);
    if (data.allCorrect) {
      setSolved(true);
      setReward(data.reward ?? null);
    }
  }

  if (solved && reward) {
    return (
      <div className="space-y-8">
        <div className="card relative overflow-hidden border-sage/40 p-8 text-center">
          <span className="mx-auto mb-3 grid size-14 place-items-center rounded-2xl bg-sage/15 text-sage">
            <PartyPopper className="size-7" />
          </span>
          <h2 className="font-display text-3xl font-medium">
            Modelmu <span className="italic text-sage">benar!</span>
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-cream-dim">
            Semua pertidaksamaan cocok dengan data wawancara. Ini hadiahmu — grafik daerah
            penyelesaian dari model buatan kelompokmu sendiri, lengkap dengan keuntungan maksimalnya.
          </p>
          <button
            className="btn-ghost mt-4 text-xs"
            onClick={() => { setSolved(false); setReward(null); }}
          >
            <RotateCcw className="size-3.5" /> Latihan lagi
          </button>
        </div>

        <GrafikInteraktif
          constraints={reward.constraints}
          objective={reward.objective}
          productA={reward.productA}
          productB={reward.productB}
        />
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      {/* ------------------------------- Recap ------------------------------- */}
      <div className="space-y-6">
        <div className="card overflow-hidden">
          <div className="border-b border-line-soft px-6 py-4">
            <p className="label-caps">Data Wawancaramu (Fitur 5)</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line-soft text-left font-grotesk text-[10px] uppercase tracking-[0.15em] text-cream-mute">
                <th className="px-6 py-2.5">Item</th>
                <th className="px-3 py-2.5">x = {productA}</th>
                <th className="px-3 py-2.5">y = {productB}</th>
                <th className="px-6 py-2.5">Total</th>
              </tr>
            </thead>
            <tbody>
              {recap.map((r, i) => (
                <tr key={i} className="border-b border-line-soft/60 last:border-0 font-grotesk text-xs sm:text-sm">
                  <td className="px-6 py-3 font-sans font-medium">{r.name}</td>
                  <td className="px-3 py-3 text-cream-dim">{r.perA} {r.unit}</td>
                  <td className="px-3 py-3 text-cream-dim">{r.perB} {r.unit}</td>
                  <td className="px-6 py-3 text-amber-hi">{r.total} {r.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card border-amber/30 p-5">
          <p className="label-caps mb-3 !text-amber">Format Penulisan</p>
          <ul className="space-y-2 text-xs leading-relaxed text-cream-dim">
            <li>Bentuk umum: <code className="rounded bg-espresso px-1.5 py-0.5 font-grotesk text-amber-hi">ax + by &lt;= c</code></li>
            <li>Contoh: <code className="rounded bg-espresso px-1.5 py-0.5 font-grotesk text-amber-hi">250x + 100y &lt;= 12000</code></li>
            <li>Boleh juga pakai titik ribuan (12.000) atau tanpa spasi.</li>
            <li>Koefisien 1 boleh ditulis <code className="rounded bg-espresso px-1.5 py-0.5 font-grotesk text-amber-hi">x + y &lt;= 50</code>.</li>
          </ul>
        </div>

        <div className="card p-5">
          <p className="label-caps mb-3">Percobaan</p>
          <p className="font-display text-5xl font-medium text-amber">{attempts}<span className="text-xl text-cream-mute"> / ∞</span></p>
          <p className="mt-2 text-xs leading-relaxed text-cream-mute">
            Tidak ada batas percobaan. Sistem hanya memberi <em>petunjuk</em>, bukan jawaban —
            jangan menyerah!
          </p>
        </div>
      </div>

      {/* ------------------------------- Inputs ------------------------------- */}
      <div className="space-y-4">
        {rows.map((r, i) => {
          const fb = feedback?.[i];
          return (
            <div
              key={i}
              className={`card p-5 transition-colors ${fb ? (fb.ok ? "!border-sage/50" : "!border-chili/50") : ""}`}
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="flex items-center gap-2 font-grotesk text-sm font-semibold">
                  <span className={`grid size-6 place-items-center rounded-md text-[11px] font-bold ${fb ? (fb.ok ? "bg-sage/20 text-sage" : "bg-chili/20 text-chili") : "bg-amber/15 text-amber"}`}>
                    P{i + 1}
                  </span>
                  {r.label}
                  <span className="text-[11px] font-normal text-cream-mute">({r.unit})</span>
                </p>
                {fb && (fb.ok ? <CheckCircle2 className="size-5 text-sage" /> : <XCircle className="size-5 text-chili" />)}
              </div>
              <input
                className="field font-grotesk !tracking-wide"
                placeholder={`tulis pertidaksamaan untuk ${r.label.toLowerCase()}…`}
                value={answers[i]}
                onChange={(e) => {
                  const a = [...answers];
                  a[i] = e.target.value;
                  setAnswers(a);
                }}
              />
              {fb && !fb.ok && fb.hint && (
                <p className="mt-3 flex items-start gap-2 rounded-xl border border-chili/30 bg-chili/8 px-3.5 py-2.5 text-xs leading-relaxed text-cream-dim">
                  <Lightbulb className="mt-0.5 size-3.5 shrink-0 text-amber" /> {fb.hint}
                </p>
              )}
            </div>
          );
        })}

        {/* non-negativity */}
        <div className={`card p-5 ${nonNegState ? (!nonNegState.missing && !nonNegState.wrong ? "!border-sage/50" : "!border-amber/50") : ""}`}>
          <p className="mb-1 font-grotesk text-sm font-semibold">
            Syarat Realistis <span className="text-[11px] font-normal text-cream-mute">(sering terlupakan!)</span>
          </p>
          <p className="mb-3 text-xs text-cream-mute">
            Apakah jumlah {productA} atau {productB} mungkin bernilai negatif? Tuliskan syaratnya.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[11px] text-cream-mute">Syarat untuk x</label>
              <input className="field font-grotesk" placeholder="x >= 0" value={nonNegX} onChange={(e) => setNonNegX(e.target.value)} />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] text-cream-mute">Syarat untuk y</label>
              <input className="field font-grotesk" placeholder="y >= 0" value={nonNegY} onChange={(e) => setNonNegY(e.target.value)} />
            </div>
          </div>
          {nonNegState && (nonNegState.missing || nonNegState.wrong) && (
            <p className="mt-3 flex items-start gap-2 rounded-xl border border-amber/30 bg-amber/8 px-3.5 py-2.5 text-xs leading-relaxed text-cream-dim">
              <TriangleAlert className="mt-0.5 size-3.5 shrink-0 text-amber" />
              {nonNegState.missing
                ? "Ada syarat yang belum ditulis. Pikirkan: apakah jumlah produk bisa negatif?"
                : "Tanda atau bentuknya belum tepat. Syarat non-negatif selalu memakai tanda “lebih dari atau sama dengan”."}
            </p>
          )}
        </div>

        {error && (
          <p className="flex items-start gap-2 rounded-xl border border-chili/40 bg-chili/10 px-4 py-3 text-sm text-chili">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" /> {error}
          </p>
        )}

        <button className="btn-primary w-full !py-4" onClick={check} disabled={busy}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
          Cek Jawaban Saya
        </button>
      </div>
    </div>
  );
}
