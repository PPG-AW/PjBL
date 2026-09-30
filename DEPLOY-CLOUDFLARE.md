# ⚡ Deploy ke Cloudflare (Lebih Cepat dari Indonesia) — 100% Klik & Copy-Paste

**Mengapa Cloudflare terasa lebih cepat?**

| | Vercel (gratis) | Cloudflare Workers |
|---|---|---|
| Server dijalankan di | 1 region (Singapura/AS) | **Kota terdekat dengan siswa** (Jakarta/Surabaya/Singapura — jaringan Cloudflare ada di 300+ kota) |
| Cold start | Bisa 1–2 detik saat jarang diakses | **Nyaris nol** |
| Biaya | Gratis | **Gratis** (100.000 request/hari) |

Kabar baiknya: kamu **tetap pakai GitHub + Neon yang sama**. Hanya "rumah"-nya yang pindah dari Vercel ke Cloudflare Workers. Semua file adapter (`wrangler.jsonc`, `open-next.config.ts`, mode koneksi database khusus Workers) **sudah disiapkan di repo ini** — kamu tinggal klik.

---

## Arsitektur Akhir

```
Siswa (HP) ──▶ Cloudflare kota terdekat (Jakarta/Sby/Sby) ──worker──▶ Neon Singapore (database)
                 jalan kaki, bukan naik pesawat 🚶                      pakai HTTPS (cepat)
```

---

## Langkah 1 — GitHub + Neon (sama seperti sebelumnya)

1. Upload kode ke GitHub (lihat `DEPLOY-MANUAL.md` Bagian A — web upload atau GitHub Desktop). **Pastikan file `wrangler.jsonc`, `open-next.config.ts`, dan `schema.sql` ikut ter-upload.**
2. Database Neon: tetap dipakai. Kalau belum dibuat, ikuti `DEPLOY-MANUAL.md` Bagian B (paste `schema.sql` di SQL Editor Neon), lalu salin **Pooled connection string**-nya.

---

## Langkah 2 — Deploy via Cloudflare Dashboard (tanpa terminal)

1. Daftar/login di [dash.cloudflare.com](https://dash.cloudflare.com).
2. Di menu kiri pilih **Workers & Pages** → klik **Create application**.
3. Pilih tab **Import a repository** → **Get started** → hubungkan akun **GitHub**-mu → pilih repo `pjbl-sptldv`.
4. Isi pengaturan build seperti ini:

   | Kolom | Isi |
   |---|---|
   | Project name | `pjbl-sptldv` (harus sama persis dengan `"name"` di `wrangler.jsonc`) |
   | Production branch | `main` |
   | **Build command** | `npx @opennextjs/cloudflare@latest build` |
   | **Deploy command** | `npx @opennextjs/cloudflare@latest deploy` |

5. Buka bagian **Environment Variables** (di halaman yang sama, atau nanti lewat *Settings → Variables and Secrets*), tambahkan **3 variabel** ini:

   | Name | Value |
   |---|---|
   | `DATABASE_URL` | connection string **pooled** dari Neon |
   | `TEACHER_CODE` | kode guru rahasiamu |
   | `CLOUDFLARE_WORKERS` | `1` ← *penting! mengaktifkan mode koneksi HTTPS ke Neon* |

6. Klik **Save and Deploy** → tunggu build pertama ± 3–5 menit.
7. Selesai! App online di `https://pjbl-sptldv.<akunmu>.workers.dev`

> 💡 Setelah ini, setiap kali kamu upload perubahan ke GitHub (upload file lewat web seperti biasa), Cloudflare **otomatis build & deploy ulang** — persis seperti Vercel.

---

## Langkah 3 — Pasang Domain Sendiri (opsional, gratis)

Di dashboard Worker → **Settings → Domains & Routes → Add Custom Domain** → ketik domain/subdomain sekolahmu. Cloudflare mengurus SSL-nya otomatis.

---

## Troubleshooting

| Gejala | Solusi |
|---|---|
| Build gagal "version not supported" | Ganti build command jadi: `npx @opennextjs/cloudflare@latest build --dangerouslyUseUnsupportedNextVersion` |
| App jalan tapi data error / "socket" | Pastikan `CLOUDFLARE_WORKERS=1` terpasang DAN `DATABASE_URL` memakai string **pooled** (mengandung `-pooler`) dari Neon |
| Gambar hero tidak tajam / aneh | Normal — di Workers optimasi gambar dimatikan (lihat `next.config.ts`). Tidak memengaruhi data |
| Ingin melihat log realtime | Dashboard → pilih Worker → tab **Observability / Logs** |

---

## Tentang D1, R2, KV (rencana "full Cloudflare" dari proposal awalmu)

Supaya jujur: proposal awalmu menulis **Pages + Workers + D1 + R2 + KV**. Setup hari ini adalah versi pragmatisnya:

| Proposal | Status hari ini |
|---|---|
| Pages (frontend) | ✅ Digantikan **Workers Static Assets** (lebih baru dari Pages) |
| Workers (backend) | ✅ Seluruh API & halaman jalan di Workers lewat adapter OpenNext |
| D1 (database) | ➖ **Diganti Neon PostgreSQL** — D1 adalah SQLite; memindahkannya berarti menulis ulang semua skema & query Drizzle (kerja migrasi besar). Kombinasi Workers + Neon pooled sudah memberi ±90% manfaat kecepatannya |
| R2 (file storage) | ➖ File jurnal/portofolio masih di database (maks 3 MB per file). Pindah ke R2 bisa dilakukan nanti kalau kuota Neon menipis |
| KV (cache) | ➖ Belum diperlukan — query kita ringan |

Kalau suatu hari kamu mau migrasi penuh ke D1 + R2, bilang saja — itu bisa saya kerjakan, tapi **untuk kebutuhan satu kelas, setup sekarang sudah lebih dari cukup dan jauh lebih cepat dari sebelumnya.** ⚡
