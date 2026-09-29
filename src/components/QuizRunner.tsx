"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Trophy,
  RotateCcw,
  Loader2,
  TriangleAlert,
} from "lucide-react";

export type PubQuestion = { q: string; context?: string; options: string[] };

type Result = {
  score: number;
  passed: boolean;
  correct: number;
  total: number;
  detail: { chosen: number; correct: number; isRight: boolean }[];
};

export default function QuizRunner({
  questions,
  passing,
  bestScore,
  alreadyPassed,
}: {
  questions: PubQuestion[];
  passing: number;
  bestScore: number | null;
  alreadyPassed: boolean;
}) {
  const router = useRouter();
  const [stage, setStage] = useState<"intro" | "quiz" | "result">("intro");
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>(Array(questions.length).fill(-1));
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  const answered = answers.filter((a) => a >= 0).length;
  const q = questions[idx];

  async function submit() {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers }),
    });
    const data = await res.json().catch(() => null);
    setBusy(false);
    if (!res.ok || !data?.ok) {
      setError(data?.error ?? "Gagal mengirim jawaban.");
      return;
    }
    setResult(data as Result);
    setStage("result");
    router.refresh();
  }

  function restart() {
    setAnswers(Array(questions.length).fill(-1));
    setIdx(0);
    setResult(null);
    setStage("quiz");
  }

  /* --------------------------------- Intro --------------------------------- */
  if (stage === "intro") {
    return (
      <div className="card mx-auto max-w-xl p-8 text-center">
        <span className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-amber/10 text-amber">
          <Trophy className="size-7" />
        </span>
        <h2 className="font-display text-3xl font-medium">Siap uji pemahamanmu?</h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-cream-dim">
          {questions.length} soal pilihan ganda bertema dapur & kantin. Nilai minimal{" "}
          <span className="font-semibold text-amber">{passing}</span> untuk membuka fase proyek.
        </p>
        {bestScore !== null && (
          <p className={`mt-4 inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 font-grotesk text-sm ${alreadyPassed ? "border-sage/50 bg-sage/10 text-sage" : "border-chili/50 bg-chili/10 text-chili"}`}>
            {alreadyPassed ? <CheckCircle2 className="size-4" /> : <TriangleAlert className="size-4" />}
            Nilai terbaikmu: {bestScore} {alreadyPassed ? "· SUDAH LULUS" : "· belum lulus, ayo coba lagi"}
          </p>
        )}
        <div className="mt-6">
          <button className="btn-primary" onClick={() => setStage("quiz")}>
            {bestScore !== null ? "Kerjakan Lagi" : "Mulai Kuis"} <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    );
  }

  /* --------------------------------- Result -------------------------------- */
  if (stage === "result" && result) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className={`card relative overflow-hidden p-8 text-center ${result.passed ? "border-sage/40" : "border-chili/40"}`}>
          <p className="label-caps mb-2">Nilai Kamu</p>
          <p className={`font-display text-7xl font-medium ${result.passed ? "text-sage" : "text-chili"}`}>
            {result.score}
          </p>
          <p className="mt-2 font-grotesk text-sm text-cream-dim">
            {result.correct} benar dari {result.total} soal
          </p>
          <p className={`mx-auto mt-4 max-w-md rounded-xl border px-4 py-3 text-sm ${result.passed ? "border-sage/40 bg-sage/10 text-sage" : "border-chili/40 bg-chili/10 text-chili"}`}>
            {result.passed
              ? "LULUS! Fase proyek sekarang terbuka untukmu. Lanjutkan perjuangan bersama kelompokmu."
              : `Belum sampai ${passing}. Baca lagi modulnya, coba grafik interaktif, lalu ulangi kuisnya. Kamu pasti bisa.`}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button className="btn-primary" onClick={restart}>
              <RotateCcw className="size-4" /> Coba Lagi
            </button>
            <button className="btn-ghost" onClick={() => { router.push("/dashboard"); router.refresh(); }}>
              Ke Dashboard
            </button>
          </div>
        </div>

        <div className="card p-6">
          <p className="label-caps mb-4">Tinjauan Jawaban</p>
          <div className="space-y-3">
            {questions.map((qq, i) => {
              const d = result.detail[i];
              return (
                <div key={i} className={`rounded-xl border px-4 py-3 ${d.isRight ? "border-sage/30 bg-sage/5" : "border-chili/30 bg-chili/5"}`}>
                  <div className="flex items-start gap-2.5">
                    {d.isRight ? (
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-sage" />
                    ) : (
                      <XCircle className="mt-0.5 size-4 shrink-0 text-chili" />
                    )}
                    <div className="text-sm">
                      <p className="font-medium text-cream">Soal {i + 1}: {qq.q}</p>
                      <p className="mt-1 text-xs text-cream-mute">
                        Jawabanmu: <span className={d.isRight ? "text-sage" : "text-chili"}>{d.chosen >= 0 ? qq.options[d.chosen] : "—"}</span>
                        {!d.isRight && (
                          <> · Kunci: <span className="text-sage">{qq.options[d.correct]}</span></>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  /* ---------------------------------- Quiz ---------------------------------- */
  return (
    <div className="mx-auto max-w-2xl">
      {/* progress */}
      <div className="mb-6 flex items-center gap-4">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-espresso">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber to-amber-hi transition-all duration-500"
            style={{ width: `${(answered / questions.length) * 100}%` }}
          />
        </div>
        <span className="font-grotesk text-xs text-cream-mute">
          {answered}/{questions.length} terjawab
        </span>
      </div>

      <div className="card p-7">
        <p className="label-caps mb-2">Soal {String(idx + 1).padStart(2, "0")} / {questions.length}</p>
        <h2 className="font-display text-2xl font-medium leading-snug">{q.q}</h2>
        {q.context && <p className="mt-2 font-grotesk text-xs text-amber">{q.context}</p>}

        <div className="mt-6 space-y-2.5">
          {q.options.map((opt, oi) => {
            const active = answers[idx] === oi;
            return (
              <button
                key={oi}
                onClick={() => {
                  const a = [...answers];
                  a[idx] = oi;
                  setAnswers(a);
                }}
                className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-sm transition-all ${
                  active
                    ? "border-amber bg-amber/10 text-cream"
                    : "border-line bg-espresso/50 text-cream-dim hover:border-amber/40 hover:text-cream"
                }`}
              >
                <span className={`grid size-7 shrink-0 place-items-center rounded-lg font-grotesk text-xs font-bold ${active ? "bg-amber text-ink" : "bg-card text-cream-mute"}`}>
                  {String.fromCharCode(65 + oi)}
                </span>
                {opt}
              </button>
            );
          })}
        </div>

        {error && (
          <p className="mt-4 flex items-start gap-2 rounded-xl border border-chili/40 bg-chili/10 px-3.5 py-3 text-sm text-chili">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" /> {error}
          </p>
        )}

        <div className="mt-7 flex items-center justify-between">
          <button
            className="btn-ghost !px-4"
            disabled={idx === 0}
            onClick={() => setIdx((i) => Math.max(0, i - 1))}
          >
            <ArrowLeft className="size-4" /> Sebelumnya
          </button>
          {idx < questions.length - 1 ? (
            <button
              className="btn-primary !px-4"
              disabled={answers[idx] < 0}
              onClick={() => setIdx((i) => i + 1)}
            >
              Berikutnya <ArrowRight className="size-4" />
            </button>
          ) : (
            <button
              className="btn-primary !px-4"
              disabled={busy || answered < questions.length}
              onClick={submit}
              title={answered < questions.length ? "Jawab semua soal dulu" : undefined}
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
              Kumpulkan
            </button>
          )}
        </div>
      </div>

      {/* quick nav dots */}
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {questions.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className={`grid size-8 place-items-center rounded-lg font-grotesk text-xs transition-all ${
              i === idx
                ? "bg-amber text-ink"
                : answers[i] >= 0
                  ? "bg-amber/20 text-amber"
                  : "bg-card text-cream-mute hover:text-cream"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
