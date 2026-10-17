# Spesifikasi Format Teks & Tata Letak Output PDF Cevee

Dokumen ini mendokumentasikan secara rinci arsitektur tata letak (*layout*), tipografi, hierarki visual, margin, spasi paragraf, dan aturan cetak vektor untuk hasil ekspor PDF (dan pratinjau 1:1) pada aplikasi **Cevee**.

Sumber kebenaran kode (*single source of truth*):
- `src/index.css`
- `src/components/PaginatedResumeView.tsx`
- `src/data/layouts.ts`
- `src/types/resume.ts`
- `SRS.md`

---

## 1. Dimensi Kertas & Margin Lembar (Page Geometry)

Output PDF Cevee menggunakan media cetak native browser (`window.print()` + CSS `@page`) yang merender lembar fisik A4 berbasis vektor murni tanpa kompresi raster.

| Properti | Nilai | Keterangan / Kode CSS |
|---|---|---|
| **Ukuran Kertas** | `210mm × 297mm` (A4 Portrait) | `@page { size: 210mm 297mm; margin: 0; }` |
| **Padding Atas (Top Margin)** | `10mm` (~37.8px pada 96 DPI) | `.a4-page-sheet { padding-top: 10mm; }` |
| **Padding Samping (Left / Right)** | `13mm` (~49.1px pada 96 DPI) | `.a4-page-sheet { padding-left: 13mm; padding-right: 13mm; }` |
| **Padding Bawah (Bottom Margin)** | `12mm` (~45.4px pada 96 DPI) | `.a4-page-sheet { padding-bottom: 12mm; }` |
| **Lebar Konten Efektif (Printable Width)** | `184mm` (~695.4px pada 96 DPI) | `210mm - (2 × 13mm) = 184mm` |
| **Tinggi Konten Efektif (Printable Height)** | `275mm` (~1039.4px pada 96 DPI) | `297mm - 10mm - 12mm = 275mm` |
| **Batas Aman Paginasi (Threshold)** | `1020px` | `PAGE_CONTENT_MAX_HEIGHT_PX = 1020` di `PaginatedResumeView.tsx` |
| **Jarak Antar Halaman di Layar (Preview)** | `48px` | `marginBottom: '48px'` (hanya di preview layar) |
| **Warna Latar Lembar** | `#ffffff` (Putih) | `background: white !important;` |
| **Color Adjustment Mode** | `exact` | `-webkit-print-color-adjust: exact; print-color-adjust: exact;` |

---

## 2. Tipografi Global (Global Typography)

Semua lembar cetak (`.a4-page-sheet`), kanvas editor (`.resume-a4-page`), kontainer kalkulasi (`.a4-measure-container`), serta seluruh elemen di dalam media cetak menggunakan konfigurasi font terpadu:

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
```

### Karakteristik Tipografi Dasar:
- **Font Primer:** `Inter` (Google Fonts, bobot 400, 500, 600, 700).
- **Ukuran Dasar (Base Font Size):** `7.75pt` (~10.33px).
- **Line Height Dasar (Base Leading):** `1.48` (~15.3px – 15.5px).
- **Warna Teks Utama:** `#111827` / `#0f172a` (`text-slate-900`) dan `#1e293b` (`text-slate-800`).
- **Warna Teks Sekunder/Lokasi:** `#334155` (`text-slate-700`).
- **Warna Teks Placeholder (Contoh / Disabled):** `#94a3b8` (`text-slate-400`).

---

## 3. Detail Formatting Per Komponen

### 3.1 Header Dokumen

Cevee menyediakan 2 varian preset layout untuk header:

#### A. Preset `standard-ats-v1` (Standard Single-Column ATS; legacy: `classic-ats`)
- **Kontainer:** `text-center mb-2 pb-0.5`
- **Nama Lengkap (`<h1>`):**
  - Font Size: `17pt` (~22.67px)
  - Font Weight: `700` (`font-bold`)
  - Letter Spacing: `tracking-tight` (-0.025em / ~-0.56px)
  - Line Height: `leading-tight` (1.25)
  - Margin Bawah: `mb-0.5` (~2px)
  - Warna: `text-slate-900` (`#0f172a`)
- **Headline / Roles (Opsional):**
  - Font Size: `8.5pt` (~11.33px)
  - Font Weight: `400` (`font-normal`)
  - Letter Spacing: normal
  - Line Height: `leading-tight` (1.25)
  - Margin Bawah: `mb-1` (~4px)
  - Pemisah Role: ` | ` (spasi-pipa-spasi)
  - Warna: `text-slate-800` (`#1e293b`)
- **Baris Kontak & Tautan Portofolio:**
  - Font Size: `8.5pt` (~11.33px)
  - Font Weight: `400` (`font-normal`)
  - Line Height: `leading-tight` (1.25)
  - Layout: `flex flex-wrap items-center justify-center gap-x-1`
  - Pemisah Item: `•` (dot separator)
  - Tautan Portofolio & Email: `underline text-slate-800`
  - WhatsApp Link: otomatis dikonversi dari nomor telepon (`https://wa.me/kode_negara_nomor`)
  - Status Relokasi: `(Willing to relocate)`
  - Warna Teks: `text-slate-700` (`#334155`)

#### B. Preset `modern-photo` (Photo Header • Single Column)
- **Kontainer:** `mb-2.5 pb-0.5`
- **Tata Letak:** `flex items-center gap-4 text-left`
- **Bingkai Foto Profil:**
  - Rasio: `3:4` (Portrait Frame)
  - Dimensi: `66px × 88px` (desktop), `72px × 96px` (sm up)
  - Border: `1px solid #cbd5e1` (`border-slate-300`)
  - Border Radius: `rounded-sm` (2px)
  - Kompresi Gambar: HTML5 Canvas center-crop `300 × 400 px` target ~25–40 KB.
- **Blok Teks Kanan (Rata Kiri):**
  - Nama Lengkap (`<h1>`): `text-[17pt] font-bold tracking-tight mb-0.5 leading-tight text-slate-900`
  - Roles: `text-[8.5pt] font-normal leading-tight mb-1 text-slate-800`
  - Kontak & Tautan: `text-[8.5pt] flex flex-wrap items-center justify-start gap-x-1 leading-tight text-slate-700`

---

### 3.2 Judul Section & Garis Pembatas (Section Headers & Dividers)

- **Kontainer Pembatas:** `.resume-section-divider`
  - Border Bawah: `border-b-[0.5px] border-slate-900` (Hairline 0.5px)
  - Padding Bawah: `pb-0.5` (~2px)
  - Margin Atas: `mt-2.5` (~10px), khusus section pertama `first:mt-0.5` (~2px)
  - Margin Bawah: `mb-1.5` (~6px)
  - Aturan Cetak CSS: `border-bottom: 0.5px solid #0f172a !important;`
- **Teks Judul (`<h2>`):**
  - Font Size: `8.5pt` (~11.33px)
  - Font Weight: `700` (`font-bold`)
  - Text Transform: `uppercase`
  - Letter Spacing: `tracking-wider` (+0.05em / ~+0.57px)
  - Warna: `text-slate-900` (`#0f172a`)

---

### 3.3 Summary Section

- **Kontainer:** `mb-1` (~4px)
- **Perataan Teks:** `text-justify` (Rata Kiri-Kanan)
- **Font Size:** `7.75pt` (~10.33px) `!important`
- **Line Height:** `1.48` (~15.3px) `!important`
- **Font Weight:** `400` (`font-normal`), mendukung tag `<b>` / `<strong>` bobot `700`
- **Margin Bawah Paragraf:** `0 !important`
- **Warna Teks:** `text-slate-800` (`#1e293b`)
- **Kapasitas Rata-rata:** ~135 karakter per baris pada lebar lembar 184mm (menghasilkan susunan 3 baris padat sesuai standar ATS).

---

### 3.4 Skills Section

- **Kontainer per Kategori:** `text-slate-800 leading-snug`
- **Margin Bawah per Kategori:**
  - Kategori reguler: `mb-0.5` (~2px)
  - Kategori terakhir dalam section: `mb-2` (~8px)
- **Label Kategori:**
  - Font Size: `7.75pt`
  - Font Weight: `700` (`font-bold`)
  - Line Height: `leading-snug` (1.375)
  - Warna: `text-slate-900` (`#0f172a`)
- **Daftar Skill Items:**
  - Font Size: `7.75pt`
  - Font Weight: `400` (`font-normal`)
  - Line Height: `leading-snug` (1.375)
  - Warna: `text-slate-800` (`#1e293b`)

---

### 3.5 Experience Section (Pengalaman Kerja / Organisasi)

#### Kasus A: Posisi Tunggal per Perusahaan
- **Baris 1 (Header Item):**
  - Tata Letak: `flex justify-between items-baseline leading-snug`
  - **Role / Posisi:** Font size `7.75pt`, Font weight `700` (`font-bold`), warna `text-slate-900`
  - **Periode:** Font size `7.75pt`, Font weight `600` (`font-semibold`), warna `text-slate-800`
- **Baris 2 (Sub-header Item):**
  - Tata Letak: `flex justify-between items-baseline leading-snug text-[8pt]`
  - **Nama Perusahaan:** Font size `8pt` (~10.67px), Font weight `600` (`font-semibold`), warna `text-slate-800`
  - **Lokasi:** Font size `8pt` (~10.67px), Font weight `400` (`font-normal`), warna `text-slate-700`
- **Poin Pencapaian (Bulleted List):**
  - Jarak ke baris atas (bullet pertama): `mt-0.5` (~2px)
  - Jarak ke item berikutnya (bullet terakhir): `mb-2` (~8px)
  - Tata letak & bullet: lihat [Bagian 4](#4-aturan-bulleted-list--daftar-poin).

#### Kasus B: Promosi / Multi-Posisi dalam Satu Perusahaan
- **Baris Induk Perusahaan (Company Header):**
  - Tata Letak: `flex justify-between items-baseline leading-snug`
  - Nama Perusahaan: `font-bold text-slate-900 text-[8pt]`
  - Lokasi: `text-slate-700 text-[8pt]`
- **Sub-Header Tiap Posisi:**
  - Margin Atas: posisi pertama `mt-0.5` (~2px), posisi berikutnya `mt-1.5` (~6px)
  - Role: `font-semibold text-slate-900 text-[7.75pt]`
  - Periode: `font-semibold text-slate-800 text-[7.75pt]`
- **Poin Pencapaian:** Mengikuti aturan bullet list; margin bawah `mb-2` hanya pada butir terakhir dari posisi terakhir.

---

### 3.6 Projects Section

- **Baris 1 (Project Header):**
  - Tata Letak: `flex justify-between items-baseline font-bold text-slate-900 leading-snug`
  - **Nama Proyek:** Font size `7.75pt`, Font weight `700` (`font-bold`), warna `text-slate-900`
  - **Tautan Eksternal (Jika Ada):**
    - Layout: `inline-flex items-center gap-1`
    - Ikon: Lucide `ExternalLink`, ukuran `11px`, opacity `0.8` (hover: 1.0)
    - Teks: bergaris bawah saat hover (`hover:underline`)
  - **Periode:** Font size `7.75pt`, Font weight `600` (`font-semibold`), warna `text-slate-800`
- **Poin Pencapaian (Bulleted List):**
  - Jarak atas: `mt-0.5` (~2px)
  - Jarak bawah item: `mb-2` (~8px)

---

### 3.7 Education Section

- **Baris 1 (Gelar & Periode):**
  - Tata Letak: `flex justify-between items-baseline font-bold text-slate-900 leading-snug`
  - **Gelar (Degree):** Font size `7.75pt`, Font weight `700` (`font-bold`), warna `text-slate-900`
  - **Periode:** Font size `7.75pt`, Font weight `600` (`font-semibold`), warna `text-slate-800`
- **Baris 2 (Institusi & Nilai/IPK):**
  - Tata Letak: `flex justify-between items-baseline text-slate-800 leading-snug text-[8pt]`
  - **Nama Institusi:** Font size `8pt`, Font weight `400` (`font-normal`), warna `text-slate-800`
  - **GPA / IPK:** Font size `8pt`, Font weight `500` (`font-medium`), warna `text-slate-800`
- **Deskripsi / Catatan Pendidikan:**
  - Format paragraf / bullet: `text-[7.75pt] leading-[1.48] text-slate-800`
  - Jarak atas: `mt-0.5` (~2px)
  - Jarak bawah: `mb-1.5` (~6px)

---

### 3.8 Custom Sections

#### A. Sertifikasi (Certifications)
- **Baris Konten:** `flex justify-between items-baseline leading-snug text-[7.75pt] mb-1.5`
- **Judul Sertifikat:** `font-bold`
- **Credential ID:** `font-bold` dengan format `(Credential ID: [ID])`
- **Penerbit:** `by <font-bold>Nama Penerbit</font-bold>`
- **Periode / Validitas:** `text-[7.75pt] font-bold text-slate-900 whitespace-nowrap ml-4`
- **Tautan Verifikasi:** Jika URL ada, teks dibungkus tag `<a>` warna `text-slate-900`

#### B. Bahasa (Languages)
- **Baris Konten:** `text-slate-800 text-[7.75pt] leading-snug mb-1.5`
- **Nama Bahasa:** `font-bold text-slate-800`
- **Tingkat Kemahiran:** `(${subtitle})` (contoh: `(Native proficiency)`)

#### C. Referensi (References)
- **Baris Konten:** `text-slate-800 text-[7.75pt] leading-snug mb-1.5`
- **Nama Referensi:** `font-bold`
- **Jabatan & Kontak:** `(${subtitle}) • ${period}`

#### D. Publikasi, Penghargaan, dan Kustom Lainnya
- **Header Line:** `flex justify-between items-baseline font-bold leading-snug`
  - Judul: `font-bold text-slate-900`
  - Periode: `text-[7.75pt] font-semibold text-slate-800`
- **Deskripsi:** `text-slate-800 text-[7.75pt] leading-relaxed mt-0.5 mb-2`

---

## 4. Aturan Bulleted List & Daftar Poin

Cevee menggunakan aturan CSS murni berprioritas tinggi (`!important`) untuk menjamin poin pencapaian (*bullet list*) tidak pernah terpotong, hilang bullet glyph-nya, atau terpengaruh oleh CSS reset browser:

```css
/* Styling Universal Bullet List untuk Preview & Cetak PDF */
.a4-page-sheet ul,
.resume-a4-page ul,
.a4-measure-container ul,
.resume-bullet-list,
.ProseMirror ul {
  list-style-type: disc !important;
  margin-left: 1.25rem !important;  /* 20px */
  padding-left: 0.1rem !important;  /* 1.6px */
  margin-top: 0.15rem !important;   /* 2.4px */
  margin-bottom: 0.15rem !important;/* 2.4px */
  font-size: 7.75pt !important;
  line-height: 1.48 !important;
}

.a4-page-sheet li,
.resume-a4-page li,
.a4-measure-container li,
.resume-bullet-list li,
.ProseMirror li {
  list-style-type: disc !important;
  display: list-item !important;
  margin-bottom: 0.12rem !important; /* 1.92px */
  padding-left: 0.1rem !important;   /* 1.6px */
  font-size: 7.75pt !important;
  line-height: 1.48 !important;
}
```

### Mekanisme Split-Bullet (Paginasi Lintas Halaman)
Ketika sebuah item pekerjaan memiliki banyak poin pencapaian, engine pemecah memisahkan tiap `<li>` menjadi blok mandiri (`.resume-bullet-single`) sehingga halaman tidak menyisakan ruang kosong besar saat mencapai dasar lembar:
- `margin-top: 0 !important;`
- `margin-bottom: 0 !important;`
- `li { margin-bottom: 0 !important; }`
- Teks butir diformat rata kiri-kanan (`text-justify`).

---

## 5. Ringkasan Matriks Tipografi & Ukuran Teks

| Elemen Antarmuka | Ukuran Font (pt / px) | Bobot (Weight) | Tracking (Letter Spacing) | Line Height (Leading) | Margin Bawah |
|---|---|---|---|---|---|
| **Nama Kandidat (`h1`)** | `17pt` (~22.67px) | `700` (Bold) | `tracking-tight` (-0.025em) | `1.25` (`leading-tight`) | `mb-0.5` (~2px) |
| **Headline / Roles** | `8.5pt` (~11.33px) | `400` (Normal) | normal | `1.25` (`leading-tight`) | `mb-1` (~4px) |
| **Baris Kontak & Tautan** | `8.5pt` (~11.33px) | `400` (Normal) | normal | `1.25` (`leading-tight`) | `0` |
| **Judul Section (`h2`)** | `8.5pt` (~11.33px) | `700` (Bold) | `tracking-wider` (+0.05em) | `1.0` (Uppercase) | `mb-1.5` (~6px) |
| **Paragraf Summary** | `7.75pt` (~10.33px) | `400` (Normal) | normal (Justified) | `1.48` (~15.3px) | `0` |
| **Nama Perusahaan / Institusi** | `8pt` (~10.67px) | `600` (Semibold) | normal | `1.375` (`leading-snug`) | `0` |
| **Posisi / Role Pekerjaan** | `7.75pt` (~10.33px) | `700` / `600` | normal | `1.375` (`leading-snug`) | `0` |
| **Periode / Tanggal** | `7.75pt` (~10.33px) | `600` (Semibold) | normal | `1.375` (`leading-snug`) | `0` |
| **Label Kategori Skill** | `7.75pt` (~10.33px) | `700` (Bold) | normal | `1.375` (`leading-snug`) | `mb-0.5` (~2px) |
| **Poin Bullet / Deskripsi** | `7.75pt` (~10.33px) | `400` (Normal) | normal (Justified) | `1.48` (~15.5px) | `0.12rem` / `0` |
| **Sertifikasi / Bahasa** | `7.75pt` (~10.33px) | `700` / `400` | normal | `1.375` (`leading-snug`) | `mb-1.5` (~6px) |

---

## 6. Mesin Paginasi & Aturan Pemisah Halaman (Pagination Engine)

Paginasi Cevee diatur secara deterministik oleh komponen `PaginatedResumeView.tsx`:

1. **Anti-Orphan Protection (Pencegahan Judul Melayang):**
   - Blok judul section (`section-title`), header posisi (`item-head`), dan sub-header promosi (`item-subhead`) **dilarang keras** berada sendirian di dasar lembar tanpa konten di bawahnya.
   - Algoritma menghitung: jika `tinggi_sekarang + tinggi_header + tinggi_konten_berikutnya > 1020px`, maka blok header otomatis didorong bersama kontennya ke halaman baru.
2. **Kalkulasi 2 Lapis (Two-Layer Measurement):**
   - **Lapis Heuristik:** Estimasi awal berbasis karakter per baris (92–95 karakter/baris untuk list, 135 karakter/baris untuk ringkasan).
   - **Lapis DOM Nyata (`useLayoutEffect`):** Kontainer ukur tersembunyi berlebar pasti `184mm` membaca `getBoundingClientRect().height` nyata dari rendering engine browser, termasuk penambahan margin aktual (`marginTop + marginBottom`).
3. **Pemisahan Halaman Cetak (`@media print`):**
   ```css
   .a4-page-sheet {
     page-break-after: always !important;
     break-after: page !important;
     page-break-inside: avoid !important;
     break-inside: avoid !important;
     box-shadow: none !important;
     border: none !important;
   }
   .a4-page-sheet:last-child {
     page-break-after: auto !important;
     break-after: auto !important;
   }
   ```
4. **Isolasi Cetak Vektor & Anti-Artefak:**
   - Semua elemen UI aplikasi (`navbar`, modal, tombol, tools editor, container ukur) disembunyikan menggunakan `display: none !important`.
   - Ekstensi pihak ketiga (audio player, reader mode, translasi) ditekan penuh melalui selektor `body > *:not(#root) { display: none !important; left: -99999px !important; }`.
   - Seluruh filter grafis, bayangan (`box-shadow`), teks bayangan (`text-shadow`), dan efek raster dinonaktifkan sehingga file PDF hasil unduh adalah teks biner vektor yang 100% terbaca oleh ATS (*Applicant Tracking Systems*).
