# Cevee — Brand Identity Guidelines (Concept C: Dual Caliper)

Panduan praktis penggunaan aset identitas visual Cevee (Konsep C: Dual Caliper).

---

## 1. Konsep & Filosofi
* **Ide Utama:** Komposisi dua elemen geometris presisi (*modular primitives*): braket kurva **C** (*Cevee / Candidate Profile*) di sisi kiri berdialog sejajar dengan chevron **>** (*ATS Prompt / Career Forward Momentum*) di sisi kanan, dipisahkan oleh celah udara (*air gap*) terkalibrasi 24 px.
* **Karakter:** Teknologikal, presisi setara *developer tools*, terstruktur, modular, dan berorientasi maju.

---

## 2. Struktur File Paket (Package C)

```text
logo-design/package-c/
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
└── cevee-symbol-*-*.png          # Ekspor raster resolusi tinggi (256 dan 512 px)
```

---

## 3. Ruang Bebas (Clear Space)

Jaga area bersih minimal sebesar **1X** di sekeliling logo di semua sisi, di mana **X = ketebalan stroke braket C (38 px)** atau **celah pemisah antara braket dan chevron**.
* Kedua elemen (braket dan chevron) adalah satu kesatuan simbol dan tidak boleh dipisahkan atau digeser jarak celahnya.

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

---

## 6. Tipografi Pendamping
* **Font Antarmuka:** `Inter` (Google Fonts / `@fontsource/inter`, bobot 500/600/700).
* **Font Dokumen Cetak:** `Inter` & `Arimo` (self-hosted WOFF2).

---

## 7. Larangan Penggunaan (Misuse Rules)
* **JANGAN** mengubah jarak celah (*gap*) antara braket C dan chevron panah.
* **JANGAN** menggunakan chevron atau braket C secara terpisah tanpa izin desain khusus.
* **JANGAN** meregangkan (*stretch*), memipihkan (*squash*), atau memutar (*rotate*) logo.
* **JANGAN** menambahkan efek gradien, bayangan 3D, atau garis tepi (*outline*).
* **JANGAN** mengetik ulang tulisan "Cevee" menggunakan font sistem biasa pada lockup; gunakan selalu file vektor master yang telah di-outline.
