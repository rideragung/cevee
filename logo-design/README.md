# Paket Desain Identitas & Logo Cevee

Repositori aset desain logo dan identitas merek untuk aplikasi **Cevee** (*Browser-based ATS Resume Builder*).

---

## Ringkasan Konsep

Berdasarkan brief dan tahap evaluasi desain, tersedia dua paket lengkap siap produksi:

| Konsep | Nama | Karakter | File Paket |
|---|---|---|---|
| **A** | **Monogram Vertex** | Pita tunggal kontinu: inisial `C` + sudut `V` + centang lolos ATS | `logo-design/package-a/` |
| **C** | **Dual Caliper** | Komposisi modular 2 elemen: braket `C` + chevron `>` progres karir | `logo-design/package-c/` |

Lembar visual perbandingan dapat dilihat pada:
* `logo-design/concepts.png` (Tiga konsep awal A, B, C)
* `logo-design/comparison-ac.png` (Perbandingan A, C, dan AC Fusion)

---

## Isi Setiap Paket Aset

Setiap folder paket (`package-a` dan `package-c`) dilengkapi:

1. **Simbol Master (SVG):**
   * Cobalt resmi (`#1E66FF`)
   * Dark Slate (`#0F172A`)
   * Solid Black (`#000000`)
   * Solid White / Reversed (`#FFFFFF`)
   * Square Avatar (256×256 px)
   * Favicon SVG
   * App Icon Tile (Simbol putih di atas squircle Cobalt)

2. **Lockup Horizontal (SVG + PNG 600px):**
   * Versi Warna resmi (Simbol Cobalt + Wordmark Slate)
   * Versi Monokrom Slate
   * Versi Hitam
   * Versi Putih (untuk dark theme/preview modal)

3. **Lockup Bertumpuk / Stacked (SVG + PNG 320px):**
   * Format bujur sangkar (320×320 px) untuk splash screen, poster, atau kartu media sosial.

4. **Paket Ikon Web & PWA Lengkap:**
   * `favicon.ico` (multi-resolution 16/32/48 px)
   * `favicon-16.png`, `favicon-32.png`, `favicon-48.png`
   * `apple-touch-icon.png` (180×180 px)
   * `icon-192.png`, `icon-512.png`
   * `maskable-512.png`
   * `site.webmanifest`
   * `head-snippet.html`

5. **Panduan Merek (Brand Guidelines):**
   * `GUIDELINES.md` di masing-masing folder paket memuat aturan spasi aman (*clear space*), ukuran minimum, kode warna hex/rgb, dan aturan pantangan (*misuse rules*).

---

## Panduan Penerapan Cepat ke Proyek Cevee

Jika ingin mengaktifkan salah satu paket (misalnya Paket A) ke dalam aplikasi:

1. **Favicon Browser (`index.html`):**
   Ganti favicon SVG inline pada `index.html`:
   ```html
   <link rel="icon" type="image/svg+xml" href="/logo/favicon.svg" />
   <link rel="icon" type="image/x-icon" href="/logo/favicon.ico" />
   <link rel="apple-touch-icon" href="/logo/apple-touch-icon.png" />
   ```
2. **Navbar (`src/components/Navbar.tsx`) & Dashboard (`src/components/ResumeDashboard.tsx`):**
   Ganti placeholder `FileText` generik dengan komponen SVG logo atau mengimpor file `cevee-symbol-cobalt.svg` / `cevee-horizontal-color.svg`.
