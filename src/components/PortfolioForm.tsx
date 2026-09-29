"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2, TriangleAlert, X, FileUp } from "lucide-react";

const CATEGORIES = [
  { v: "Laporan Tertulis", hint: "PDF / Word" },
  { v: "Infografis", hint: "PNG / PDF" },
  { v: "Presentasi", hint: "PPT / PDF" },
  { v: "Video", hint: "MP4 maks 3 MB" },
  { v: "Booklet", hint: "PDF" },
  { v: "Lainnya", hint: "Bebas + keterangan" },
];

export default function PortfolioForm() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState(CATEGORIES[0].v);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    if (!file) {
      setError("Lampirkan file hasil akhirmu dulu ya.");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setError("Ukuran file melebihi 3 MB. Kompres atau pangkas dulu ya.");
      return;
    }
    setBusy(true);
    const fd = new FormData();
    fd.set("category", category);
    fd.set("title", title);
    fd.set("description", description);
    fd.set("file", file);
    const res = await fetch("/api/portfolio", { method: "POST", body: fd });
    const data = await res.json().catch(() => null);
    setBusy(false);
    if (!res.ok || !data?.ok) {
      setError(data?.error ?? "Gagal mengunggah portofolio.");
      return;
    }
    setTitle("");
    setDescription("");
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
    router.refresh();
  }

  const activeHint = CATEGORIES.find((c) => c.v === category)?.hint;

  return (
    <div className="card p-6">
      <p className="label-caps mb-4">Upload Karya Baru</p>

      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {CATEGORIES.map((c) => (
          <button
            key={c.v}
            onClick={() => setCategory(c.v)}
            className={`rounded-xl border px-3 py-2.5 text-left transition-all ${
              category === c.v
                ? "border-amber bg-amber/10"
                : "border-line-soft bg-espresso/50 hover:border-line"
            }`}
          >
            <p className={`font-grotesk text-xs font-semibold ${category === c.v ? "text-amber" : "text-cream"}`}>
              {c.v}
            </p>
            <p className="mt-0.5 text-[10px] text-cream-mute">{c.hint}</p>
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-xs font-medium text-cream-dim">Judul karya <span className="text-chili">*</span></label>
          <input
            className="field"
            placeholder={`cth: Infografis Model Produksi ${new Date().getFullYear()}`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-medium text-cream-dim">Keterangan singkat</label>
          <textarea
            className="field min-h-20 resize-y"
            placeholder="Jelaskan isi karyamu — wajib diisi jika memilih “Lainnya”."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-medium text-cream-dim">
            File <span className="text-chili">*</span>{" "}
            <span className="text-cream-mute">({activeHint}, maks 3 MB)</span>
          </label>
          <div className="flex items-center gap-3">
            <button type="button" className="btn-ghost !px-4 !py-2.5 text-xs" onClick={() => fileRef.current?.click()}>
              <FileUp className="size-3.5" /> Pilih File
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
              accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.mp4,video/mp4"
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

      <button className="btn-primary mt-5" onClick={submit} disabled={busy || title.trim().length < 3}>
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
        Unggah Portofolio
      </button>
    </div>
  );
}
