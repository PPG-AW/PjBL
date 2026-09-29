"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  LogOut,
  ArrowRight,
  KeyRound,
  Bell,
  CheckCircle2,
  Loader2,
  TriangleAlert,
} from "lucide-react";

/* ------------------------------- Logout ------------------------------- */

export function LogoutButton({ to = "/" }: { to?: string }) {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push(to);
        router.refresh();
      }}
      className="btn-ghost !px-3.5 !py-2 text-xs"
      title="Keluar"
    >
      <LogOut className="size-3.5" />
      Keluar
    </button>
  );
}

/* ------------------------------ Login form ----------------------------- */

export function LoginForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json().catch(() => null);
    setBusy(false);
    if (!res.ok || !data?.ok) {
      setError(data?.error ?? "Gagal masuk. Coba lagi.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label htmlFor="nama" className="label-caps mb-2 block">
          Nama Lengkap
        </label>
        <input
          id="nama"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="cth: Andi Pratama Wijaya"
          className="field !py-3.5 !text-base"
          autoComplete="name"
          minLength={3}
          required
        />
      </div>
      {error && (
        <p className="flex items-start gap-2 rounded-xl border border-chili/40 bg-chili/10 px-3.5 py-3 text-sm text-chili">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" /> {error}
        </p>
      )}
      <button type="submit" disabled={busy || name.trim().length < 3} className="btn-primary w-full !py-3.5">
        {busy ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
        Masuk
      </button>
      <p className="text-center text-xs leading-relaxed text-cream-mute">
        Cukup tulis nama panjangmu sesuai absen kelas.
        <br />
        Tanpa password, tanpa ribet.
      </p>
    </form>
  );
}

/* ------------------------------- PIN form ------------------------------ */

export function PinForm({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/groups/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });
    const data = await res.json().catch(() => null);
    setBusy(false);
    if (!res.ok || !data?.ok) {
      setError(data?.error ?? "PIN salah. Coba lagi.");
      return;
    }
    setDone(data.groupName ?? "kelompokmu");
    onSuccess?.();
    setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 900);
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-sage/40 bg-sage/10 px-5 py-6 text-center">
        <CheckCircle2 className="mx-auto mb-2 size-8 text-sage" />
        <p className="font-grotesk text-sm text-cream">
          Berhasil! Kamu sekarang anggota <span className="font-semibold text-sage">{done}</span>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <input
        value={pin}
        onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
        placeholder="••••"
        inputMode="numeric"
        className="field !py-4 text-center font-grotesk !text-3xl font-semibold tracking-[0.6em] [text-indent:0.3em]"
        aria-label="PIN kelompok 4 digit"
        required
      />
      {error && (
        <p className="flex items-start gap-2 rounded-xl border border-chili/40 bg-chili/10 px-3.5 py-3 text-sm text-chili">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" /> {error}
        </p>
      )}
      <button type="submit" disabled={busy || pin.length !== 4} className="btn-primary w-full">
        {busy ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
        Gabung Kelompok
      </button>
    </form>
  );
}

/* --------------------------- Mark progress done ------------------------- */

export function MarkComplete({
  feature,
  done,
  disabled = false,
  hint,
}: {
  feature: "video" | "modul" | "grafik";
  done: boolean;
  disabled?: boolean;
  hint?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [finished, setFinished] = useState(done);

  if (finished) {
    return (
      <span className="inline-flex items-center gap-2 rounded-xl border border-sage/50 bg-sage/10 px-5 py-3 font-grotesk text-sm font-medium text-sage">
        <CheckCircle2 className="size-4" /> Sudah selesai — tercatat di progresmu
      </span>
    );
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        disabled={busy || disabled}
        className="btn-primary"
        onClick={async () => {
          setBusy(true);
          await fetch("/api/progress", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ feature }),
          });
          setBusy(false);
          setFinished(true);
          router.refresh();
        }}
      >
        {busy ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
        Tandai Sudah Selesai
      </button>
      {disabled && hint && <p className="text-xs text-cream-mute">{hint}</p>}
    </div>
  );
}

/* ------------------------------ Reminders ------------------------------ */

type Reminder = { id: number; message: string; createdAt: string };

export function RemindersBanner() {
  const [items, setItems] = useState<Reminder[]>([]);

  useEffect(() => {
    fetch("/api/reminders")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.ok && setItems(d.reminders))
      .catch(() => null);
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="space-y-3">
      {items.map((r) => (
        <div
          key={r.id}
          className="flex items-start gap-3 rounded-2xl border border-amber/50 bg-amber/10 px-4 py-3.5"
        >
          <Bell className="mt-0.5 size-4 shrink-0 text-amber" />
          <div className="flex-1 text-sm leading-relaxed text-cream">
            <span className="font-grotesk text-xs uppercase tracking-[0.18em] text-amber">
              Pengingat dari guru{"  "}
            </span>
            <br />
            {r.message}
          </div>
          <button
            className="btn-ghost !px-3 !py-1.5 text-xs"
            onClick={async () => {
              await fetch("/api/reminders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: [r.id] }),
              });
              setItems((prev) => prev.filter((x) => x.id !== r.id));
            }}
          >
            Mengerti
          </button>
        </div>
      ))}
    </div>
  );
}

/* ---------------------------- Teacher login ---------------------------- */

export function TeacherLoginForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/auth/teacher", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const data = await res.json().catch(() => null);
    setBusy(false);
    if (!res.ok || !data?.ok) {
      setError(data?.error ?? "Kode salah.");
      return;
    }
    router.push("/guru/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Kode akses guru"
        className="field text-center font-grotesk tracking-[0.3em]"
        required
      />
      {error && (
        <p className="flex items-start gap-2 rounded-xl border border-chili/40 bg-chili/10 px-3.5 py-3 text-sm text-chili">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" /> {error}
        </p>
      )}
      <button type="submit" disabled={busy || !code.trim()} className="btn-primary w-full">
        {busy ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
        Masuk Dashboard Guru
      </button>
    </form>
  );
}
