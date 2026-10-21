# Cevee — Brand Identity Guidelines (Concept A: Monogram Vertex)

Panduan praktis penggunaan aset identitas visual Cevee (Konsep A: Monogram Vertex).

---

## 1. Konsep & Filosofi
* **Ide Utama:** Fusi inisial huruf **C** (*Cevee / Career*) yang mengalir bersambung menjadi sudut tajam 45° **V** (*Curriculum Vitae*), sekaligus membentuk tanda centang verifikasi kelulusan seleksi sistem ATS (*Applicant Tracking System*).
* **Karakter:** Kokoh, presisi, dinamis, terpercaya, dan fokus pada hasil karir profesional.

---

## 2. Struktur File Paket (Package A)

```text
logo-design/package-a/
├── cevee-symbol-cobalt.svg       # Simbol utama warna Cobalt (#1E66FF)
├── cevee-symbol-slate.svg        # Simbol netral gelap Slate (#0F172A)
├── cevee-symbol-black.svg        # Simbol solid hitam (#000000)
├── cevee-symbol-white.svg        # Simbol solid putih (#FFFFFF)
├── cevee-symbol-square.svg       # Simbol terpusat pada kanvas 256x256 (avatar/sosial)
├── cevee-symbol-favicon.svg      # Simbol crop ketat untuk tab browser
├── cevee-symbol-app-icon.svg     # Simbol putih di atas squircle Cobalt (#1E66FF)
│
├── cevee-horizontal-color.svg    # Lockup horizontal resmi (Simbol Cobalt + Teks Slate)
├── cevee-horizontal-slate.svg    # Lockup horizontal Slate monokrom
├── cevee-horizontal-black.svg    # Lockup horizontal Hitam murni
├── cevee-horizontal-white.svg    # Lockup horizontal Putih (untuk latar belakang gelap)
│
├── cevee-stacked-color.svg       # Lockup vertikal / bertumpuk warna
├── cevee-stacked-slate.svg       # Lockup vertikal Slate
├── cevee-stacked-black.svg       # Lockup vertikal Hitam
├── cevee-stacked-white.svg       # Lockup vertikal Putih
│
├── favicon.ico                   # Multi-resolution ICO (16, 32, 48 px)
├── favicon.svg                   # Vektor favicon modern
├── favicon-16.png                # PNG Favicon 16x16 px
├── favicon-32.png                # PNG Favicon 32x32 px
├── favicon-48.png                # PNG Favicon 48x48 px
├── apple-touch-icon.png          # iOS Home Screen Icon 180x180 px
├── icon-192.png                  # PWA Manifest Icon 192x192 px
├── icon-512.png                  # PWA Manifest Icon 512x512 px
├── maskable-512.png              # Android Adaptive Icon 512x512 px
├── site.webmanifest              # Konfigurasi PWA standar
├── head-snippet.html             # Tag HTML <head> siap pasang
└── cevee-symbol-*-*.png          # Ekspor raster resolusi tinggi (32 hingga 1024 px)
```

---

## 3. Ruang Bebas (Clear Space)

Jaga area bersih minimal sebesar **1X** di sekeliling logo di semua sisi, di mana **X = ketebalan stroke simbol (36 px)** atau **tinggi huruf kapital C pada wordmark**.
* Jangan letakkan teks, ikon UI lain, atau garis pemisah di dalam zona batas aman ini.

---

## 4. Ukuran Minimum

| Varian | Media Digital | Media Cetak | Keterangan |
|---|---|---|---|
| **Horizontal Lockup** | Min. 96 px lebar | Min. 25 mm lebar | Untuk navbar, header, kop surat |
| **Stacked Lockup** | Min. 80 px lebar | Min. 20 mm lebar | Untuk splash screen, poster, merchandise |
| **Symbol Only** | Min. 16 px (`favicon.svg`) | Min. 5 mm lebar | Untuk favicon tab, app icon, avatar profil |

---

## 5. Palet Warna Resmi

| Peran | Nama Warna | HEX | RGB | Penggunaan |
|---|---|---|---|---|
| **Primary Accent** | Cevee Cobalt | `#1E66FF` | `30, 102, 255` | Simbol utama, tombol aksi utama, favicon |
| **Neutral Foreground** | Dark Slate | `#0F172A` | `15, 23, 42` | Tipografi wordmark, teks bodi, logo monokrom |
| **Background / Light** | Pure White | `#FFFFFF` | `255, 255, 255` | Latar utama kanvas, simbol versi terbalik (*reversed*) |
| **Neutral Canvas** | Page Wash | `#F4F5F7` | `244, 245, 247` | Latar kanvas kerja di luar lembar A4 |

### Pasangan Kontras yang Disetujui
1. **Latar Terang / Putih:** Gunakan `cevee-horizontal-color.svg` (Simbol Cobalt + Teks Slate) atau `cevee-horizontal-slate.svg`.
2. **Latar Gelap / Hitam:** Gunakan `cevee-horizontal-white.svg` (Simbol & Teks Putih Solid).
3. **Latar Cobalt (`#1E66FF`):** Gunakan simbol atau lockup warna putih solid (`#FFFFFF`).

---

## 6. Tipografi Pendamping
* **Font Antarmuka & Judul:** `Inter` (Google Fonts / `@fontsource/inter`, bobot 500/600/700).
* **Font Dokumen Cetak:** `Inter` & `Arimo` (self-hosted WOFF2, bebas ketergantungan CDN luar).

---

## 7. Larangan Penggunaan (Misuse Rules)
* **JANGAN** meregangkan (*stretch*), memipihkan (*squash*), atau mengubah proporsi rasio logo.
* **JANGAN** memutar (*rotate*) simbol atau memiringkannya di luar orientasi tegak 0°.
* **JANGAN** menambahkan efek bayangan jatuh (*drop shadow*), gradien warna, cahaya (*glow*), atau garis tepi (*outline*).
* **JANGAN** mengubah posisi atau jarak relatif antara simbol dan teks wordmark.
* **JANGAN** mengganti warna di luar palet resmi (Cobalt `#1E66FF`, Slate `#0F172A`, Hitam, Putih).
* **JANGAN** mengetik ulang tulisan "Cevee" menggunakan font sistem biasa pada lockup; gunakan selalu file vektor master yang telah di-outline.
