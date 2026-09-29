"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Save, Loader2, TriangleAlert, CheckCircle2, TrendingUp } from "lucide-react";
import { formatIDR } from "@/lib/sptldv";

const UNITS = ["gram", "kg", "butir", "ml", "liter", "sdm", "sdt", "buah", "lembar", "pack"];
const SUGGESTIONS = ["Tepung terigu", "Telur", "Gula pasir", "Mentega", "Susu", "Ragi", "Cokelat", "Keju", "Minyak goreng", "Vanila"];

type Row = { name: string; unit: string; perA: number; perB: number; total: number };

export type InterviewData = {
  productA: string;
  productB: string;
  ingredients: Row[];
  timePerA: number;
  timePerAUnit: string;
  timePerB: number;
  timePerBUnit: string;
  totalTime: number;
  totalTimeUnit: string;
  priceA: number;
  costA: number;
  priceB: number;
  costB: number;
  updatedBy?: string | null;
};

const DEFAULT_ROWS: Row[] = [
  { name: "Tepung terigu", unit: "gram", perA: 0, perB: 0, total: 0 },
  { name: "Telur", unit: "butir", perA: 0, perB: 0, total: 0 },
  { name: "Gula pasir", unit: "gram", perA: 0, perB: 0, total: 0 },
];

function NumField({
  value,
  onChange,
  placeholder = "0",
  className = "",
}: {
  value: number;
  onChange: (v: number) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <input
      type="number"
      min={0}
      value={value === 0 ? "" : value}
      placeholder={placeholder}
      onChange={(e) => onChange(Math.max(0, parseFloat(e.target.value) || 0))}
      className={`field !px-3 !py-2 text-center font-grotesk ${className}`}
    />
  );
}

export default function InterviewForm({
  initial,
  productNamesHint,
}: {
  initial: InterviewData | null;
  productNamesHint?: [string, string];
}) {
  const router = useRouter();
  const [productA, setProductA] = useState(initial?.productA ?? "");
  const [productB, setProductB] = useState(initial?.productB ?? "");
  const [rows, setRows] = useState<Row[]>(initial?.ingredients?.length ? initial.ingredients : DEFAULT_ROWS);
  const [timePerA, setTimePerA] = useState(initial?.timePerA ?? 0);
  const [timePerAUnit, setTimePerAUnit] = useState(initial?.timePerAUnit ?? "menit");
  const [timePerB, setTimePerB] = useState(initial?.timePerB ?? 0);
  const [timePerBUnit, setTimePerBUnit] = useState(initial?.timePerBUnit ?? "menit");
  const [totalTime, setTotalTime] = useState(initial?.totalTime ?? 0);
  const [totalTimeUnit, setTotalTimeUnit] = useState(initial?.totalTimeUnit ?? "jam");
  const [priceA, setPriceA] = useState(initial?.priceA ?? 0);
  const [costA, setCostA] = useState(initial?.costA ?? 0);
  const [priceB, setPriceB] = useState(initial?.priceB ?? 0);
  const [costB, setCostB] = useState(initial?.costB ?? 0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const updateRow = (i: number, patch: Partial<Row>) =>
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));

  async function save() {
    setBusy(true);
    setError(null);
    setSaved(false);
    const res = await fetch("/api/interview", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productA, productB, ingredients: rows,
        timePerA, timePerAUnit, timePerB, timePerBUnit, totalTime, totalTimeUnit,
        priceA, costA, priceB, costB,
      }),
    });
    const data = await res.json().catch(() => null);
    setBusy(false);
    if (!res.ok || !data?.ok) {
      setError(data?.error ?? "Gagal menyimpan.");
      return;
    }
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 3500);
  }

  return (
    <div className="space-y-6">
      {/* ------------------------------ Products ------------------------------ */}
      <div className="card p-6">
        <p className="label-caps mb-4">Produk yang Diteliti</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-medium text-cream-dim">
              Produk A <span className="text-cream-mute">(variabel x)</span>
            </label>
            <input
              className="field"
              value={productA}
              onChange={(e) => setProductA(e.target.value)}
              placeholder={productNamesHint?.[0] ?? "cth: Kue Lapis Legit"}
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-medium text-cream-dim">
              Produk B <span className="text-cream-mute">(variabel y)</span>
            </label>
            <input
              className="field"
              value={productB}
              onChange={(e) => setProductB(e.target.value)}
              placeholder={productNamesHint?.[1] ?? "cth: Risoles Sayur"}
            />
          </div>
        </div>
        <p className="mt-3 text-xs text-cream-mute">
          Bebas! Tidak harus roti & donat — tulis produk asli dari hasil wawancaramu dengan dapur.
        </p>
      </div>

      {/* ----------------------------- Ingredients ----------------------------- */}
      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-soft px-6 py-4">
          <p className="label-caps">Bahan Baku</p>
          <button
            className="btn-ghost !px-3 !py-1.5 text-xs"
            onClick={() => setRows((r) => [...r, { name: "", unit: "gram", perA: 0, perB: 0, total: 0 }])}
            disabled={rows.length >= 12}
          >
            <Plus className="size-3.5" /> Tambah Bahan
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-line-soft text-left font-grotesk text-[11px] uppercase tracking-[0.15em] text-cream-mute">
                <th className="px-6 py-3">Bahan</th>
                <th className="px-3 py-3">Satuan</th>
                <th className="px-3 py-3">Per {productA || "A"}</th>
                <th className="px-3 py-3">Per {productB || "B"}</th>
                <th className="px-3 py-3">Total/Hari</th>
                <th className="w-12 px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-line-soft/60 last:border-0">
                  <td className="px-6 py-2.5">
                    <input
                      className="field !px-3 !py-2"
                      value={r.name}
                      onChange={(e) => updateRow(i, { name: e.target.value })}
                      placeholder="Nama bahan"
                      list="bahan-list"
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    <select
                      className="field !px-2 !py-2"
                      value={r.unit}
                      onChange={(e) => updateRow(i, { unit: e.target.value })}
                    >
                      {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-2.5"><NumField value={r.perA} onChange={(v) => updateRow(i, { perA: v })} /></td>
                  <td className="px-3 py-2.5"><NumField value={r.perB} onChange={(v) => updateRow(i, { perB: v })} /></td>
                  <td className="px-3 py-2.5"><NumField value={r.total} onChange={(v) => updateRow(i, { total: v })} /></td>
                  <td className="px-3 py-2.5">
                    <button
                      className="rounded-lg p-2 text-cream-mute transition-colors hover:bg-chili/10 hover:text-chili disabled:opacity-30"
                      onClick={() => setRows((rr) => rr.filter((_, idx) => idx !== i))}
                      disabled={rows.length <= 1}
                      title="Hapus baris"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <datalist id="bahan-list">
          {SUGGESTIONS.map((s) => <option key={s} value={s} />)}
        </datalist>
      </div>

      {/* --------------------------------- Time --------------------------------- */}
      <div className="card p-6">
        <p className="label-caps mb-4">Waktu Produksi</p>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: `Per ${productA || "Produk A"}`, v: timePerA, setV: setTimePerA, u: timePerAUnit, setU: setTimePerAUnit },
            { label: `Per ${productB || "Produk B"}`, v: timePerB, setV: setTimePerB, u: timePerBUnit, setU: setTimePerBUnit },
            { label: "Total tersedia/hari", v: totalTime, setV: setTotalTime, u: totalTimeUnit, setU: setTotalTimeUnit },
          ].map((f, i) => (
            <div key={i}>
              <label className="mb-2 block text-xs font-medium text-cream-dim">{f.label}</label>
              <div className="flex gap-2">
                <NumField value={f.v} onChange={f.setV} className="flex-1" />
                <select className="field !w-24 !px-2 !py-2" value={f.u} onChange={(e) => f.setU(e.target.value)}>
                  <option value="menit">menit</option>
                  <option value="jam">jam</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* -------------------------------- Profit -------------------------------- */}
      <div className="card p-6">
        <p className="label-caps mb-4 flex items-center gap-2"><TrendingUp className="size-3.5" /> Harga & Keuntungan</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { name: productA || "Produk A", price: priceA, setPrice: setPriceA, cost: costA, setCost: setCostA },
            { name: productB || "Produk B", price: priceB, setPrice: setPriceB, cost: costB, setCost: setCostB },
          ].map((p, i) => {
            const profit = p.price - p.cost;
            return (
              <div key={i} className="rounded-xl border border-line-soft bg-espresso/50 p-4">
                <p className="mb-3 text-sm font-semibold">{p.name}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-[11px] text-cream-mute">Harga jual (Rp)</label>
                    <NumField value={p.price} onChange={p.setPrice} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[11px] text-cream-mute">Modal (Rp)</label>
                    <NumField value={p.cost} onChange={p.setCost} />
                  </div>
                </div>
                <p className={`mt-3 rounded-lg px-3 py-2 font-grotesk text-sm font-semibold ${profit > 0 ? "bg-sage/10 text-sage" : "bg-chili/10 text-chili"}`}>
                  Untung per unit: {formatIDR(profit)}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* --------------------------------- Save --------------------------------- */}
      <div className="flex flex-wrap items-center gap-4">
        <button className="btn-primary" onClick={save} disabled={busy}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Simpan Data Wawancara
        </button>
        {saved && (
          <span className="inline-flex items-center gap-2 font-grotesk text-sm text-sage">
            <CheckCircle2 className="size-4" /> Tersimpan! Data ini jadi kunci pengecekan di Fitur 6.
          </span>
        )}
        {initial?.updatedBy && (
          <span className="text-xs text-cream-mute">Terakhir diubah oleh {initial.updatedBy}</span>
        )}
      </div>
      {error && (
        <p className="flex items-start gap-2 rounded-xl border border-chili/40 bg-chili/10 px-4 py-3 text-sm text-chili">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" /> {error}
        </p>
      )}
    </div>
  );
}
