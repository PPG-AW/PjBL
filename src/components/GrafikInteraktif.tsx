"use client";

import { useMemo, useState } from "react";
import { MousePointerClick, Trophy, Equal } from "lucide-react";
import { feasiblePolygon, cornerPoints, lineEnds } from "@/lib/geometry";
import { formatIDR, formatNum } from "@/lib/sptldv";

export type GraphConstraintInput = {
  a: number;
  b: number;
  c: number;
  label: string;
  unit: string;
};

const COLORS = ["#f0a13c", "#5ec2b0", "#b48cd9", "#e4572e", "#8cc084"];

const W = 720;
const H = 520;
const PAD = 58;

function niceStep(range: number): number {
  const raw = range / 20;
  const pow = Math.pow(10, Math.floor(Math.log10(raw)));
  const n = raw / pow;
  if (n < 1.5) return pow;
  if (n < 3.5) return 2 * pow;
  if (n < 7.5) return 5 * pow;
  return 10 * pow;
}

function trimNum(v: number): string {
  const r = Math.round(v * 100) / 100;
  return r.toLocaleString("id-ID");
}

export default function GrafikInteraktif({
  constraints: base,
  objective,
  productA,
  productB,
  onInteract,
  compact = false,
}: {
  constraints: GraphConstraintInput[];
  objective: { a: number; b: number };
  productA: string;
  productB: string;
  onInteract?: () => void;
  compact?: boolean;
}) {
  const [cs, setCs] = useState<number[]>(base.map((c) => c.c));
  const [selected, setSelected] = useState<number | null>(null);
  const [interacted, setInteracted] = useState(false);

  const cons = useMemo(
    () => base.map((c, i) => ({ ...c, c: cs[i], color: COLORS[i % COLORS.length] })),
    [base, cs]
  );

  const range = useMemo(() => {
    let m = 1;
    for (const c of cons) {
      if (c.a > 0) m = Math.max(m, c.c / c.a);
      if (c.b > 0) m = Math.max(m, c.c / c.b);
    }
    return m * 1.22;
  }, [cons]);

  const poly = useMemo(() => feasiblePolygon(cons, range), [cons, range]);
  const corners = useMemo(
    () => cornerPoints(poly, objective.a, objective.b),
    [poly, objective]
  );
  const best = corners.find((c) => c.isMax);

  const tick = niceStep(range);
  const toX = (x: number) => PAD + (x / range) * (W - 2 * PAD);
  const toY = (y: number) => H - PAD - (y / range) * (H - 2 * PAD);

  const touch = () => {
    if (!interacted) {
      setInteracted(true);
      onInteract?.();
    }
  };

  const polyPath =
    poly.length > 0
      ? `M ${poly.map((p) => `${toX(p.x).toFixed(1)} ${toY(p.y).toFixed(1)}`).join(" L ")} Z`
      : "";

  const ticks: number[] = [];
  for (let v = 0; v <= range; v += tick) ticks.push(v);

  return (
    <div className={`grid gap-6 ${compact ? "" : "lg:grid-cols-[1.35fr_1fr]"}`}>
      {/* ------------------------------- Canvas ------------------------------- */}
      <div className="card overflow-hidden p-2 sm:p-4">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full select-none"
          role="img"
          aria-label="Grafik daerah penyelesaian"
        >
          <defs>
            <pattern
              id="hatch"
              patternUnits="userSpaceOnUse"
              width="9"
              height="9"
              patternTransform="rotate(-45)"
            >
              <rect width="9" height="9" fill="rgba(240,161,60,0.07)" />
              <line x1="0" y1="0" x2="0" y2="9" stroke="rgba(240,161,60,0.4)" strokeWidth="1.6" />
            </pattern>
          </defs>

          {/* grid */}
          {ticks.map((t) => (
            <g key={`gx-${t}`}>
              <line x1={toX(t)} y1={toY(0)} x2={toX(t)} y2={toY(range)} stroke="#31240f" strokeWidth="1" />
              <line x1={toX(0)} y1={toY(t)} x2={toX(range)} y2={toY(t)} stroke="#31240f" strokeWidth="1" />
              <text x={toX(t)} y={toY(0) + 18} textAnchor="middle" fontSize="10" fill="#94825f" fontFamily="Space Grotesk">
                {formatNum(Math.round(t))}
              </text>
              <text x={toX(0) - 10} y={toY(t) + 3.5} textAnchor="end" fontSize="10" fill="#94825f" fontFamily="Space Grotesk">
                {formatNum(Math.round(t))}
              </text>
            </g>
          ))}

          {/* axes */}
          <line x1={toX(0)} y1={toY(0)} x2={toX(range)} y2={toY(0)} stroke="#c4b190" strokeWidth="1.6" />
          <line x1={toX(0)} y1={toY(0)} x2={toX(0)} y2={toY(range)} stroke="#c4b190" strokeWidth="1.6" />
          <text x={toX(range)} y={toY(0) + 34} textAnchor="end" fontSize="12" fill="#f3e8d2" fontStyle="italic" fontFamily="Fraunces">
            x ({productA})
          </text>
          <text x={toX(0) - 32} y={toY(range) - 6} fontSize="12" fill="#f3e8d2" fontStyle="italic" fontFamily="Fraunces">
            y ({productB})
          </text>

          {/* feasible region */}
          {polyPath && (
            <>
              <path d={polyPath} fill="url(#hatch)" stroke="#f0a13c" strokeWidth="1.4" strokeDasharray="5 4" className="transition-all duration-300" />
            </>
          )}

          {/* constraint lines */}
          {cons.map((c, i) => {
            const ends = lineEnds(c, range);
            if (!ends) return null;
            const [p1, p2] = ends;
            const mid = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
            return (
              <g key={i}>
                <line x1={toX(p1.x)} y1={toY(p1.y)} x2={toX(p2.x)} y2={toY(p2.y)} stroke={c.color} strokeWidth="2.6" strokeLinecap="round" />
                <text x={toX(mid.x) + 8} y={toY(mid.y) - 8} fontSize="11" fill={c.color} fontFamily="Space Grotesk" fontWeight="600">
                  {c.label}
                </text>
              </g>
            );
          })}

          {/* corner points */}
          {corners.map((c, i) => (
            <g key={i} onClick={() => { setSelected(i); touch(); }} className="cursor-pointer">
              {c.isMax && (
                <circle cx={toX(c.pt.x)} cy={toY(c.pt.y)} r="15" fill="none" stroke="#f0a13c" strokeWidth="2" className="animate-pulse-soft" />
              )}
              <circle
                cx={toX(c.pt.x)}
                cy={toY(c.pt.y)}
                r={selected === i ? 9 : 6.5}
                fill={c.isMax ? "#f0a13c" : "#241809"}
                stroke={c.isMax ? "#ffc670" : "#c4b190"}
                strokeWidth="2"
                className="transition-all duration-200"
              />
              {c.isMax && (
                <text x={toX(c.pt.x)} y={toY(c.pt.y) - 22} textAnchor="middle" fontSize="11" fill="#ffc670" fontFamily="Space Grotesk" fontWeight="700">
                  MAKS
                </text>
              )}
            </g>
          ))}
        </svg>
        <p className="flex items-center gap-2 px-2 pb-2 pt-1 text-xs text-cream-mute">
          <MousePointerClick className="size-3.5 text-amber" />
          Klik titik pojok untuk melihat kombinasi produksi &amp; keuntungannya.
        </p>
      </div>

      {/* ------------------------------ Controls ------------------------------ */}
      <div className="flex flex-col gap-4">
        {/* equations */}
        <div className="card p-4">
          <p className="label-caps mb-3 flex items-center gap-2"><Equal className="size-3.5" /> Model Kamu</p>
          <div className="space-y-2">
            {cons.map((c, i) => (
              <div key={i} className="flex items-center gap-2.5 rounded-lg border border-line-soft bg-espresso/60 px-3 py-2">
                <span className="size-2.5 shrink-0 rounded-full" style={{ background: c.color }} />
                <code className="font-grotesk text-xs text-cream sm:text-sm">
                  {formatNum(c.a)}x + {formatNum(c.b)}y ≤ {formatNum(cs[i])}
                </code>
                <span className="ml-auto text-[10px] text-cream-mute">{c.unit}</span>
              </div>
            ))}
            <div className="flex items-center gap-2.5 rounded-lg border border-line-soft bg-espresso/60 px-3 py-2">
              <span className="size-2.5 shrink-0 rounded-full bg-cream-dim" />
              <code className="font-grotesk text-xs text-cream sm:text-sm">x ≥ 0,&nbsp; y ≥ 0</code>
            </div>
          </div>
        </div>

        {/* sliders */}
        <div className="card p-4">
          <p className="label-caps mb-3">Geser Stok / Sumber Daya</p>
          <div className="space-y-4">
            {cons.map((c, i) => {
              const min = Math.max(1, Math.round(base[i].c * 0.35));
              const max = Math.round(base[i].c * 1.9);
              const step = niceStep(max - min) / 5 || 1;
              return (
                <div key={i}>
                  <div className="mb-1.5 flex items-baseline justify-between">
                    <label className="text-xs font-medium" style={{ color: c.color }}>
                      {c.label}
                    </label>
                    <span className="font-grotesk text-xs text-cream-dim">
                      {formatNum(cs[i])} {c.unit}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={cs[i]}
                    onChange={(e) => {
                      const v = [...cs];
                      v[i] = Number(e.target.value);
                      setCs(v);
                      setSelected(null);
                      touch();
                    }}
                    className="w-full"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* corner points */}
        <div className="card p-4">
          <p className="label-caps mb-3">Titik Pojok &amp; Keuntungan</p>
          <div className="space-y-1.5">
            {corners.length === 0 && <p className="text-xs text-cream-mute">Tidak ada daerah penyelesaian.</p>}
            {corners.map((c, i) => (
              <button
                key={i}
                onClick={() => { setSelected(i); touch(); }}
                className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all ${
                  selected === i
                    ? "border-amber/60 bg-amber/10"
                    : "border-line-soft bg-espresso/50 hover:border-line"
                }`}
              >
                <span
                  className={`grid size-6 shrink-0 place-items-center rounded-md font-grotesk text-[10px] font-bold ${
                    c.isMax ? "bg-amber text-ink" : "bg-card text-cream-dim"
                  }`}
                >
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="font-grotesk text-xs text-cream">
                  ({trimNum(c.pt.x)},&nbsp;{trimNum(c.pt.y)})
                </span>
                <span className={`ml-auto font-grotesk text-xs font-semibold ${c.isMax ? "text-amber-hi" : "text-cream-dim"}`}>
                  {formatIDR(c.z)}
                </span>
                {c.isMax && <Trophy className="size-3.5 text-amber" />}
              </button>
            ))}
          </div>
          {best && (
            <p className="mt-3 rounded-xl border border-amber/30 bg-amber/5 px-3 py-2.5 text-xs leading-relaxed text-cream-dim">
              Kombinasi terbaik: produksi{" "}
              <span className="font-semibold text-amber-hi">
                {trimNum(best.pt.x)} {productA}
              </span>{" "}
              dan{" "}
              <span className="font-semibold text-amber-hi">
                {trimNum(best.pt.y)} {productB}
              </span>{" "}
              → keuntungan <span className="font-semibold text-amber-hi">{formatIDR(best.z)}</span>.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
