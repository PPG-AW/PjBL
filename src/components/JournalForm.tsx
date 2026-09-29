"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Paperclip, Send, Loader2, TriangleAlert, X } from "lucide-react";

export default function JournalForm({
  totalDays,
  currentDay,
}: {
  totalDays: number;
  currentDay: number;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [day, setDay] = useState(currentDay);
  const [activity, setActivity] = useState("");
  const [obstacle, setObstacle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    if (file && file.size > 3 * 1024 * 1024) {
      setError("Ukuran file melebihi 3 MB. Kompres dulu ya.");
      return;
    }
    setBusy(true);
    const fd = new FormData();
    fd.set("day", String(day));
    fd.set("activity", activity);
    fd.set("obstacle", obstacle);
    if (file) fd.set("file", file);
    const res = await fetch("/api/journal", { method: "POST", body: fd });
    const data = await res.json().catch(() => null);
    setBusy(false);
    if (!res.ok || !data?.ok) {
      setError(data?.error ?? "Gagal menyimpan jurnal.");
      return;
    }
    setActivity("");
    setObstacle("");
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
    router.refresh();
  }

  return (
    <div className="card p-6">
      <p className="label-caps mb-4">Jurnal Baru</p>
      <div className="mb-4">
        <label className="mb-2 block text-xs font-medium text-cream-dim">Hari ke</label>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: totalDays }, (_, i) => i + 1).map((d) => (
            <button
              key={d}
              onClick={() => setDay(d)}
              className={`grid size-10 place-items-center rounded-xl font-grotesk text-sm transition-all ${
                day === d ? "bg-amber text-ink font-bold" : "bg-card text-cream-mute hover:text-cream"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-xs font-medium text-cream-dim">
            Kegiatan hari ini <span className="text-chili">*</span>
          </label>
          <textarea
            className="field min-h-28 resize-y"
            placeholder="cth: Kami mewawancarai Ibu Rani, mencatat kebutuhan tepung per produk, lalu mulai menyusun tabel bahan…"
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-medium text-cream-dim">Kendala (opsional)</label>
          <textarea
            className="field min-h-16 resize-y"
            placeholder="cth: Anggota kurang satu, jadwal wawancara molor…"
            value={obstacle}
            onChange={(e) => setObstacle(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-medium text-cream-dim">
            Upload bukti (opsional, maks 3 MB — JPG, PNG, PDF, DOC, XLS, MP4)
          </label>
          <div className="flex items-center gap-3">
            <button type="button" className="btn-ghost !px-4 !py-2.5 text-xs" onClick={() => fileRef.current?.click()}>
              <Paperclip className="size-3.5" /> Pilih File
            </button>
            {file && (
              <span className="inline-flex items-center gap-2 rounded-lg bg-card px-3 py-2 font-grotesk text-xs text-cream-dim">
                {file.name} · {(file.size / 1024).toFixed(0)} KB
                <button onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = ""; }}>
                  <X className="size-3.5 text-chili" />
                </button>
              </span>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.mp4,video/mp4"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
        </div>
      </div>

      {error && (
        <p className="mt-4 flex items-start gap-2 rounded-xl border border-chili/40 bg-chili/10 px-3.5 py-3 text-sm text-chili">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" /> {error}
        </p>
      )}

      <button
        className="btn-primary mt-5"
        onClick={submit}
        disabled={busy || activity.trim().length < 5}
      >
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        Simpan Jurnal
      </button>
    </div>
  );
}
