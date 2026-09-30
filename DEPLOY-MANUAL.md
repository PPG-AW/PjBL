# 🚀 Panduan Deploy TANPA Command Line (100% Klik & Copy-Paste)

Panduan ini untuk kamu yang belum pernah pakai Git Bash / terminal.
Semua langkah dilakukan lewat **browser** (dan opsional: aplikasi GitHub Desktop).

Alurnya tetap sama: **GitHub → Neon → Vercel**, hanya caranya yang dibuat manual.

---

## Bagian A — Upload Kode ke GitHub (Tanpa Git Bash)

Kamu punya **2 pilihan**. Pilih salah satu:

### Pilihan A1 — Upload Langsung di Website GitHub (paling cepat)

1. Login ke [github.com](https://github.com).
2. Klik tombol **+** (kanan atas) → **New repository** → nama misal `pjbl-sptldv` → **Create repository**.
3. Di halaman repo kosong, klik tulisan biru **"uploading an existing file"**.
4. Seret (drag) **semua file proyek** ke halaman itu — ATAU klik *choose your files* lalu seleksi semua.
5. ⚠️ **YANG TIDAK BOLEH IKUT TER-UPLOAD** — lewati/hapus dari seleksi:
   - folder `node_modules` ❌ (isinya ribuan file, bikin error)
   - folder `.next` ❌
   - file `.env` ❌ (berisi rahasia — GitHub juga akan menolaknya demi keamanan)
6. Tunggu upload selesai → scroll ke bawah → klik tombol hijau **Commit changes**.
7. Selesai! Kodenya sudah tersimpan rapi di GitHub.

> 💡 File yang ter-upload harusnya ±50 file: folder `src/`, folder `public/`, `package.json`, `tsconfig.json`, `schema.sql`, dll.

### Pilihan A2 — GitHub Desktop (rekomendasi untuk jangka panjang)

Lebih enak kalau nanti sering update: semua lewat tombol, tanpa terminal, dan kamu tidak perlu pilih-pilih file manual setiap kali update.

1. Download & install [GitHub Desktop](https://desktop.github.com).
2. Login dengan akun GitHub-mu.
3. Klik **File → Add local repository** → pilih folder proyek ini → klik **create a repository** saat ditawari → unggah.
4. Klik tombol biru **Publish repository** (kanan atas) → hilangkan centang *Keep this code private* kalau mau publik → **Publish repository**.
5. Selesai! Nanti kalau ada perubahan kode: cukup klik **Commit to main** → **Push origin**. Dua tombol, selesai.

---

## Bagian B — Isi Database Neon (Copy-Paste Saja)

Tidak perlu `npx drizzle-kit push` — saya sudah siapkan file **`schema.sql`** yang berisi semua perintah pembuatan tabel. Tinggal tempel di web Neon:

1. Daftar/login di [neon.tech](https://neon.tech).
2. **New Project** → nama misal `pjbl-sptldv` → region **Singapore** → **Create project**.
3. Di menu kiri dashboard Neon, klik **SQL Editor**.
4. Buka file **`schema.sql`** dari proyek ini (bisa dibuka pakai Notepad) → **Select All → Copy**.
5. **Paste** ke kolom SQL Editor di Neon → klik tombol **Run**.
6. Harus muncul hasil sukses — 13 tabel berhasil dibuat ✅.
7. Terakhir, ambil "alamat" databasenya:
   - Kembali ke **Dashboard** → bagian **Connection Details**
   - Aktifkan toggle **Pooled connection** ✅
   - **Copy** connection string-nya (diawali `postgresql://...`). Simpan di catatan — ini akan dipasang di Vercel.

> Kalau suatu hari muncul pesan `relation already exists` saat menekan Run ulang — abaikan saja, artinya tabelnya sudah ada.

---

## Bagian C — Deploy ke Vercel (Klik-Klik)

1. Login ke [vercel.com](https://vercel.com) → pilih **Continue with GitHub**.
2. Klik **Add New… → Project** → cari repo `pjbl-sptldv` → **Import**.
3. Scroll ke **Environment Variables**, tambahkan DUA baris ini:

   | Name | Value |
   |---|---|
   | `DATABASE_URL` | tempel connection string Neon dari Bagian B langkah 7 |
   | `TEACHER_CODE` | kode rahasia buatanmu untuk masuk `/guru`, misal `BOGA-JUARA-2026` |

   (Klik **Add** setelah mengisi tiap baris.)

4. Klik **Deploy** → tunggu ± 2 menit sampai muncul konfeti 🎉.
5. Klik **Continue to Dashboard** → klik link domainnya (misal `pjbl-sptldv.vercel.app`).

**App kamu sudah online!** Tes langsung:
- Login pakai nama → masuk dashboard ✅
- Buka `…vercel.app/guru` → masuk dengan `TEACHER_CODE` ✅

---

## Bagian D — Update App di Masa Depan

Kalau kamu mengubah kode (misal ganti teks, tambah soal kuis):

- **Kalau pakai A1 (web upload):** buka repo di GitHub → masuk ke folder tempat file itu berada → **Add file → Upload files** → upload versi barunya → **Commit changes**. File lama otomatis tertimpa.
- **Kalau pakai A2 (GitHub Desktop):** klik **Commit to main** → **Push origin**.

Vercel akan **otomatis deploy ulang** ± 2 menit setelahnya. Tidak perlu sentuh apa pun di Vercel.

> ⚠️ Satu-satunya pengecualian: kalau kamu mengubah struktur tabel di `src/db/schema.ts`, skema databasenya juga harus di-update manual lewat SQL Editor Neon (tanya saya SQL-nya kalau sampai ke sini 😄).

---

## Ringkasan: Butuh Apa Saja?

| Akun | Untuk apa | Cara pakai di panduan ini |
|---|---|---|
| GitHub | Simpan kode | Upload lewat browser / GitHub Desktop — **tanpa Git Bash** |
| Neon | Database PostgreSQL | Bikin project + paste `schema.sql` ke SQL Editor |
| Vercel | Hosting + domain gratis | Import repo GitHub + isi 2 environment variable |

**Total waktu: ± 20–30 menit pertama kali. Selamat mencoba!** 🎓
