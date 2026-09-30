# 🚀 Panduan Deploy DapurSPtLDV

> 🖱️ **Belum pernah pakai Git Bash / terminal?** Baca **`DEPLOY-MANUAL.md`** — panduan khusus 100% klik & copy-paste tanpa command line sama sekali. File ini versi untuk yang nyaman dengan terminal.

Stack yang dipakai: **GitHub** (simpan kode) + **Neon** (database PostgreSQL gratis) + **Vercel** (hosting app gratis). Ketiganya punya free tier yang cukup untuk satu kelas — bahkan beberapa kelas.

```
Kode kamu ──push──▶ GitHub ──auto-deploy──▶ Vercel (website online)
                                              │
                                              ▼
                                          Neon (database PostgreSQL)
```

---

## Langkah 1 — Simpan Kode ke GitHub

1. Buat akun di [github.com](https://github.com) kalau belum punya.
2. Buat **repository baru** (tombol *New* → isi nama, misal `pjbl-sptldv` → *Create repository*). Biarkan kosong (tanpa README).
3. Di folder proyek ini, jalankan:

```bash
git init
git add .
git commit -m "DapurSPtLDV: platform PjBL siap deploy"
git branch -M main
git remote add origin https://github.com/USERNAME_KAMU/pjbl-sptldv.git
git push -u origin main
```

> ⚠️ File `.gitignore` sudah disiapkan — `.env` **tidak** ikut ter-upload, jadi tidak ada rahasia yang bocor.

---

## Langkah 2 — Bikin Database di Neon

1. Daftar di [neon.tech](https://neon.tech) (bisa login pakai GitHub).
2. Klik **New Project** → beri nama misal `pjbl-sptldv` → region pilih **Singapore** (paling dekat dengan Indonesia).
3. Di dashboard project, buka bagian **Connection Details**:
   - Aktifkan toggle **Pooled connection** ✅ (penting untuk Vercel!)
   - Salin connection string-nya, bentuknya seperti:
     ```
     postgresql://user:password@ep-xxx-pooler.ap-southeast-1.aws.neon.tech/pjbl?sslmode=require
     ```

4. **Isi tabel-tabel database** — di komputermu, edit file `.env`, ganti nilai `DATABASE_URL` dengan string Neon tadi, lalu jalankan:

```bash
npx drizzle-kit push
```

Perintah ini membuat semua tabel (siswa, kelompok, kuis, jurnal, dst.) di database Neon.

> Setelah selesai, kembalikan `.env` lokal ke alamat lokal kalau kamu masih mau development di komputer sendiri.

---

## Langkah 3 — Deploy ke Vercel

1. Daftar di [vercel.com](https://vercel.com) — pilih **Continue with GitHub**.
2. Klik **Add New… → Project** → pilih repo `pjbl-sptldv` → **Import**.
3. Framework auto-terdeteksi **Next.js** — tidak perlu ubah apa pun.
4. Buka bagian **Environment Variables**, tambahkan:

| Name | Value |
|---|---|
| `DATABASE_URL` | connection string Neon (pooled) dari Langkah 2 |
| `TEACHER_CODE` | kode rahasia guru buatanmu, misal `BOGA-HEBAT-2026` |

5. Klik **Deploy**. Tunggu ± 2 menit.
6. Selesai! App online di alamat seperti `https://pjbl-sptldv.vercel.app`.

---

## Langkah 4 — Cek Hasilnya

- ✅ Buka alamat Vercel → halaman login muncul
- ✅ Login pakai nama sembarang → masuk dashboard
- ✅ Buka `/guru` → masuk pakai `TEACHER_CODE` yang kamu set
- ✅ Buat kelompok di dashboard guru → bagikan PIN ke siswa

---

## Update di Masa Depan

Setiap kali kamu mengubah kode:

```bash
git add .
git commit -m "deskripsi perubahan"
git push
```

Vercel **otomatis deploy ulang** dalam ± 2 menit. Kalau kamu mengubah `src/db/schema.ts` (tambah tabel/kolom), jangan lupa jalankan `npx drizzle-kit push` lagi (dengan `.env` mengarah ke Neon).

---

## Tips & Catatan Penting

**💾 Kuota storage Neon gratis = 0,5 GB.**
File upload jurnal/portofolio disimpan di database (maks 3 MB/file). Untuk satu kelas ini aman, tapi ingatkan siswa untuk **mengompres foto sebelum upload** (screenshot WA/foto HP bisa 5–10 MB mentahnya). Kalau suatu saat penuh, opsinya: upgrade Neon, atau pindahkan file ke Cloudflare R2 / Supabase Storage.

**👨‍🏫 Ganti kode guru!**
Jangan pakai `GURU1234` di produksi. Set `TEACHER_CODE` yang kuat di environment variables Vercel.

**🔒 Keamanan yang sudah bawaan:**
- Session disimpan sebagai cookie `httpOnly` (token acak, tersimpan di database)
- Semua query database pakai parameterized query (anti SQL injection)
- Kunci jawaban kuis & pertidaksamaan hanya ada di server, tidak pernah dikirim ke browser
- Upload file dibatasi 3 MB dan divalidasi di server

**⏱️ Batas upload Vercel (free) = 4,5 MB per request** — batas 3 MB kita sudah aman di bawahnya.

**🌐 Domain sendiri (opsional):** di Vercel → *Settings → Domains*, kamu bisa pasang domain sendiri (misal `belajar.smkn1xyz.sch.id`) kalau sekolah punya.

---

## Alternatif Lain (kalau penasaran)

| Platform | Kelebihan | Kekurangan |
|---|---|---|
| **Vercel + Neon** ⭐ | Gratis, tercepat untuk Next.js, auto-deploy | Kuota DB 0,5 GB |
| **Railway** | App + database dalam satu dashboard, sangat simpel | Free trial terbatas, lalu bayar |
| **Render + Neon** | Gratis juga | Web service gratis "tidur" — loading pertama lambat 30–60 detik (kurang nyaman untuk kuis di kelas) |
| **VPS (DigitalOcean/dll)** | Kontrol penuh | Perlu urus server sendiri, berbayar |

Rekomendasi tetap: **GitHub + Vercel + Neon** untuk kebutuhan kelas. 🎓
