# Software Requirements Specification (SRS)
# Project: Cevee (Personal CV Generator)

**Dokumen Versi:** 1.46.0  
**Status:** Approved  
**Model Operasional:** 100% Free-Tier (Zero Cost)  
**Target Platform:** Web (Responsive: Desktop, Tablet & Mobile)  
**Default Language:** Web UI English (US) · Per-Resume Language English (`en`) / Bahasa Indonesia (`id`)

---

> ### ⚠️ MANDAT PATEN PENGEMBANGAN (AUTOMATIC AGENT SYNC PROTOCOL)
> **ATURAN MUTLAK BAGI AI AGENT / DEVELOPER:**
> 1. **Auto-Update Tanpa Perintah Tambahan:** Setiap kali pengguna memberikan instruksi baru, modifikasi fitur, penyesuaian layout/styling, atau perubahan arsitektur, AI Agent **WAJIB** secara proaktif langsung memperbarui dokumen `SRS.md` ini pada giliran kerja (turn) tersebut tanpa menunggu pengguna meminta/mengingatkan kembali.
> 2. **Single Source of Truth:** Dokumen ini adalah acuan mutlak. Kode program dan dokumen ini tidak boleh memiliki diskrepansi (*zero drift*). Setiap perubahan kode yang disetujui harus langsung tercatat di sini.

---

## 1. PENDAHULUAN

### 1.1 Tujuan Dokumen
Dokumen ini mendefinisikan spesifikasi kebutuhan perangkat lunak lengkap untuk sistem **Cevee**, aplikasi pembuat Curriculum Vitae (CV) modern berbasis in-place editor (WYSIWYG) dengan kendali penuh di sisi pengguna, dukungan multi-CV, dan arsitektur tanpa biaya operasional (Rp 0). Dokumen ini berfungsi sebagai acuan tunggal (*single source of truth*) dalam pengembangan kode dan konteks agen AI.

### 1.2 Lingkup Produk
Cevee memungkinkan pengguna:
1. Membuat, mengelola, menduplikasi, dan menghapus banyak CV dalam satu akun.
2. Mengedit teks langsung di atas kanvas format standar A4 (in-place WYSIWYG) dengan margin padat standar ATS (`10mm` atas, `13mm` samping) dan tipografi konten presisi seragam `7.75pt`.
3. Header adaptif dengan baris Role / Headline opsional yang dapat diisi atau disembunyikan bebas, serta tautan portofolio bergaris bawah (*underlined*).
4. Section Summary tanpa judul "SUMMARY" bawaan yang langsung tampil di bawah kontak dengan format rata kiri-kanan (*justify*) dan tipografi presisi `7.75pt` (menghasilkan susunan 3 baris padat sesuai standar referensi).
5. Melakukan format teks kaya (Bold, Italic, Underline, Link, Bulleted List).
6. Menyesuaikan nama judul setiap section secara bebas (tidak terkunci pada nama bawaan).
7. Menambah section preset maupun section kustom buatan sendiri.
8. Mengatur urutan section (naik/turun) dan menghapus section yang tidak diperlukan.
9. Pratinjau dokumen (PDF Live Preview) yang mencerminkan 1:1 bentuk PDF asli sebelum dicetak/diunduh, lengkap dengan indikator pemisah halaman A4.
10. Mengunduh CV langsung dalam format file `.pdf` dengan penamaan file otomatis dan kualitas vektor bersih.
11. Menyimpan data otomatis ke database Supabase dan cadangan lokal `localStorage`.
12. Mengedit CV secara penuh dari perangkat mobile (tata letak responsif penuh tanpa *horizontal scroll*), dengan kanvas A4 yang mengalir ulang sesuai lebar layar di bawah ambang `900px`.
13. Memilih format layout saat membuat CV baru dan mengganti layout secara fleksibel langsung dari kanvas editor dengan preservasi konten 100%.
14. Memilih dan mengganti bahasa dokumen resume per-CV (`English` / `Bahasa Indonesia`) tanpa mengubah bahasa antarmuka aplikasi web (yang tetap English US).
15. Melacak lamaran kerja melalui fitur **Job Tracker** terintegrasi (tampilan Kanban Board & List View), menautkan versi CV spesifik ke setiap lamaran, menduplikasi & menyesuaikan CV dengan 1 klik (*Duplicate & tailor copy*), serta mencocokkan kata kunci *Job Description* secara lokal (*Zero-Cost Local JD Keyword Matcher*) maupun melalui Cevee MCP Server.

### 1.3 Batasan Biaya & Keamanan Infrastruktur AI (Strict Constraints)
- **Zero Cost (Rp 0):** Seluruh infrastruktur wajib berjalan di tingkat gratis permanen (*free tier*) tanpa kewajiban kartu kredit (Supabase, Vercel Serverless, Google AI Studio / Gemini API free tier).
- **Keamanan Kunci AI (Private Serverless Proxy):** Fitur import dan ekstraksi resume PDF menggunakan Google Gemini API via Vercel Serverless Function (`/api/parse-resume`). Kunci API (`GEMINI_API_KEYS`) disimpan secara privat di server environment variable tanpa prefix publik framework (`VITE_`), sehingga 100% terlindung dari kebocoran ke browser publik.

---

## 2. ARSITEKTUR & STACK TEKNOLOGI

### 2.1 Ringkasan Teknologi

| Layer | Komponen / Pustaka | Versi / Keterangan |
|---|---|---|
| **Build & Runtime** | Vite + React (TypeScript) | Fast bundling, static SPA, strict type checking |
| **Styling** | Tailwind CSS | Utility-first styling + print media rules |
| **UI Components** | shadcn/ui + Radix UI | Komponen aksesibel headless (Dropdown, Dialog, Tooltip, Input, Button) |
| **Rich Text Editor** | Tiptap (`@tiptap/react`, `@tiptap/starter-kit`) | Headless in-place rich text editing |
| **Sanitasi HTML** | DOMPurify | Sanitasi XSS konten rich text & markup dokumen |
| **Icons** | Tabler Icons (`@tabler/icons-react`) | Ikon antarmuka presisi, minimalis, dan konsisten (https://tabler.io/icons) |
| **Fonts** | `@fontsource/inter` + `@fontsource/arimo` | WOFF2 statis self-hosted (bebas CDN; substet Type0 saat cetak PDF) |
| **Backend & DB** | Supabase (PostgreSQL 15+) | Autentikasi email, database JSONB, Row Level Security (RLS) |
| **PDF Engine** | Native Print Engine (`window.print()` + CSS `@page`) | Cetak vektor PDF presisi A4 tanpa watermark |
| **AI Resume Parser** | Google Gemini API via Vercel Serverless (`/api/parse-resume`) | Proxy serverless privat, multi-key rotation, 429 quota fallback, zero key leak |
| **Code Quality** | ESLint 10 + Prettier | Flat config strict typing, hooks check, & automated lint |
| **Deployment** | Vercel (SPA rewrites + Serverless Functions) | Hosting static web gratis + runtime API |

### 2.2 Diagram Alur Arsitektur

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                            Browser Client (SPA)                             │
│                                                                             │
│  ┌──────────────────┐  ┌───────────────────────┐  ┌──────────────────────┐  │
│  │ CV Manager       │  │ In-Place A4 Editor    │  │ 1:1 PDF Live Preview │  │
│  │ (Switch/CRUD CV) │  │ - Inline Fields       │  │ - Exact Print CSS    │  │
│  └────────┬─────────┘  │ - Tiptap Rich Text    │  │ - A4 Page Split Line │  │
│           │            │ - Hover Controls      │  │ - Zoom Controls      │  │
│           ▼            └──────────┬────────────┘  └──────────┬───────────┘  │
│  ┌──────────────────┐             │                          │              │
│  │ State Store      │◄────────────┴──────────────────────────┘              │
│  │ (Debounced Sync) │                                                       │
│  └────────┬─────────┘                ┌───────────────────────────────────┐  │
│           │                          │ Action: Download PDF              │  │
│           │                          │ - File: [Name]_[Title].pdf        │  │
│           │                          │ - Zero watermark, vector text     │  │
│           │                          └─────────────────┬─────────────────┘  │
└───────────┼────────────────────────────────────────────┼────────────────────┘
            │                                            │
    (Auto-save / Sync)                             (Render & Print)
            ▼                                            ▼
┌─────────────────────────┐                ┌───────────────────────────────┐
│ Supabase Cloud          │                │ Native Print Engine / PDF.js  │
│ - Auth (JWT)            │                │ @page size: A4 portrait       │
│ - PostgreSQL (JSONB)    │                │ Output: Pure Vector PDF (A4)  │
│ - Free Tier (No CC)     │                └───────────────────────────────┘
└─────────────────────────┘
```

---

## 3. PERSYARATAN FUNGSIONAL (FUNCTIONAL REQUIREMENTS)

### 3.1 FR-1: Autentikasi & Akun Pengguna
- **FR-1.1:** Pengguna dapat mendaftar dan masuk menggunakan email & kata sandi via Supabase Auth.
- **FR-1.2:** Sistem menyediakan mode tamu (*Guest / Offline Mode*) menggunakan `localStorage` jika pengguna belum masuk.
- **FR-1.3:** Saat masuk, data lokal dapat dimigrasi ke akun cloud Supabase pengguna.
- **FR-1.4 (Password Strength Meter):** Pada form pendaftaran (*Sign up*), input password dilengkapi komponen visual `PasswordStrength` (Pillow Light) dengan 4 bar segmen evaluasi kekuatan kata sandi, deteksi pola mudah ditebak (*commonly guessed*), dan checklist kriteria keamanan dinamis (minimal 8 karakter, huruf besar & kecil, angka, dan karakter khusus).

### 3.2 FR-2: Manajemen Multi-CV & Resume Dashboard
- **FR-2.1 (Resume Dashboard & Default Landing View):**
  - **Halaman Awal:** Saat pengguna membuka aplikasi, pengguna pertama kali diarahkan ke halaman **Resume Dashboard** (`ResumeDashboard`) yang menampilkan daftar seluruh CV yang dimiliki sebelum memasuki kanvas kustomisasi.
  - **Kartu Resume Terstruktur:** Setiap resume ditampilkan dalam kartu informatif memuat judul CV, nama kandidat, tanggal pembaruan terakhir (`relativeTime` — "Updated 2 hours ago"), jumlah section, serta tombol aksi cepat: *Edit resume* (membuka editor kanvas), *Quick Preview* (modal pratinjau instan), dan menu tiga titik berisi *Rename resume* (inline, langsung tersimpan), *Duplicate resume*, *Download PDF*, dan *Delete resume*. Pada tampilan daftar (*list view*), kolom *Actions* menyediakan tombol mata (*Quick preview*) dan menu tiga titik yang sama.
  - **Thumbnail Konten Nyata (Real-Content Thumbnail):** Kartu dashboard merender halaman 1 dari konten resume sungguhan dengan tipografi dan geometri layout masing-masing (`ResumeContentThumbnail`), menggantikan wireframe SVG statis. Konten mendukung rich text, foto profil, dan skala A4 aslinya.
  - **Kondisi Kosong (Icon Stack Empty State - Pillow Light):** Jika pengguna belum memiliki resume sama sekali (0 resume), dashboard menampilkan kartu terstruktur berorientasi masa depan (`ResumeEmptyState`):
    - Komposisi bertumpuk tiga lapis (*Icon Stack*) dengan kartu primer berikon dokumen, garis mini resume, lencana sparkle, dan tombol plus, diapit kartu bayangan bersudut miring dan latar ambient radial glow.
    - Judul: *"Create your first resume"*
    - Penjelasan: *"Choose an ATS-friendly layout, import an existing PDF, or start with a clean template."*
    - Tombol primer: *"Create resume"* dengan ikon `Plus` dan bayangan `shadow-pillow-primary`.
    - Eliminasi teks pajangan: Baris centang redundan dihilangkan agar layout bersih dan bebas dari visual noise / AI slop.
  - **Navigasi Antar Halaman:** Di kanvas editor, pengguna dapat kembali ke halaman Dashboard kapan saja melalui logo Cevee atau tombol navigasi *"Dashboard"* di bilah navbar atas.
- **FR-2.2 (Create New Resume & Pre-Creation Layout Selection):**
  - **Alur Pemilihan Layout:** Saat pengguna membuat CV baru (baik melalui tombol *"Create Resume"* di dashboard, *"Start Building Resume"* di empty state, maupun tombol `+` di navbar), sistem menampilkan dialog/modal pemilihan layout terlebih dahulu (`LayoutSelectModal`) sebelum dokumen dibuat.
  - Pengguna memilih format layout (baseline: `standard-ats-v1`) lalu menekan konfirmasi untuk menginisialisasi dokumen dengan layout tersebut.
  - **Struktur Standar Bawaan:** Sistem menginisialisasi dokumen dengan struktur standar referensi:
    1. **Layout ID:** `standard-ats-v1` (Standard Single-Column ATS; ID legacy `classic-ats` tetap diterima via normalisasi).
    2. **Header:** 'Your Name', 'City, State/Country', 'email@address.com', '+65 1234 5678', serta 3 tautan portofolio (`linkedin.com/in/your_linkedin`, `github.com/username`, `otherlink.com`).
    3. **Urutan Section Bawaan:** Summary (tanpa judul), WORK EXPERIENCE, EDUCATION, PROJECTS, SKILLS.
    4. **Warna Teks Acuan:** Seluruh teks pada dokumen baru dimulai dalam status placeholder berwarna abu-abu redup (`text-slate-400`).
    5. **Formulir Kosong Saat Edit:** Saat pengguna mengklik untuk mengedit header maupun section, seluruh kolom input dimulai dalam keadaan kosong (`value=""`) dengan panduan di atribut `placeholder`.
- **FR-2.3 (Duplicate):** Pengguna dapat menduplikasi CV yang sudah ada untuk membuat variasi CV (misal: "CV - Product Designer" dan "CV - Frontend Dev").
- **FR-2.4 (Rename):** Pengguna dapat mengubah nama internal dokumen CV.
- **FR-2.5 (Delete & Danger Prevention Modal via React Portal):**
  - Seluruh tindakan penghapusan CV (dari dashboard maupun navbar dropdown) dan penghapusan section pada editor dilindungi modal pencegahan khusus (`ConfirmDialog`) menggantikan dialog browser native.
  - **Portal Stacking-Context Elimination:** Seluruh modal `ConfirmDialog` dirender menggunakan `ReactDOM.createPortal` langsung ke `document.body` dengan z-index `z-[9999]`. Ini mengeliminasi bug CSS stacking context di mana modal sebelumnya terperangkap di dalam batas header bernavigasi `backdrop-blur`.
  - **Click-Outside & Dismissal Resilient:** Dropdown pemilih CV di Navbar dilengkapi backdrop transparan (`fixed inset-0 z-40`) yang stabil, menghilangkan efek glitch penutupan prematur dari event `onMouseLeave`, sehingga tombol *Delete Resume* dapat diklik dengan responsif dan memunculkan modal di tengah layar penuh.
  - Dialog modal memuat ikon peringatan segitiga merah (`AlertTriangle bg-red-50 text-red-600`), judul spesifik dengan nama objek, penjelasan konsekuensi permanen, tombol penolakan berorientasi verba (`Keep Resume` / `Keep Section`), dan tombol destruktif primer (`Delete Resume` / `Delete Section`).
  - Mendukung navigasi keyboard: tombol `Escape` untuk membatalkan dialog serta penguncian scroll latar belakang (`overflow: hidden`) saat modal aktif.
- **FR-2.6 (Switch Active):** Pengguna dapat berpindah dari satu CV ke CV lain tanpa me-refresh halaman.
- **FR-2.7 (UX Writing & Microcopy Standards):** Seluruh tombol aksi, tooltip, status indikator, dialog modal konfirmasi, pesan kesalahan autentikasi, serta placeholder input pada seluruh section distandarisasi 100% ke bahasa Inggris (English US) profesional yang ringkas, berorientasi tindakan (*verb-oriented*), dan konsisten tanpa residu teks multibahasa. Teks dialog penghapusan disesuaikan agar akurat untuk lingkungan penyimpanan lokal maupun akun cloud.
- **FR-2.8 (Thumbnail Halaman 1 via Mesin Paginasi Nyata):**
  - **Prinsip Utama Single-Page Thumbnail:** Seluruh thumbnail/pratinjau layout resume pada halaman daftar resume (`ResumeDashboard`), baik pada mode tampilan kartu (*Grid view*) maupun baris tabel (*List view*), **WAJIB HANYA merender Halaman 1 (`pages[0]`)** dari resume tersebut. Sistem DILARANG merender seluruh isi resume atau membiarkan konten halaman 2, 3, dst. tumpah (*overflow*) atau termampatkan ke dalam satu lembar thumbnail.
  - **Arsitektur Paginasi Identik:** `ResumeContentThumbnail` menggunakan pipeline paginasi yang sama persis dengan `PaginatedResumeView` (`runPagination` di `src/layouts/core/packing.ts`), dengan kontainer ukur 1:1 tersembunyi berlebar `geometry.contentWidth` (`a4-measure-container`) yang membaca tinggi riil DOM setiap blok secara subpixel.
  - **Sinkronisasi State & Isolasi Dimensi Fisik:**
    - State `pageOneBlocks` diinisialisasi dan diperbarui menggunakan blok halaman pertama (`runPagination(blocks, ...)[0] ?? []`).
    - Lembar A4 thumbnail (`a4-page-sheet`) dikunci secara inline pada rasio dan ukuran fisik pasti (`width: 210mm; height: 297mm; max-height: 297mm; overflow: hidden;`), dan kontainer konten dalamnya dibatasi pada `maxHeight: geometry.maxPageHeightPx` dengan `overflow: hidden`.
    - Dengan proteksi ini, thumbnail resume multi-halaman dijamin tampil presisi sebagai kover halaman 1 yang utuh (1:1 dengan halaman 1 modal pratinjau), dengan sisa ruang bawah fisik (*whitespace*) yang terkalibrasi akurat tanpa artefak tumpang tindih.

### 3.3 FR-3: In-Place Canvas & Editor (WYSIWYG)
- **FR-3.1 (A4 Container & Margin Padat):** Area kerja menampilkan lembar putih dengan rasio aspek A4 (210mm x 297mm) dengan margin padat standar ATS: `10mm` (atas), `13mm` (samping kiri-kanan), dan `12mm` (bawah) guna memaksimalkan kepadatan informasi dokumen.
  - **Perilaku Responsif Kanvas:** Pada layar dengan lebar `≤ 900px`, kelas `.resume-a4-page` melepas lebar tetap `210mm` dan mengalir ulang menjadi `width: 100%` (dengan `max-width: 210mm`, `min-height: auto`, padding `20px 16px 24px`, dan `border-radius: 14px`). Teks konten dibungkus dengan `overflow-wrap: anywhere` agar URL/email panjang tidak memicu *horizontal overflow*. Perubahan ini murni presentasional pada layar; markup cetak (`.a4-page-sheet`) dan aturan `@media print` tetap terkunci presisi 210mm x 297mm.
- **FR-3.2 (Direct Edit):** Pengguna mengedit nama, kontak, peran, tanggal, dan deskripsi langsung pada posisi teks tersebut di atas dokumen.
- **FR-3.3 (Header Section Adaptif & Form Edit):**
  - **Tampilan View Mode:**
    - Baris 1 (Nama Lengkap): Heading utama (`17pt`, bold, centered, tracking-tight).
    - Baris 2 (Multi-Role Otomatis): Kumpulan role pengguna (maksimal 4 role) yang otomatis digabungkan dengan pemisah pipa ` | ` (contoh: "UI/UX Designer | Product Designer | UX Researcher"). Sifatnya **opsional**; jika seluruh role dikosongkan pada form editor, baris ini otomatis hilang tanpa meninggalkan spasi kosong.
    - Baris 3 (Kontak & Tautan Terpadu): Baris tunggal terpadu yang memuat lokasi, status relokasi `(Willing to relocate)` (jika diaktifkan via checklist), email, nomor telepon WhatsApp, dan seluruh tautan portofolio (Portfolio, Behance, LinkedIn) pada satu baris tanpa pemisahan baris buatan, dipisahkan oleh dot separator `•`. Seluruh tautan bergaris bawah (*underline*) aktif dan dapat diklik.
    - **Otomatisasi Tautan WhatsApp:** Nomor telepon secara otomatis dikonversi menjadi tautan WhatsApp interaktif (`https://wa.me/[nomor_bersih]`). Format input lokal seperti awalan `0` secara otomatis dinormalisasi menjadi kode negara `62` (contoh: `+62 812-3456-7890` atau `081234567890` dialihkan ke `https://wa.me/6281234567890`) yang membuka obrolan WhatsApp di tab baru saat diklik.
  - **Tampilan Edit Mode Header (Standardized Card):**
    - Dibungkus dalam kontainer kartu dengan latar belakang abu-abu terang kontras (`bg-[#f8fafc] rounded-xl border border-slate-200/90 p-5 shadow-xs`).
    - Judul section `HEADER & CONTACT` dengan garis batas bawah hitam tebal.
    - Field input terstruktur dengan label bertanda bintang merah `*` untuk field wajib (`Full Name *`, `Location *`, `Email *`, `Phone Number *`).
    - **Multi-Role Inputs:** Input role dibuat berupa daftar dinamis (maksimal 4 role) dengan tombol `+ Add Role` dan tombol hapus individual per role. Pengguna tidak perlu mengetik simbol `|` secara manual.
    - **Checklist Relocation Status:** Status relokasi dikontrol via checkbox `[ ] Willing to relocate`. Jika dicentang, sistem otomatis merender `(Willing to relocate)`.
    - Pengelola tautan sosial/portofolio dilengkapi tombol hapus merah (`Trash2`) per item, tombol outline hijau `+ Add Link` di sisi kiri bawah, serta tombol aksi kanan bawah: teks hijau `Cancel` dan tombol solid hijau `Save` (`bg-emerald-500 text-white rounded-lg px-6 py-1.5`).
- **FR-3.5 (Universal Month-Year Date Picker):**
  - Seluruh field periode tanggal pada Work Experience, Projects, Education, dan Custom Section menggunakan komponen `DatePicker` kustom yang seragam (bukan `input[type=date]` native browser).
  - Input teks tetap dapat diisi manual, namun dilengkapi tombol kalender yang membuka popover pemilih bulan-tahun: navigasi tahun (`‹` / `›`), grid 12 bulan (4 kolom x 3 baris), tombol pintasan `Bulan Ini`, dan tombol `Hapus` untuk mengosongkan nilai.
  - Nilai yang dipilih disimpan dalam format konsisten `[Bulan Singkat] [Tahun]` (contoh: `Aug 2025`).
  - **Perilaku Responsif:** Popover menggunakan `w-full sm:w-64` dengan `max-w-[calc(100vw-2rem)]` sehingga tidak pernah meluber keluar batas viewport pada layar mobile.

### 3.4 FR-4: Kustomisasi & Kontrol Section Penuh
- **FR-4.1 (Rename Title Bebas):** Setiap judul section dapat diklik dan diedit langsung (misal: dari "WORK EXPERIENCE" menjadi "PENGALAMAN KERJA" atau "RIWAYAT PROYEK"). Tidak ada section yang judulnya terkunci.
- **FR-4.2 (Reorder Section):** Setiap section memiliki kontrol tombol:
  - `Move Up (↑)`: Menukar posisi section dengan section di atasnya.
  - `Move Down (↓)`: Menukar posisi section dengan section di bawahnya.
- **FR-4.3 (Delete Section):** Tombol tempat sampah (`Trash`) untuk menghapus section terkait dari dokumen.
- **FR-4.4 (Section Actions Hover Pill):**
  - Saat section diarahkan kursor (*hover*), sebuah bilah aksi mengambang berbentuk kotak putih dengan border abu-abu dan bayangan halus (`bg-white border border-slate-200 rounded-md shadow-xs px-1.5 py-0.5 flex items-center gap-1`) muncul di pojok kanan atas section.
  - Memuat tombol aksi: Ikon pensil abu-abu (`Pencil text-slate-600 hover:text-slate-900`) dan ikon tong sampah merah (`Trash2 text-red-500 hover:text-red-700`), serta panah reorder naik/turun jika berlaku.
  - Bilah ini tersembunyi secara default pada perangkat berpenunjuk (*pointer*, `≥ 1024px`) melalui pola `opacity-0 lg:group-hover:opacity-100`, dan **selalu tampil di layar sentuh** (`opacity-100` di bawah breakpoint `lg`) agar kontrol edit, reorder, dan hapus tetap dapat diakses pada mobile/tablet. Bilah otomatis hilang saat cetak/preview.
- **FR-4.5 (Standardized Section Edit Mode UI & Background Contrast):**
  - Seluruh section saat beralih ke mode edit (Header, Summary, Skills, Work Experience, Projects, Education, Custom Section) menggunakan pola antarmuka persis seragam sesuai referensi desain:
    1. **Container & Background Contrast:** Kartu formulir berlatar belakang abu-abu terang kontras halus (`bg-[#f8fafc] rounded-xl border border-slate-200/90 p-5 shadow-xs my-2.5`) yang membedakannya dengan jelas dari kertas kanvas putih A4 di sekitarnya.
    2. **Header Kartu:** Judul nama section dengan huruf kapital dan garis bawah hitam pekat (`border-b border-slate-900 pb-1 mb-5`).
    3. **Field Labels:** Teks label berukuran `11px` tebal (`font-semibold text-slate-700`) dengan penanda merah bintang `*` untuk kolom wajib.
    4. **Input Box & Textarea:** Kotak input putih bersih (`bg-white`), border abu-abu tipis `border-slate-300`, sudut rounded-lg, dengan ring fokus warna emerald (`focus:border-emerald-500 focus:ring-emerald-500`).
    5. **Tombol Hapus Item:** Tombol kotak mandiri berikon tong sampah merah (`Trash2 text-red-500 border border-slate-200 rounded-lg p-1.5 hover:bg-red-50`).
    6. **Work Experience Khusus:** Checkbox `[ ] I currently work in this role`, grid 4 kolom (Position, City/Country, Start Date, End Date dengan tombol silang `x` pembatalan cepat), serta toolbar Rich Text Tiptap langsung terintegrasi di atas box deskripsi tugas.
    7. **Education Khusus:** Checkbox `[ ] I currently study here` di atas baris institusi dan tanggal yang otomatis menonaktifkan picker tanggal kelulusan/selesai dan menampilkan nilai `Present`.
    8. **Skills Khusus:** Input Skill Category dan Textarea List of skills dengan catatan panduan `Use comma to separate each skill`.
    9. **Bilah Aksi Bawah Terpadu:**
       - Sisi Kiri: Tombol outline hijau `+ Add More` (`border border-emerald-500 text-emerald-600 rounded-lg font-semibold px-4 py-1.5`).
       - Sisi Kanan: Tautan teks hijau `Cancel` (`text-emerald-600 font-semibold px-3 py-1.5`) dan tombol hijau pekat `Save` (`bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold px-6 py-1.5 shadow-2xs`).

### 3.5 FR-5: Dynamic Section Types & Custom Sections
Sistem mendukung beragam tipe struktur section:
1. **Text / Summary Section (Tanpa Title Bawaan):**
   - Ditampilkan langsung sebagai paragraf ringkasan profil tanpa judul "SUMMARY" dan tanpa garis pembatas horizontal (`showTitle: false`).
   - Format teks rata kiri-kanan (*justify*) dengan ukuran font presisi `7.75pt` dan line-height `1.48` seimbang, menjamin paragraf ringkasan memecah tepat dalam 3 baris proporsional dengan keterbacaan yang lega sesuai dokumen referensi.
   - Kontrol toolbar edit (Tiptap) tetap aktif saat teks diklik atau saat kursor diarahkan ke area summary.
2. **Key-Value / Skills Section:** Kategori dan daftar item (contoh: "Design & Research: ...", "Tools: ...").
3. **Timeline / Experience Section:** Berisi kumpulan item pengalaman:
   - Posisi / Jabatan
   - Nama Perusahaan / Instansi
   - Periode Waktu (Bulan Tahun - Bulan Tahun)
   - Lokasi & Tipe (Remote / On-site)
   - Poin-poin pencapaian (Bulleted list format Tiptap)
   - **Multi-Posisi / Promosi Internal (Multiple Positions):** Satu entri perusahaan dapat menampung beberapa posisi berurutan (mis. promosi dari "Junior Designer" ke "Senior Designer"). Form editor menyediakan tombol `+ Posisi/Promosi` dan tombol hapus per posisi. Setiap posisi memiliki role, tanggal mulai/selesai, status "currently working", dan blok deskripsi rich text tersendiri. Pada mode tampilan/preview, promosi dirender sebagai blok bertingkat di bawah nama perusahaan, dengan posisi terbaru berada di atas.
4. **Project Section & Interactive Hyperlinks:**
   - Mirip dengan Experience ditambah dukungan tautan proyek langsung.
   - **Tautan Teks & Ikon Terpadu:** Teks nama proyek dan ikon eksternal (`ExternalLink`) dibungkus bersama dalam satu elemen `<a>` interaktif (`target="_blank"`), sehingga pengguna dapat mengklik langsung nama proyek maupun ikonnya untuk membuka tautan portofolio/demo di tab baru.
   - Ikon eksternal dan tautan tampil konsisten 1:1 pada kanvas editor, modal preview A4, dan dokumen cetak PDF.
   - Dilengkapi pencegahan propagasi (`e.stopPropagation()`) pada kanvas editor agar klik pada nama proyek langsung membuka tautan tanpa memicu mode edit section.
5. **Education Section:** Gelar, institusi, tahun, nilai (GPA), checkbox `I currently study here` (`current: boolean`), tautan dokumen lampiran (transkrip nilai, ijazah, atau sertifikasi kelulusan dengan label opsional, default ikon eksternal di samping gelar/degree), kolom input `Related Coursework` (rata kanan-kiri), serta kolom input `Final Thesis` yang menampilkan judul tugas akhir/skripsi dengan tautan langsung ter-embed ke judulnya (*hyperlink* interaktif).
6. **Certifications Section & Single-Line Credential Hyperlink:**
   - Setiap butir sertifikasi dirender pada **satu baris tunggal**:
     - **Sisi Kiri:** `[Title] (Credential ID: [ID]) by [Organization]`. Bagian judul dan ID dicetak tebal (`font-bold`), kata penghubung `by` normal, dan nama institusi penerbit dicetak tebal.
     - **Hyperlink Kredensial Terpadu:** Jika pengguna menyertakan URL kredensial, seluruh teks sertifikasi dibungkus dalam hyperlink interaktif (`<a>` dengan `target="_blank"`), tanpa menampilkan baris URL mentah di bawahnya.
     - **Sisi Kanan:** Periode / tanggal perolehan dicetak tebal (`font-bold text-slate-900`).
7. **Tombol Penambah Section Preset:** Tombol pil cepat di bagian bawah:
   - `+ Add Publications`
   - `+ Add Awards`
   - `+ Add Certifications`
   - `+ Add Languages`
   - `+ Add References`
   - `+ Add Organizational & Volunteering Experience`
8. **Tombol "Add Custom Section":** Pengguna dapat memasukkan nama section baru secara bebas dan memilih tipe layout (Timeline, List, atau Teks Bebas). Tombol menggunakan ikon `Plus` tunggal tanpa simbol tanda tambah ganda pada teks label.
9. **FR-5.9 (Universal Placeholder System & Warna Disabled pada Seluruh Section):**
   - **Penerapan Universal ke Seluruh Section:** Berlaku seragam untuk seluruh jenis section (Summary, Skills, Work Experience, Projects, Education, Certifications, Languages, Publications, Awards, Organizational/Volunteering, References, dan Custom Section).
   - **Warna Teks Disabled (Muted Color):** Pada mode pratinjau kanvas maupun modal PDF preview, setiap konten dummy yang masih berstatus placeholder **WAJIB** menggunakan warna non-aktif/disabled (`text-slate-400` / abu-abu redup), BUKAN warna teks aktif gelap (`text-slate-800` / `text-slate-900`). Ini memberikan penanda visual yang tegas bahwa teks tersebut hanyalah contoh acuan pengisian.
   - **Formulir Kosong Non-Intrusif Saat Edit:** Ketika pengguna membuka formulir edit pada section yang berstatus placeholder, seluruh kolom input **TIDAK langsung terisi** (`value` dimulai dalam keadaan string kosong `""`), sedangkan seluruh teks contoh hanya ditampilkan pada atribut `placeholder` (contoh: `e.g., Meta, Shopee, etc`, `Pick Date`, `e.g. AWS Certified Solutions Architect`, dll.). Pengguna dapat langsung mengetikkan data asli tanpa perlu membersihkan teks contoh secara manual terlebih dahulu.
   - **Transisi ke Data Aktif:** Saat pengguna menyimpan data yang valid, bendera `isPlaceholder` otomatis diubah menjadi `false`, dan seluruh tipografi teks beralih secara dinamis ke warna aktif hitam standar (`text-slate-900` / `text-slate-800`).

### 3.6 FR-6: Rich Text Formatting & Standalone White Toolbar
- **FR-6.1 (Dedicated White Toolbar Container):** Toolbar pemformatan Tiptap dibungkus dalam kontainer putih mandiri berbentuk kotak bersudut membulat (`bg-white border border-slate-200 rounded-lg p-1 shadow-2xs`), terpisah di atas kotak textarea input (`border border-slate-300 rounded-lg bg-white p-2.5`). Memberikan kontras visual bersih dan rapi di atas latar kartu formulir `#f8fafc`. Tombol formatting mencakup:
  - **Bold (`Ctrl+B`)**
  - **Italic (`Ctrl+I`)**
  - **Underline (`Ctrl+U`)**
  - **Hyperlink** (tambah/hapus URL)
  - **Bullet List**
  - **Numbered List**
- **FR-6.2 (Sanitasi HTML):** Konten HTML yang dihasilkan Tiptap dibersihkan dari tag berbahaya sebelum disimpan.

### 3.7 FR-7: Auto-Save & Sinkronisasi
- **FR-7.1 (Debounce):** Setiap ketukan tuts keyboard memicu penyimpanan lokal seketika dan mengirim permintaan update ke Supabase dengan jeda debounce 800ms.
- **FR-7.2 (Indicator):** Status ditampilkan di bilah navigasi: "Saved", "Saving...", atau "Offline Mode".
- **FR-7.3 (Optimistic Concurrency):** Setiap baris `resumes` memiliki kolom `version` (integer, default `1`). Update dari editor maupun MCP wajib menyertakan versi yang diharapkan; bila versi berubah, penulisan ditolak dan pengguna melihat dialog **Reload latest** / **Keep mine** alih-alih menimpa perubahan secara diam-diam. Tanpa migrasi `version`, editor memakai mode legacy upsert agar tetap dapat digunakan.
- **FR-7.4 (Kebijakan Cache Lokal):** Mode guest menyimpan seluruh library di `localStorage`. Pengguna yang sudah login **tidak** mencerminkan seluruh library ke `localStorage`; yang disimpan hanya draft aktif yang belum tersimpan (satu entri per resume) dan entri tersebut dihapus setelah penyimpanan Supabase berhasil. Saat logout, seluruh cache lokal dan draft dihapus. Jika browser ditutup sebelum save selesai, draft dipulihkan saat login berikutnya: otomatis bila versinya sama, atau melalui dialog konflik bila versi sudah berubah.

### 3.8 FR-8: Fitur 1:1 PDF Live Preview & Item-Level Multi-Sheet Pagination
- **FR-8.1 (Physical A4 Sheets Rendering & 100% Identical Layout):** Pratinjau PDF merender lembaran fisik kertas A4 individual (`.a4-page-sheet`) berukuran pasti `210mm x 297mm` dengan padding `10mm 13mm 12mm 13mm`. Tata letak pada mode pratinjau dan unduh PDF menggunakan kalkulasi deterministik yang sama persis sehingga tidak ada disparitas item antar lembar. Lembar ke-1 dan lembar ke-2 ditampilkan terpisah dengan spasi antar lembar yang luas (`48px`).
- **FR-8.2 (Preservasi Whitespace Alami):** Ketika isi halaman tidak memenuhi tinggi lembar kertas A4, sisa ruang kosong (*whitespace*) di bagian bawah lembar tetap dipertahankan secara utuh dan tidak menciut, mencerminkan dokumen fisik yang akan dicetak.
- **FR-8.3 (Sub-Pixel DOM-Measurement Engine, Fine-Grained Flow & Anti-Orphan Title):**
  - **Dual-Layer Pagination Engine:**
    - **Layer 1 (Calibrated Font Metrics):** Kapasitas lembar fisik A4 ditetapkan sebesar `1035px` (efektif ~275mm printable content height). Estimasi tinggi dikalibrasi akurat pada tipografi Inter 9pt (kerapatan ~105-109 karakter per baris, line-height 16.5px).
    - **Layer 2 (Real DOM Measurement via useLayoutEffect):** Menggunakan kontainer ukur tersembunyi berlebar pasti `184mm` untuk membaca `getBoundingClientRect().height` nyata dari engine layout browser sebelum frame dirender. Mengeliminasi 100% tinggi semu (*ghost height*), mencegah ruang kosong prematur di dasar lembar, dan mengisi lembaran hingga 97%+ kapasitas sebelum memecah halaman.
  - **Item-Level Cohesion:** Setiap item riwayat pekerjaan, proyek, pendidikan, dan sertifikasi dijaga sebagai satu unit utuh yang kohesif. Paginasi dilakukan pada tingkat item dan kategori keahlian (*skills*), mencegah pemotongan butir bullet point secara terfragmentasi.
  - **Anti-Orphan Title Protection:** Judul section dijamin hanya akan masuk ke halaman berjalan jika judul dan blok pertama di bawahnya muat 100% bersama-sama. Mencegah judul section berdiri terisolasi di dasar halaman.
- **FR-8.4 (Zoom & Page Indicators):** Dilengkapi kontrol zoom (25% - 150%) dan indikator penomoran lembar (*Page X of Y*). Tingkat zoom awal dihitung otomatis agar lembar A4 pas dengan lebar viewport (`fit-to-width`), dan kontrol zoom disembunyikan pada layar mobile (`< 640px`) demi ruang toolbar yang efisien.
- **FR-8.5 (Universal Bullet List Rendering):** Seluruh elemen daftar (`ul`, `li`) diatur dengan gaya `list-style-type: disc !important` yang kebal terhadap CSS normalization reset, menjamin poin-poin pencapaian tampil tajam dan terlihat di kanvas editor, preview, maupun cetak PDF.

### 3.9 FR-9: Fitur Download File PDF
- **FR-9.1 (Tombol Download PDF):** Tombol aksi utama di bilah navigasi atas dan modal preview untuk mengekspor dokumen ke file `.pdf`.
- **FR-9.2 (Penamaan File Otomatis Sesuai Standar):** Nama file PDF otomatis diformat:
  `CV_[Nama Lengkap]_[Judul CV].pdf` (contoh: `CV_Your Name_UIUX & Product Designer.pdf`). Karakter ilegal file (`/`, `\`, `:`, `*`, `?`, `"`, `<`, `>`, `|`) dibersihkan secara otomatis.
- **FR-9.3 (Kualitas Vektor & ATS-Friendly):** File PDF yang diunduh mempertahankan teks biner vektor (bukan raster gambar) sehingga dapat dibaca dan diseleksi oleh ATS (*Applicant Tracking System*).

### 3.10 FR-10: Styling Cetak Presisi 1:1, Eliminasi Artefak & Konsistensi Tipografi
- **FR-10.1 (Print-Only Dedicated Paginated Sheets & Typography Consistency):**
  - **Konsistensi Font 1:1:** Seluruh lembar cetak `.a4-page-sheet` dan elemen cetak menggunakan font `Inter` identik dengan mode pratinjau browser (`font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important`). Menghilangkan ketidaksesuaian lebar karakter dan line-height antara layar dan file cetak PDF.
  - **Eliminasi Rasterizer:** Seluruh bayangan (`box-shadow`), filter, dan efek transparansi dinonaktifkan pada media cetak, memaksa engine browser menghasilkan 100% teks vektor tajam murni tanpa lapisan bitmap terkompresi.
  - **Eliminasi Tuntas Artefak Ekstensi Browser (Multi-Layer):**
    - Lapisan 1 (JavaScript): Tepat sebelum `window.print()` dipanggil, pembersih DOM menonaktifkan seluruh elemen anak `document.body` di luar `#root` dan seluruh elemen berposisi `fixed` di viewport (seperti widget floating audio/podcast/reader pink).
    - Lapisan 2 (CSS Media Print): Aturan `@media print { body > *:not(#root) { display: none !important; left: -99999px !important; } }` dan penyematan inline SVG data-URI favicon menjamin 0% kebocoran artefak ekstensi ke lembar halaman 2+.
  - **Kontainer Alur Statis:** Kontainer cetak menggunakan alur statis (`position: static`) sehingga engine browser print memecah lembaran A4 fisik (`break-after: page`) secara presisi ke jumlah halaman yang tepat.
- **FR-10.2 (Page-Break Avoidance):** Setiap blok section item (pekerjaan, proyek, pendidikan) dilindungi dengan properti CSS `break-inside: avoid` agar tidak terbelah di batas halaman.
- **FR-10.3 (Client-Side Photo Compressor Readiness):** Disertakan modul utilitas kompresi kanvas HTML5 client-side (`compressProfilePhoto`) yang otomatis melakukan crop tengah (*center-crop*) presisi rasio 3:4 dan meresize ke dimensi target 300x400 px (~25-40 KB) sebelum disematkan ke dokumen, mengeliminasi efek distorsi/stretch dan menjaga file PDF tetap di bawah 100 KB.

### 3.11 FR-11: Responsive Mobile & Touch Experience
Seluruh halaman editor (dashboard, kanvas, form edit, preview, dan dialog) wajib dapat digunakan penuh dari perangkat mobile tanpa *horizontal scroll* dan tanpa kehilangan kontrol editing yang sebelumnya bergantung pada *hover*. Ambang responsif utama adalah `≤ 900px` (kanvas) dan breakpoint Tailwind standar (`sm 640`, `md 768`, `lg 1024`).

- **FR-11.1 (Kanvas A4 Mengalir Ulang):** Di bawah `900px`, `.resume-a4-page` menjadi `width: 100%` (lihat FR-3.1) sehingga tidak memicu scroll horizontal. Diverifikasi: `document.documentElement.scrollWidth === clientWidth` pada lebar viewport `320px`, `390px`, dan `1280px`.
- **FR-11.2 (Navbar Adaptif Dua Baris):** Bilah navigasi editor bertumpuk menjadi dua baris pada layar mobile:
  - Baris 1: logo Cevee, tombol kembali ke Dashboard, pemilih CV (`truncate`, `max-w-[130px]`), dan tombol edit nama CV.
  - Baris 2: tombol `Preview` dan `Download PDF` (masing-masing `flex-1`, teks "Preview" ringkas) serta tombol Sign out (ikon saja).
  - Pada `≥ 1024px` navbar kembali menjadi satu baris (`lg:flex-nowrap lg:h-14`) dengan status sinkronisasi dan label penuh.
  - Dropdown pemilih CV dibatasi `max-w-[calc(100vw-1.5rem)]` agar tidak meluber.
- **FR-11.3 (Kontrol Editor Selalu Terjangkau di Layar Sentuh):** Seluruh bilah aksi yang semula berbasis `hover` (kontrol section, pensil header, toolbar summary) kini selalu tampil di bawah breakpoint `lg` (lihat FR-4.4). Toolbar summary ditempatkan mengalir (*in-flow*, rata kanan) pada mobile dan kembali `absolute` di desktop.
- **FR-11.4 (Baris Aksi Form Edit Membungkus):** Bilah aksi bawah pada tiap form edit section (`+ Add More`, `Cancel`, `Save`) memakai `flex-wrap` sehingga turun ke baris kedua dengan rapi pada layar sangat sempit (terverifikasi pada `320px`).
- **FR-11.5 (Popover Tanggal Aman Viewport):** Popover `DatePicker` dibatasi lebar maksimumnya relatif viewport (FR-3.5) sehingga tidak terpotong pada mobile.
- **FR-11.6 (Preview PDF Fit-to-Width):** Modal preview PDF menghitung zoom awal agar lembar A4 pas dengan lebar viewport, menyembunyikan kontrol zoom di bawah `sm`, memakai padding lebih rapat (`p-3`), dan men-`truncate` judul agar toolbar tidak meluber.
- **FR-11.7 (Tipografi & Sentuhan):** Target sentuh tombol ikon minimal mengikuti ukuran Tailwind (`p-1.5` s.d. `p-2`), dan pemilih teks tidak bergantung pada efek transisi khusus *pointer*. Tidak ada elemen yang `display: none` hanya karena perangkat adalah seluler.
- **FR-11.8 (Non-Regresi Cetak):** Seluruh penyesuaian responsif bersifat *screen-only* (dibungkus `@media screen`) dan tidak mengubah output cetak/PDF 1:1 maupun kalkulasi paginasi item.

### 3.12 FR-12: Fitur Pemilihan & Pergantian Layout Resume (Layout Selector)
- **FR-12.1 (Alur Pemilihan Layout Pra-Pembuatan / Pre-Creation Selection):**
  - Sebelum dokumen CV baru dibuat dan masuk ke kanvas editor, pengguna **wajib** melalui tahap pemilihan format/layout melalui modal atau panel dialog pilihan (`LayoutSelectModal`).
  - Tahap ini dipicu saat menekan tombol pembuatan CV baru (*Create Resume* di Dashboard, *Start Building Resume* di Empty State, atau tombol `+` di Navbar).
  - Modal menggunakan indikator progress **`OnboardingStepper`** berformat segmen horizontal (`ix-onboarding-stepper-segments`) dengan label jelas per langkah (`Step 1 of 2: Choose layout` dan `Step 2 of 2: Content source`).
  - Pengguna memilih format layout yang diinginkan (default terpilih: layout standar aktif) dan menekan tombol konfirmasi pembuatan (*Continue to source*) untuk melanjutkan ke tahap penamaan dan pemilihan sumber konten (Blank atau Import PDF).
- **FR-12.2 (Left Sidebar Container & Layout Selector Murni Visual / Mobbin-Style Left Panel):**
  - Pada halaman editor CV (`currentView === 'editor'`), antarmuka mengadopsi arsitektur container panel kiri (`LayoutSidebar`) di sebelah kanvas A4, merujuk pada standar pola desain editor modern di Mobbin (Adobe Express, Ditto, Canva):
    - **Container Sisi Kiri (Left Sidebar Container):** Sebuah kontainer panel vertikal (`w-56 xl:w-64 bg-white border-r border-slate-200/90 shadow-2xs sticky top-14 h-[calc(100vh-3.5rem)]`) yang berdiri di sisi kiri workspace di bawah navbar.
    - **Layout Selector di Dalam Container:** Di dalam kontainer tersebut, selector layout ditata rapi secara vertikal (`overflow-y-auto p-4 flex flex-col items-center gap-4`).
    - **Tampilan Pratinjau Terkalibrasi & Proporsional (High-Fidelity Document Preview):** Setiap item layout di dalam kontainer maupun dialog modal menampilkan pratinjau dokumen A4 presisi (vektor SVG `ResumeMiniPreview`) dengan tipografi Inter mikro, rasio margin padat A4 (10mm/13mm) otentik, serta hierarki section utuh (Header, Summary, Experience, Education, Projects, Skills, Certifications) yang proporsional (~80% kepadatan lembar) tanpa kekosongan/whitespace berlebihan atau bentuk skeleton baris generik.
    - **Indikator Aktif & Interaktivitas:** Thumbnail layout yang aktif dibungkus border hijau emerald tebal (`border-2 border-emerald-600`), ring fokus aksen (`ring-4 ring-emerald-500/15`), bayangan halus, dan lencana centang di sudut kanan atas. Mengklik thumbnail langsung memperbarui format layout CV secara reaktif tanpa modal dan tanpa reload.
    - **Responsivitas & Isolasi Media Cetak:** Pada layar desktop (`≥ 1024px`), container tampil terpasang (*docked*) di sisi kiri layar; pada layar tablet/mobile (`< 1024px`), container diakses via tombol pemicu mengambang di kiri atas yang membuka drawer slide-over; serta 100% diisolasi/disembunyikan saat cetak PDF (`no-print`).
- **FR-12.3 (Katalog Layout & Presets):**
  - Sistem menyediakan 3 pilihan preset layout standar:
    1. **`standard-ats-v1` (Standard Single-Column ATS; ID legacy `classic-ats`):** Format resume 1 kolom standar industri ATS, header tengah adaptif tanpa foto, margin padat (10mm/13mm/12mm), tipografi seragam 7.75pt, dan pembatas garis hairline.
    2. **`modern-photo` (Photo Header Single-Column):** Format resume 1 kolom dengan bingkai foto profil portrait rasio 3:4 (~22mm x 28mm pada cetak fisik A4) di sisi kiri header, serta nama kandidat bold dan baris kontak dot separator terpadu rata kiri (*left-aligned*) di sisi kanan foto. Seluruh section lain (Summary rata kiri-kanan, Skills, Experience, Education, Projects, Custom Section) 100% identik dan tetap di posisi aslinya.
    3. **`standard-ats-v2` (Standard ATS V2; ID legacy `reference-nodeflair`):** Format resume terkalibrasi persis dengan spesifikasi layout referensi (`PDF_MAKER_REFERENCE_LAYOUT_SPEC.md`). Menggunakan font stack Liberation Sans / Arimo, nama `18.01pt`, teks konten seragam `8.41pt`, line advance `12.61pt` (rasio 1.5), margin kiri `26.86pt` (~9.48mm) dan kanan `27.11pt` (~9.57mm), garis pembatas `0.60pt solid #1F2937`, perataan kiri-kanan (*justified*) untuk ringkasan, paragraf deskripsi, dan butir pencapaian, serta titik peluru lingkaran solid diameter `2.40pt`. Kategori keahlian (`Languages:`, `Analysis:`, dsb.), heading section, dan judul dokumen tetap rata kiri (*left-aligned*).
  - Komponen upload foto terintegrasi pada form edit header dengan kompresi kanvas client-side (`compressProfilePhoto`) berukuran max 300x400 px rasio 3:4 (~25-40 KB) dengan preservasi state foto pada mode edit form.
  - Seluruh struktur komponen dialog pemilih, tipe data, dan alur kerja diimplementasikan secara dinamis (*data-driven*) mempermudah ekspansi template di masa mendatang.
- **FR-12.4 (Preservasi Data & Integritas Konten):**
  - Pemilihan maupun pergantian format layout hanya mengubah metadata `layoutId` pada dokumen resume.
  - Seluruh data konten (kontak header, riwayat pekerjaan, pendidikan, proyek, keahlian, dan custom section) dipertahankan 100% tanpa adanya pemotongan atau penghapusan data (*zero data loss*).
- **FR-12.5 (Sinkronisasi Pratinjau & Output Cetak PDF):**
  - Mesin pratinjau live PDF (`PreviewModal` & `PaginatedResumeView`) serta aturan cetak `@media print` merender dokumen berdasarkan `layoutId` yang tersimpan pada resume aktif, menjamin hasil ekspor PDF 1:1 persis sama dengan yang dilihat pengguna di editor.

### 3.13 FR-13: AI Resume Import & Serverless Proxy
- **FR-13.1 (Ekstraksi Teks PDF di Sisi Client):** Menggunakan `pdfjs-dist` di browser untuk membaca teks mentah dari file PDF yang diunggah pengguna dalam `LayoutSelectModal`.
- **FR-13.2 (Serverless AI Proxy `/api/parse-resume`):** Endpoint serverless Vercel (`api/parse-resume.ts`) menerima teks PDF, melakukan validasi schema, dan memanggil Google Gemini API secara privat.
- **FR-13.3 (Perlindungan Kunci API / Zero Leak):** Kunci Gemini API dikonfigurasi menggunakan nama variabel privat `GEMINI_API_KEYS` (dan model `GEMINI_MODEL`), tanpa prefix publik `VITE_`. Kunci tidak pernah terinjeksi ke dalam bundel JavaScript client.
- **FR-13.4 (Multi-Key Rotation & 429 Quota Fallback):** Sistem serverless mendukung beberapa API key (dipisahkan koma) dengan rotasi otomatis dan cooldown 60 detik jika mendeteksi status HTTP 429 / quota limit.
- **FR-13.5 (Speed-Tiered Model Cascade & Anti-Hang Fallback):** Model diurutkan bertingkat berdasarkan kecepatan latensi riil Google API: Tier 1 Ultra-Cepat (`gemini-3.5-flash-lite`, `gemini-3.1-flash-lite`, `gemini-flash-lite-latest` dengan latensi ~1.2s - 1.8s), Tier 2 Standar (`gemini-3.5-flash`, `gemini-3.6-flash`, `gemini-flash-latest`), dan Tier 3 Cadangan Akhir (`gemini-3.8-flash`, `gemini-3.7-flash`). Model lambat diproteksi agar tidak memblokir antrean. Setiap pemanggilan model dibatasi timeout per-fetch 10s (Vercel) / 15s (Dev) dan total budget 50s untuk mencegah kegagalan HTTP 504. Rotasi multi-key diprioritaskan pada model tercepat terlebih dahulu saat kuota habis (HTTP 429).
- **FR-13.6 (Mapping Otomatis ke Format Dokumen Cevee):** Output JSON terstruktur dari Gemini diadaptasi oleh `resumeAdapter.ts` menjadi `ResumeDocument` Cevee lengkap dengan section Header, Summary, Experience, Education, Projects, Skills, dan Custom Sections.
- **FR-13.7 (Dukungan Dev Server Lokal & Dynamic Env Reload):** Vite dev server (`vite.config.ts`) mengintegrasikan middleware lokal untuk `/api/parse-resume` yang memuat ulang konfigurasi `.env` secara dinamis pada setiap request tanpa perlu restart server.
- **FR-13.8 (Human-Friendly UX Writing, TaskSteps & Provider Abstraction):** Antarmuka pengguna (`LayoutSelectModal`) dan layer komunikasi AI (`geminiParser.ts`) mengabstraksikan nama vendor internal. Proses pemindaian dan analisis AI menggunakan komponen terstruktur **`TaskSteps`** (`ix-task-steps`) dengan 3 tahapan visual jelas (Extracting PDF document text -> Structuring experience and skills with AI -> Formatting layout and readying editor) lengkap dengan indikator animasi shimmer, status centang hijau, dan ikon spinning progress. Kegagalan/timeout/kuota dipetakan ke pesan yang solutif tanpa memaparkan kode error teknis atau istilah vendor ke pengguna.
- **FR-13.9 (Magnetic Drop Zone):** Dropzone upload PDF resume menggunakan komponen `MagneticDropZone` berbasis fisika pegas (`motion/react`) yang memberikan efek tarikan magnetik ikon ke arah kursor/file, penyorotan visual border dan latar saat berkas ditarik di atas zona, serta dukungan aksesibilitas keyboard dan reduced-motion.

### 3.14 FR-14: Fitur Bahasa Dokumen Resume Per-CV (Per-Resume Language Switcher)
- **FR-14.1 (Pemisahan Bahasa Dokumen vs Bahasa Aplikasi Web):**
  - Antarmuka aplikasi web Cevee (navbar, tombol, modal dialog, form label editor, dan dashboard) tetap menggunakan standar `English (US)`.
  - Setiap dokumen resume memiliki pengaturan bahasa mandiri (`content.language?: 'en' | 'id'`, default `'en'`) yang tersimpan di dalam kolom JSONB `content` Supabase dan `localStorage` tanpa memerlukan migrasi tabel SQL.
- **FR-14.2 (Kontrol Pemilihan & Pergantian Bahasa Resume):**
  - **Saat Pembuatan CV Baru (`LayoutSelectModal` Step 2):** Menyediakan kontrol radio tersegmentasi `Resume language` (`English` | `Bahasa Indonesia`) sejajar di samping input `Resume title` dengan teks bantu ramah pengguna (*"Used for section titles and dates on your resume."*), berlaku untuk pembuatan template kosong (*Blank template*) maupun ekstraksi PDF (*Scan & import from PDF*).
  - **Di Dalam Kanvas Editor (`Navbar`):** Menyediakan menu dropdown `Resume language` (`EN` / `ID`) pada bilah atas editor (tampil baik di desktop maupun mobile) dengan penjelasan ringkas yang menjawab keraguan pengguna (*"Updates section titles and dates without changing what you wrote."*) untuk mengganti bahasa resume kapan saja secara reaktif.
  - **Indikator Dashboard (`ResumeDashboard`):** Kartu resume menampilkan lencana kode bahasa (`EN` / `ID`) di samping nama layout agar pengguna yang memiliki CV multi-bahasa dapat membedakan dokumen secara instan.
- **FR-14.3 (Cakupan Lokalisasi Deterministik & Preservasi Konten Pengguna):**
  - Mengganti bahasa resume (`switchResumeLanguage` di `src/utils/resumeLocale.ts`) hanya memperbarui elemen struktural/template tanpa menimpa kalimat yang telah diketik pengguna:
    1. **Judul Section Standar:** Mengonversi judul bawaan yang belum dikustomisasi bebas (`SUMMARY` ↔ `RINGKASAN`, `WORK EXPERIENCE` ↔ `PENGALAMAN KERJA`, `EDUCATION` ↔ `PENDIDIKAN`, `PROJECTS` ↔ `PROYEK`, `SKILLS` ↔ `KEAHLIAN`, `CERTIFICATIONS` ↔ `SERTIFIKASI`, `LANGUAGES` ↔ `BAHASA`, `PUBLICATIONS` ↔ `PUBLIKASI`, `AWARDS` ↔ `PENGHARGAAN`, `ORGANIZATIONAL & VOLUNTEERING EXPERIENCE` ↔ `PENGALAMAN ORGANISASI & RELAWAN`, `REFERENCES` ↔ `REFERENSI`). Judul yang telah diubah kustom oleh pengguna dipertahankan utuh.
    2. **Identitas Sub-Tipe Section Stabil (`presetKey`):** Setiap section menyimpan `presetKey` opsional (`certifications`, `languages`, `publications`, `awards`, `volunteering`, `references`, dll.) dengan detektor kata kunci dwibahasa (`detectSectionPresetKey`), menjaga format khusus sertifikasi, bahasa, dan referensi tetap bekerja akurat meskipun judul section berbahasa Indonesia.
    3. **Label Bawaan Layout & PDF (1:1 di Semua Preset Layout V1, Modern Photo, dan V2):**
       - Relokasi Header: `(Willing to relocate)` ↔ `(Bersedia relokasi)` (V1 & Modern Photo) serta `| Willing to relocate` ↔ `| Bersedia relokasi` (V2).
       - Education: `GPA:` ↔ `IPK:`, `Related Coursework:` ↔ `Mata Kuliah Relevan:`, `Final Thesis:` ↔ `Tugas Akhir:`.
       - Certifications: `Credential ID:` ↔ `ID Kredensial:`, kata penghubung `by` ↔ `oleh`.
    4. **Format Bulan, Status Aktif & DatePicker:** Mengonversi singkatan bulan (`May` ↔ `Mei`, `Aug` ↔ `Agu`, `Oct` ↔ `Okt`, `Dec` ↔ `Des`) dan status aktif (`Present` ↔ `Sekarang`) pada periode tanggal, menampilkan grid bulan sesuai bahasa resume di `DatePicker`, serta mendukung singkatan `Agu` pada pengurutan kronologis `sortByPeriodDesc`.
    5. **Teks Panduan Placeholder A4:** Seluruh teks contoh abu-abu (`isPlaceholder`) menyesuaikan bahasa resume aktif.

### 3.15 FR-15: Integrasi MCP (Model Context Protocol)
- **FR-15.1 (Fondasi Domain Bersama):** Logika resume yang tidak bergantung React dipusatkan di `src/lib/domain/` (factory, migrasi, ATS, HTML) dan schema validasi Zod di `src/lib/mcp/schema/`. Schema dianotasi `z.ZodType<ResumeDocument>` sehingga perubahan tipe tanpa pembaruan schema menggagalkan `tsc`.
- **FR-15.2 (Versi Data):** Dokumen membawa `content.schemaVersion`; migrasi saat baca mempertahankan field yang belum dikenal agar fitur baru tidak hilang saat dibaca/ditulis melalui MCP.
- **FR-15.3 (MCP Lokal):** Paket `mcp/` menyediakan server stdio `cevee-mcp` dengan CLI `login` / `whoami` / `logout`. Session disimpan di `~/.cevee` dengan permission owner-only; tidak ada service role. Tool yang tersedia: `get_capabilities`, `validate_resume`, `ats_audit`, CRUD resume (`list_resumes`, `get_resume`, `create_resume`, `update_resume`, `duplicate_resume`, `delete_resume`), `update_header`, section (`list_sections`, `add_section`, `update_section`, `remove_section`, `reorder_sections`), item (`add_item`, `update_item`, `remove_item`, `reorder_items`), layout (`list_layouts`, `set_layout`), dan import (`import_resume`). Setiap write memakai `expectedVersion`; delete membutuhkan `confirm: true`. Input summary/bullet berupa plain text dan di-escape server-side.
- **FR-15.3a (Import PDF):** `import_resume` menerima `pdfText`, `pdfBase64`, atau `filePath` (lokal), mengekstrak teks dengan PDF.js legacy, lalu memanggil Google Gemini untuk menghasilkan `ParsedResumeRaw`. Hasil dipetakan ke `ResumeDocument` baru dan dikembalikan sebagai draft (`save: false`, default) atau disimpan sebagai resume baru (`save: true`). Tool ini tidak pernah menimpa resume yang sudah ada. `pdfBase64` dan `filePath` hanya tersedia di server lokal.
- **FR-15.3b (Audit ATS):** `ats_audit` menjalankan aturan deterministik di `src/lib/domain/ats.ts` dan mengembalikan skor 0–100, daftar isu (critical/warning/info), serta ringkasan jumlah section, item, bullet, dan kata. Tool ini read-only.
- **FR-15.4 (MCP Remote):** Endpoint Streamable HTTP di Vercel Edge (`/api/mcp`) memakai OAuth 2.1 Supabase (DCR + PKCE S256 + `offline_access`) sebagai authorization server. Resource server memverifikasi JWT lewat JWKS Supabase, membuat Supabase client dengan token user, dan mengandalkan RLS; tidak ada service role. Discovery tersedia di `/.well-known/oauth-protected-resource`, consent page di `/oauth/consent`, dan halaman penghubung di `/connect-ai`. Remote `import_resume` hanya menerima `pdfText`; `pdfBase64` dan `filePath` tetap lokal.
- **FR-15.5 (Batasan):** Guest mode tidak dapat memakai MCP karena data hanya berada di `localStorage`. Export PDF tetap dijalankan di sisi klien; remote MCP tidak menjalankan Playwright.
- **FR-15.6 (Rate Limit Remote):** Remote MCP membatasi 120 request per menit per user melalui RPC `consume_mcp_quota` dan tabel `public.mcp_usage`. Melebihi batas menghasilkan `429` dengan header `Retry-After`. Tabel hanya dapat ditulis oleh fungsi security-definer; akses langsung ditolak.
- **FR-15.7 (Privasi & Ketentuan):** Halaman `/privacy` dan `/terms` menjelaskan data yang disimpan, pihak ketiga (Supabase, Vercel, Google Gemini, AI client), retensi/penghapusan, dan cara mencabut OAuth client. Consent page menautkan kedua halaman.
- **FR-15.8 (Kompatibilitas Client):** Client remote memakai OAuth; client stdio-only dapat memakai `mcp-remote`. Jalur PAT statis ditunda karena memerlukan data layer service-role yang melewati RLS; tidak diaktifkan sampai ada test isolasi khusus.
- **FR-15.9 (Pendaftaran Publik Terbuka):** Sign-up tetap publik tanpa allowlist. Supabase Auth mewajibkan konfirmasi email, password minimum 8 karakter, dan MCP rate limit 120 request/menit. Pemilik memantau akun baru dan dapat menghapus akun asing. Isolasi RLS sudah diuji dengan dua user: user B tidak bisa membaca, mencantumkan di daftar, atau mengubah resume user A.

---

## 4. SKEMA DATA & DATABASE

### 4.1 Skema PostgreSQL (Supabase DDL)

```sql
-- Aktifkan ekstensi UUID
create extension if not exists "uuid-ossp";

-- 1. Tabel Profiles (Sinkronisasi dengan auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Trigger pembuatan profil saat user mendaftar
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Tabel Resumes (Multi-CV per user)
create table public.resumes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null default 'Untitled Resume',
  layout_id text not null default 'classic-ats',
  content jsonb not null default '{}'::jsonb,
  version integer not null default 1,
  is_favorite boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indeks performa
create index idx_resumes_user_id on public.resumes(user_id);
create index idx_resumes_updated_at on public.resumes(updated_at desc);

-- Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.resumes enable row level security;

create policy "Users can view and edit their own profile"
  on public.profiles for all
  using (auth.uid() = id);

create policy "Users can CRUD their own resumes"
  on public.resumes for all
  using (auth.uid() = user_id);
```

### 4.2 Struktur Dokumen JSONB (`ResumeContent`)

```typescript
export interface ContactLink {
  id: string;
  label: string;
  url: string;
}

export interface HeaderData {
  fullName: string;
  roles?: string[]; // Max 4 target roles, otomatis digabung dengan " | "
  headline?: string; // Fallback string
  location: string;
  willingToRelocate?: boolean; // Checklist relocation status
  relocationStatus?: string;
  email: string;
  phone: string;
  links: ContactLink[];
  photoUrl?: string; // Foto profil opsional (Base64 terkompresi ~20-40 KB)
  isPlaceholder?: boolean;
}

export interface SkillCategory {
  id: string;
  category: string; // contoh: "Design & Research", "Tools"
  items: string;   // teks berurutan dipisahkan koma
}

export interface ExperiencePosition {
  id: string;
  role: string;
  period: string;   // Nilai tampilan, contoh: "Aug 2025"
  startDate?: string;
  endDate?: string;
  current?: boolean; // true => periode ditampilkan sebagai "[start] - Present"
  bullets: string;   // rich text HTML dari Tiptap
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  location: string;
  period: string;  // contoh: "Aug 2025 - Dec 2025"
  startDate?: string;
  endDate?: string;
  current?: boolean;
  bullets: string; // rich text HTML dari Tiptap
  positions?: ExperiencePosition[]; // Multi-posisi / promosi dalam 1 perusahaan
}

export interface ProjectItem {
  id: string;
  name: string;
  url?: string;
  period: string;
  startDate?: string;
  endDate?: string;
  bullets: string;
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  period: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  gpa?: string;
  url?: string;
  urlLabel?: string;
  relatedCoursework?: string;
  thesisTitle?: string;
  thesisUrl?: string;
  description?: string;
}

export interface CustomSectionItem {
  id: string;
  title: string;
  subtitle?: string;
  period?: string;
  description?: string;
  credentialId?: string;
  credentialUrl?: string;
}

export type SectionType = 
  | 'summary'
  | 'skills'
  | 'experience'
  | 'projects'
  | 'education'
  | 'custom_list'
  | 'custom_text';

export interface SummarySectionData {
  html: string;
}

export interface SkillsSectionData {
  categories: SkillCategory[];
}

export interface ExperienceSectionData {
  items: ExperienceItem[];
}

export interface ProjectsSectionData {
  items: ProjectItem[];
}

export interface EducationSectionData {
  items: EducationItem[];
}

export interface CustomListSectionData {
  items: CustomSectionItem[];
}

export interface CustomTextSectionData {
  html: string;
}

export type SectionData =
  | SummarySectionData
  | SkillsSectionData
  | ExperienceSectionData
  | ProjectsSectionData
  | EducationSectionData
  | CustomListSectionData
  | CustomTextSectionData;

export type ResumeLanguage = 'en' | 'id';

export type ResumeSectionPresetKey =
  | 'summary'
  | 'experience'
  | 'education'
  | 'projects'
  | 'skills'
  | 'certifications'
  | 'languages'
  | 'publications'
  | 'awards'
  | 'volunteering'
  | 'references'
  | 'custom';

export interface BaseResumeSection {
  id: string;
  title: string;          // BEBAS DIKUSTOMISASI OLEH USER
  presetKey?: ResumeSectionPresetKey; // Penanda sub-tipe section lintas bahasa
  showTitle?: boolean;    // Dapat disembunyikan (misal: default false untuk summary)
  isPlaceholder?: boolean;// Menampilkan format dummy saat baru ditambahkan tanpa mengunci input
}

export interface SummaryResumeSection extends BaseResumeSection {
  type: 'summary';
  data: SummarySectionData;
}

export interface SkillsResumeSection extends BaseResumeSection {
  type: 'skills';
  data: SkillsSectionData;
}

export interface ExperienceResumeSection extends BaseResumeSection {
  type: 'experience';
  data: ExperienceSectionData;
}

export interface ProjectsResumeSection extends BaseResumeSection {
  type: 'projects';
  data: ProjectsSectionData;
}

export interface EducationResumeSection extends BaseResumeSection {
  type: 'education';
  data: EducationSectionData;
}

export interface CustomTextResumeSection extends BaseResumeSection {
  type: 'custom_text';
  data: CustomTextSectionData;
}

export interface CustomListResumeSection extends BaseResumeSection {
  type: 'custom_list';
  data: CustomListSectionData;
}

export type ResumeSection =
  | SummaryResumeSection
  | SkillsResumeSection
  | ExperienceResumeSection
  | ProjectsResumeSection
  | EducationResumeSection
  | CustomTextResumeSection
  | CustomListResumeSection;

export interface ResumeContent {
  language?: ResumeLanguage; // Bahasa dokumen resume ('en' | 'id', default: 'en')
  header: HeaderData;
  sections: ResumeSection[];
}

export type ResumeLayoutId = 'standard-ats-v1' | 'standard-ats-v2' | 'modern-photo';
export type LegacyResumeLayoutId = 'classic-ats' | 'reference-nodeflair';

export interface ResumeDocument {
  id: string;
  title: string;
  layoutId?: ResumeLayoutId | LegacyResumeLayoutId | string; // Layout selector (default: 'standard-ats-v1')
  createdAt?: string; // ISO timestamp pembuatan CV
  updatedAt: string;
  content: ResumeContent;
}
```

---

## 5. PERSYARATAN NON-FUNGSIONAL (NON-FUNCTIONAL REQUIREMENTS)

1. **Performa Render Kanvas:** Pengetikan teks pada kanvas in-place wajib merespons di bawah 16ms (60 FPS) tanpa lag input.
2. **Kesesuaian Cetak A4:** Hasil cetak via browser print wajib memiliki rasio tepat lembar A4, tanpa pemotongan elemen di batas margin atas/bawah.
3. **Ketahanan Data:** Data yang sedang diedit tidak boleh hilang saat tab browser ditutup secara tidak sengaja (sinkronisasi lokal instan).
4. **Keamanan & Privasi:** Data CV hanya dapat diakses oleh pemilik akun via Supabase RLS. Tidak ada telemetri pelacakan konten dokumen pengguna.
5. **Aksesibilitas:** Seluruh tombol tindakan, modal penambahan section, dan menu picker dapat diakses menggunakan keyboard standar.
6. **Responsivitas Mobile:** Seluruh halaman editor dapat digunakan penuh pada rentang lebar `320px` hingga desktop tanpa *horizontal scroll*; kontrol berbasis *hover* tetap dapat diakses melalui layar sentuh; dan penyesuaian responsif tidak mengubah output cetak/PDF 1:1.

---

## 6. RENCANA TAHAPAN IMPLEMENTASI (ROADMAP)

### Fase 1: Inisialisasi Fondasi & Tooling
- Setup Vite + React 18+ (TypeScript).
- Konfigurasi Tailwind CSS + Typography plugin.
- Inisialisasi shadcn/ui dan install komponen (`Button`, `Dialog`, `DropdownMenu`, `Input`, `Tooltip`).
- Konfigurasi Tiptap headless editor dengan extension StarterKit, Underline, dan Link.

### Fase 2: Pembangunan In-Place A4 Canvas
- Buat layout container kanvas A4 dengan bayangan kertas realistis.
- Implementasi Header interaktif (nama, kontak, link kustom).
- Implementasi blok section modular dengan tombol kontrol (Rename Title, Move Up, Move Down, Delete).
- Pasang deretan tombol penambah section ("+ Add Awards", "+ Add Certifications", dan "+ Add Custom Section").

### Fase 3: State Management & Local-First Persistence
- Buat store React (Zustand atau Custom React Context Hook) untuk manipulasi state pohon dokumen `ResumeDocument`.
- Terapkan logika reorder array section tanpa mutasi state langsung.
- Implementasi debounced local storage backup.

### Fase 4: Integrasi Supabase & Manajemen Multi-CV
- Inisialisasi Supabase JS Client.
- Implementasi Autentikasi Modal (Login / Register).
- Buat CV Selector Bar (Top Bar): List CV, Buat CV Baru, Duplikasi CV, Ganti Nama CV, Hapus CV.
- Sinkronisasi CRUD CV ke Supabase dengan status indikator.

### Fase 5: 1:1 PDF Live Preview & Fitur Download PDF
- Bangun modal pratinjau bersih (Clean Preview Mode) dengan zoom controls dan indikator pemisah halaman A4 (Page Break Line).
- Integrasi PDF.js viewer untuk rendering pratinjau canvas presisi 1:1.
- Implementasi tombol download PDF dengan sanitasi nama file otomatis (`[FullName]_CV_[ResumeTitle].pdf`).
- Terapkan aturan cetak CSS `@media print` presisi dan proteksi page-break item (`break-inside: avoid`).
- Uji cetak cross-browser (Google Chrome, Firefox, Microsoft Edge).

---

## 7. RIWAYAT VERSI (CHANGELOG)

### 1.46.0 — Integrated Resume-Centric Job Tracker (Kanban + List, Local JD Match & MCP Tools)
- **Skema Database & Hybrid Persistence (`supabase/migrations/20261127_add_job_applications.sql`, `src/types/job.ts`, `src/lib/domain/jobRow.ts`, `src/lib/jobService.ts`):**
  - Menambahkan tabel `public.job_applications` di Supabase dengan RLS (`auth.uid() = user_id`), token *optimistic concurrency* `version`, dan fallback graceful degradation jika tabel belum dimigrasikan.
  - Menyediakan penyimpanan lokal `localStorage` (`cevee_job_applications_v1`) untuk pengguna Guest serta migrasi otomatis Guest-to-Cloud saat login di `src/App.tsx`.
  - Ketika sebuah resume dihapus, lamaran yang tertaut ke `resume_id` tersebut otomatis dilepas tautannya (`resumeId: undefined`) tanpa menghapus riwayat lamaran.
- **Mesin Pencocokan Kata Kunci JD Lokal (`src/lib/domain/jdMatch.ts`):**
  - Mengekstrak kata kunci teknis dan istilah domain dari *Job Description* + *Role title* secara deterministik 100% di sisi klien (Rp 0 biaya API) dan membandingkannya dengan teks penuh `ResumeDocument` yang tertaut (`matchJobToResume`), menghasilkan persentase kecocokan (`score`), `matchedKeywords`, dan `missingKeywords`.
- **Antarmuka Job Tracker Pillow Light (`src/components/jobs/JobTrackerView.tsx`, `JobFormDialog.tsx`, `JobEmptyState.tsx`, `ResumeDashboard.tsx`):**
  - Menambahkan switcher navigasi ruang kerja (`Resumes` | `Job tracker`) di bilah Floating Top Header.
  - Menyediakan 2 kartu Bento sejajar tinggi (**Pipeline Breakdown Donut + Full-Year Activity Heatmap** di `src/components/jobs/JobTrackerStats.tsx`): kartu kiri memuat Donut Ring interaktif + 4 baris tahap (*Applied*, *On progress*, *Offering*, *Rejected*) yang langsung memfilter papan/daftar beserta persentase *response* & *offer*; kartu kanan memuat kalender heatmap tahun penuh **Jan–Dec** dimulai tepat dari 1 Januari dengan pemilih tahun (`‹ 2026 ›`), label hari (`Mon`, `Wed`, `Fri`), label bulan presisi pada tanggal 1 tiap bulan, 4 tingkat intensitas kobalt + level kosong, serta readout tanggal & jumlah pasti saat hover/tap/fokus; pencarian instan (`h-11`), filter tahap aktif & tipe pekerjaan (*Employment type*: `Full-time`, `Internship`, `Contract`, `Part-time`, `Freelance`, `Other`), pengurutan, toggle **Board View (Kanban 4 kolom: Applied, On progress, Offering, Rejected)** dan **List View** (tersimpan di `localStorage`), **Sub-Stage Pill interaktif** di dalam kolom *On progress* (`HR interview`, `Assessment test`, `Technical test`, `User interview`, `Preparing interview`, `Interview finished`), banner **Undo** saat mengarsipkan, serta menu terpisah khusus **Archived** (tidak tampil di kolom Kanban, dilengkapi aksi *Restore* & *Delete*).
  - Mendukung drag-and-drop antar kolom Kanban di desktop sekaligus dropdown pemindah tahap 1-klik di setiap kartu/baris untuk aksesibilitas keyboard dan perangkat sentuh.
  - Menyediakan tombol **Duplicate & tailor copy** untuk menggandakan CV dasar menjadi variasi khusus perusahaan/posisi tujuan dan langsung menautkannya ke lamaran.
- **Ekstensi Cevee MCP Server (`src/lib/mcp/tools/jobs.ts`, `src/lib/mcp/store/*`):**
  - Menambahkan tools MCP `list_jobs`, `get_job`, `create_job`, `update_job`, `delete_job`, dan `match_job_resume` pada `SupabaseResumeStore` dan `MemoryStore`.
- **Verifikasi:** `npm run lint` ✓, `npm run build` ✓, `npm run typecheck:api` ✓, `npm run mcp:build` ✓, `npm run mcp:test` ✓ (22 test lulus).

### 1.45.0 — MCP Private Beta: Public Signup, Invite Copy & RLS Two-User Test
- **Pendaftaran publik:** Sign-up tetap terbuka tanpa allowlist; email confirmation sudah aktif; password minimum dinaikkan dari 6 ke 8 karakter. Tidak ada perubahan pada alur AuthPage.
- **Connect page:** Mengganti kartu “Manage connected apps” (tautan dashboard owner) dengan panduan “Revoke access” dari AI client; menambahkan kartu “Invite a friend” berisi pesan siap-kirim dan tautan “Create a Cevee account”; snippet `mcp-remote` tetap tersedia.
- **Dashboard:** Memindahkan akses `Connect AI` ke dropdown profil (item dengan ikon) dan menghapus tombol standalone di header agar fokus tetap pada `Create resume`.
- **RLS dua user:** Akun uji sementara dibuat dan dihapus otomatis; hasil: owner tidak bisa membaca/mengubah resume user uji, user uji tidak bisa membaca resume owner, dan kedua daftar tidak saling bocor. Test berakhir `rls test: ok`.
- **Verifikasi:** `npm run build` ✓, `npm run lint` ✓, `npm --prefix mcp run typecheck` ✓, RLS two-user test ✓.

### 1.44.0 — MCP Fase 4: Rate Limit, Privasi & Go-Live
- **Rate limit remote:** Menambahkan tabel `public.mcp_usage` dan RPC `consume_mcp_quota` (120 request/menit per user); `api/mcp.ts` mengembalikan `429` + `Retry-After` saat kuota habis. Migrasi diterapkan ke project Supabase dan diuji (`true, true, false`).
- **Privasi & ketentuan:** Menambahkan `/privacy` dan `/terms`, tautan dari consent page dan connect page, serta penjelasan alur data ke Gemini dan AI client.
- **Connect page:** Menambahkan kartu “Manage connected apps” (tautan ke Supabase OAuth Server), snippet `mcp-remote`, dan tautan Privacy/Terms.
- **Dokumentasi kompatibilitas:** Matriks client (Claude.ai, ChatGPT, Claude Desktop, Cursor, OpenCode, Codex/Gemini CLI, VS Code/Continue/Cline) dan catatan bahwa PAT statis ditunda.
- **Deploy produksi:** Aplikasi dan endpoint remote aktif di `https://cevee-beta.vercel.app`; Site URL Supabase dikoreksi dari `https://cevee.vercel.app` ke domain produksi tersebut. Live smoke: `401` tanpa token, `200` initialize dengan token asli, metadata resource/issuer/`offline_access` benar.
- **OAuth E2E:** Dynamic client registration → authorize `302` ke `/oauth/consent` → consent details → approve → authorization code → token exchange `200` → initialize ke endpoint live `200`. Client uji bernama `Cevee E2E Test (safe to remove)` dan dapat dihapus dari Supabase → Authentication → OAuth Server.
- **Verifikasi:** `npm run build` ✓, `npm run lint` ✓, `npm run typecheck:api` ✓, `npm --prefix mcp test` ✓ (20 test), rate-limit smoke ✓ (`true, true, false`), live smoke ✓, OAuth E2E ✓.

### 1.43.0 — MCP Fase 3: Remote Vercel + OAuth 2.1 Supabase
- **Endpoint Remote (`api/mcp.ts`, `api/oauth-protected-resource.ts`):**
  - Menambahkan handler Edge Streamable HTTP stateless dengan `WebStandardStreamableHTTPServerTransport`.
  - Verifikasi JWT Supabase via JWKS (`jose`), `requireBearerAuth`, dan `WWW-Authenticate` 401 yang menunjuk ke protected resource metadata.
  - Supabase client dibuat dengan token user; RLS menjadi lapisan otorisasi; tidak ada service role.
  - Menambahkan discovery RFC 9728 dan rewrite `vercel.json` untuk `/.well-known/oauth-protected-resource`.
  - Remote `import_resume` hanya menerima `pdfText`.
- **UI OAuth:**
  - Menambahkan `/oauth/consent` (`OAuthConsentPage`) dengan detail client, redirect URI, scope, dan aksi Approve/Deny.
  - Menambahkan `/connect-ai` (`ConnectAiPage`) berisi endpoint, langkah Claude.ai/ChatGPT, snippet Cursor/OpenCode, dan catatan keamanan.
  - Menambahkan tombol `Connect AI` di dashboard.
- **Supabase:** Site URL diset ke `https://cevee-beta.vercel.app`; OAuth server, DCR, dan authorization path `/oauth/consent` aktif; JWKS memakai ES256.
- **Verifikasi:** `npm run build` ✓, `npm run lint` ✓, `npm run typecheck:api` ✓, `npm --prefix mcp run typecheck` ✓, `npm --prefix mcp test` ✓ (20 test), remote local smoke ✓ (401 tanpa token, 200 initialize dengan token, metadata resource/issuer/`offline_access` benar).

### 1.42.0 — MCP Fase 2: Import PDF & Audit ATS
- **Import PDF (`import_resume`):**
  - Menambahkan ekstraksi teks PDF Node di `src/lib/pdf/extractTextNode.ts` menggunakan PDF.js legacy (tanpa DOM/worker).
  - Menambahkan input `pdfText`, `pdfBase64`, dan `filePath` (lokal), lalu memanggil Gemini dan memetakan hasilnya ke `ResumeDocument` baru.
  - Default `save: false` mengembalikan draft; `save: true` membuat resume baru dan tidak pernah menimpa resume yang ada.
  - Menambahkan validasi schema sebelum draft dikembalikan/disimpan, serta batas ukuran base64 ~15 MB.
- **Audit ATS (`ats_audit`):**
  - Menambahkan tool read-only yang memakai `src/lib/domain/ats.ts` untuk skor 0–100, isu critical/warning/info, dan ringkasan konten.
- **Capabilities:** `features.import` sekarang berisi `pdf`.
- **Verifikasi:** `npm run build` ✓, `npm run lint` ✓, `npm run typecheck:api` ✓, `npm --prefix mcp run typecheck` ✓, `npm --prefix mcp test` ✓ (17 test), serta smoke test nyata: `pdfText` → Gemini → draft (5 section), `pdfBase64` → PDF.js → Gemini → draft (1 halaman, 5 section).

### 1.41.0 — MCP Lokal Fase 1, Kebijakan Cache Lokal & Hardening Privasi
- **MCP Lokal (`mcp/`, `src/lib/mcp/`):**
  - Menambahkan `SupabaseResumeStore` (RLS, tanpa service role), `MemoryStore`, dan tool CRUD resume/header/section/item/layout/validasi.
  - Menambahkan resource (`cevee://capabilities`, `cevee://resumes`, `cevee://resumes/{id}`, `cevee://layouts`, `cevee://schema/resume`, `cevee://guides/ats`) dan prompt (`create-resume-from-bio`, `ats-review`).
  - Menambahkan CLI `cevee-mcp login|whoami|logout`, session file owner-only di `~/.cevee`, serta test unit, in-memory, dan stdio (13 test).
  - Semua write memakai `expectedVersion`; delete butuh `confirm: true`; input bullet/summary di-escape menjadi HTML aman.
- **Perlindungan Data Pengguna:**
  - Pengguna login tidak lagi mencerminkan seluruh library resume ke `localStorage`; hanya draft aktif yang belum tersimpan yang disimpan, lalu dihapus setelah save berhasil.
  - Draft dipulihkan saat login berikutnya: auto-merge bila versi sama, dialog konflik bila versi berbeda.
  - Migrasi guest memakai `ignoreDuplicates: true` sehingga tidak pernah menimpa baris cloud atau mereset `version`.
  - Hapus resume kini menunggu konfirmasi database dan mengembalikan baris ke UI bila delete gagal.
  - Menambahkan disclosure bahwa hanya teks PDF yang dikirim ke Google Gemini; file PDF tetap di browser.
- **Verifikasi:** `npm run build` ✓, `npm run lint` ✓, `npm run typecheck:api` ✓, `npm --prefix mcp run typecheck` ✓, `npm --prefix mcp test` ✓ (13 test).

### 1.40.0 — Fondasi MCP, Schema Parity & Optimistic Concurrency
- **Domain Bersama (`src/lib/domain/`, `src/lib/mcp/`):**
  - Menambahkan `resumeFactory.ts` (factory resume/section), `migrations.ts` (`schemaVersion` + preservasi field tak dikenal), `ats.ts` (audit ATS deterministik), dan `html.ts` (helper teks/HTML).
  - Menambahkan schema Zod `resumeDocumentSchema` dengan anotasi `z.ZodType<ResumeDocument>` sebagai pengaman drift tipe.
  - Menambahkan `src/lib/mcp/capabilities.ts` dan paket `mcp/` (server stdio `cevee-mcp`, tool `get_capabilities`, test Vitest + client stdio).
- **Pemisahan Modul Murni:**
  - `src/layouts/ids.ts` dan `src/layouts/catalog.ts` memisahkan metadata layout dari plugin React; `resumeAdapter.ts` tidak lagi mengimpor registry TSX.
  - `src/lib/ai/gemini.ts` mengekstrak parser Gemini dari `api/parse-resume.ts`; handler serverless menjadi tipis.
- **Konkurensi & Konflik:**
  - Menambahkan kolom `resumes.version` (migrasi `supabase/migrations/20261126_add_resume_version.sql`) dan guard update berbasis versi di `resumeService`.
  - Menambahkan dialog `ConflictDialog` dengan aksi **Reload latest** / **Keep mine**; auto-save tidak lagi menimpa perubahan dari sesi lain atau MCP secara diam-diam.
  - Menambahkan `tsconfig.api.json` + script `typecheck:api` agar folder `api/` ikut diperiksa TypeScript.
- **Verifikasi:** `npm run build` ✓, `npm run lint` ✓, `npm run typecheck:api` ✓, `npm --prefix mcp run typecheck` ✓, `npm --prefix mcp test` ✓ (5 test).

### 1.39.0 - Fitur Bahasa Dokumen Resume Per-CV (`en` / `id`) & Label Pendidikan `IPK:`
- **Pemisahan Bahasa Resume vs Bahasa Web (`src/utils/resumeLocale.ts`, `src/types/resume.ts`):**
  - Menambahkan properti `language?: 'en' | 'id'` pada `ResumeContent` (tersimpan otomatis di JSONB Supabase dan `localStorage` tanpa perubahan skema tabel) serta `presetKey?: ResumeSectionPresetKey` pada `BaseResumeSection`.
  - Seluruh antarmuka web tetap berbahasa Inggris (`English US`), sementara konten struktural dokumen A4 mengikuti bahasa resume masing-masing.
- **Kontrol Pengubah Bahasa di Editor & Pembuatan CV (`Navbar.tsx`, `LayoutSelectModal.tsx`, `ResumeDashboard.tsx`):**
  - Menambahkan dropdown `Resume language` (`EN` / `ID`) pada `Navbar` editor (desktop & mobile) tanpa tumpang tindih layout (`shrink-0` tiga zona sejajar).
  - Menambahkan pemilih radio tersegmentasi `Resume language` (`English` | `Bahasa Indonesia`) di Step 2 `LayoutSelectModal` (sejajar vertikal presisi dengan input `Resume title`) untuk alur template kosong maupun import PDF AI.
  - Menambahkan lencana kode bahasa (`EN` / `ID`) pada kartu dan daftar resume di `ResumeDashboard`.
- **Lokalisasi Penuh Seluruh Preset Layout, Tanggal, dan Label `IPK:`:**
  - Mengonversi judul section standar, status relokasi (`(Bersedia relokasi)` / `| Bersedia relokasi`), label pendidikan (`GPA:` ↔ `IPK:`, `Related Coursework:` ↔ `Mata Kuliah Relevan:`, `Final Thesis:` ↔ `Tugas Akhir:`), label sertifikasi (`Credential ID:` ↔ `ID Kredensial:`, `by` ↔ `oleh`), periode tanggal (`May`/`Aug`/`Oct`/`Dec` ↔ `Mei`/`Agu`/`Okt`/`Des`, `Present` ↔ `Sekarang`), serta teks placeholder A4 secara identik 1:1 di kanvas editor, `ResumeContentThumbnail`, `PaginatedResumeView`, dan cetak PDF (`standard-ats-v1`, `modern-photo`, `standard-ats-v2`).
  - Memperbarui `DatePicker` agar menampilkan grid bulan sesuai bahasa resume aktif, memperbarui `periodSort.ts` dengan dukungan singkatan bulan `agu`/`agt`, mengeliminasi titik pemisah kosong pada tautan header kosong di `ResumeHeader` dan layout header, serta memperbarui instruksi `api/parse-resume.ts` agar ekstraksi PDF mempertahankan bahasa asli dokumen sumber.
- **Verifikasi:** `npm run lint` ✓ (0 error), `npm run build` ✓ (TypeScript + Vite bundle lulus), serta verifikasi klik interaktif penuh di browser desktop (`1440px`) dan mobile (`390px`).

### 1.38.0 — Hardening Thumbnail Halaman 1, Numbered List, dan Konsistensi Input Pillow Light
- **Proteksi Halaman 1 Pratinjau Layout Resume (`ResumeContentThumbnail`):**
  - Mengunci antarmuka pratinjau layout di daftar resume (`ResumeDashboard` Grid & List View) agar **hanya merender Halaman 1 (`pages[0]`)** dari resume.
  - State paginasi `pageOneBlocks` disinkronkan secara reaktif dengan `runPagination(blocks, heights, geometry.maxPageHeightPx)[0]`, meniru arsitektur `PaginatedResumeView`.
  - Mengunci inline styles lembar A4 thumbnail pada dimensi fisik `width: 210mm; height: 297mm; max-height: 297mm; overflow: hidden;` serta batas tinggi konten `maxHeight: geometry.maxPageHeightPx; overflow: hidden;` guna mencegah konten halaman 2+ bocor atau terpotong semu.
- **Dukungan Penuh Numbered List (Daftar Bernomor):**
  - `src/components/RichTextEditor.tsx`: Mengonfigurasi `orderedList` Tiptap dengan class `resume-ordered-list`.
  - `src/index.css` & `src/layouts/standard-ats-v2/standard-ats-v2.css`: Memisahkan selector list agar `ul li` menggunakan `list-style-type: disc !important` dan `ol li` menggunakan `list-style-type: decimal !important; display: list-item !important;`.
  - `src/layouts/core/content.tsx` & `types.ts`: Memecah setiap butir `<ol><li>` menjadi item blok terpisah dengan atribut `order`, dan merendernya kembali menggunakan `<ol start={part.order}>` agar penomoran urut tetap kohesif saat mengalir antar halaman.
  - `src/utils/sanitize.ts`: Menambahkan atribut `start` dan `value` ke dalam `ALLOWED_ATTR` DOMPurify.
- **Konsistensi Stroke & Radius Input Form Editor (Pillow Light):**
  - `src/index.css`: Memperbarui token `--input` menjadi `#E5E7EB` (sebelumnya `#FFFFFF`) sehingga seluruh input form editor memiliki garis tepi (*stroke*) border 1px yang tegas dan kontras di atas latar belakang kartu putih.
  - Menambahkan feedback transisi dan hover border pada field input untuk pengalaman pengguna yang lebih taktil.
  - `src/components/ResumeHeader.tsx`: Memperbarui seluruh field input "Header & Contact" agar menggunakan `rounded-lg`, konsisten dengan seluruh section formulir lainnya.
- **UX Daftar Resume & Perbaikan Scroll:**
  - `src/components/ResumeDashboard.tsx`: Memindahkan tombol kartu aksi "Create resume" ke posisi paling akhir setelah daftar resume pengguna.
  - `src/components/ui/dropdown-menu.tsx`: Mengonfigurasi default `modal={false}` pada komponen DropdownMenu untuk menonaktifkan `react-remove-scroll` saat menu tertutup, memulihkan kemampuan scroll gesture sentuh pada mobile dan wheel scroll pada desktop.
- **Verifikasi:** `npm run lint` ✓ (0 error), `npm run build` ✓ (TypeScript + Vite bundle lulus).

### 1.37.0 — Layout Spacing & Anti-Orphan Alignment Across Presets
- **Standard ATS V2 — Eliminasi Spacer & Paritas Margin Item:**
  - Menghapus 4 blok spacer `ref-spacer` (`16.8135px`) di `standard-ats-v2/blocks.tsx` (positions, single experience, projects, education) yang sebelumnya memicu jarak bawah berlebih di pratinjau dan cetak PDF dibanding kanvas editor (editor V2 menol-kan margin antar-item via stylesheet `standard-ats-v2.css`).
  - Menghapus tail margin `mb-2`/`mb-1.5` pada 4 placeholder item V2 serta menyesuaikan estimasi tingginya (`experience` 50.44→42.44, `projects` 37.83→29.83, `education` 50.44→44.44, `custom` 25.22→17.22).
- **Core Packing — Rantai Anti-Orphan Header Section:**
  - `src/layouts/core/packing.ts`: Meningkatkan algoritma anti-orphan dari pemeriksaan blok tunggal menjadi rantai header (`section-title` + `item-head` + `item-subhead`). Judul section dipastikan muat bersama seluruh header dan blok konten pertama di halaman yang sama, mencegah judul tertinggal sendirian di akhir halaman (mis. heading EDUCATION).
- **Standard ATS V1 & Modern Photo — Kalibrasi Jarak Kontak ke Summary:**
  - Memperbaiki jarak bawah antara baris kontak dan summary pada `standard-ats-v1` dan `modern-photo` yang sebelumnya terlalu mepet (hanya 2px saat summary tanpa judul / `showTitle: false`).
  - `src/layouts/shared/single-column-blocks.tsx`: Saat `!shouldShowTitle`, blok summary diberi `mt-2` (8px) untuk ATS V1 atau `mt-2.5` (10px) untuk Modern Photo, dan `estimateSummaryHeight` diperbarui (+8px / +10px).
  - `src/components/sections/SummarySection.tsx`: Menambahkan prop `layoutId` dan class margin atas identik di editor (`mt-2` untuk V1, `mt-2.5` untuk Photo), dengan total jarak visual 10px (ATS V1) dan 12px (Modern Photo) yang identik 1:1 antara editor dan pratinjau.
  - `src/App.tsx`: Meneruskan `layoutId={activeResume.layoutId}` ke `SummarySection`.
- **Verifikasi:** `npm run lint` ✓ (0 error), `npm run build` ✓ (TypeScript + Vite bundle sukses).

### 1.36.0 — Real-Content Page-1 Dashboard Thumbnails & Standard ATS V2 Justification
- **Thumbnail Konten Nyata di Dashboard:** Kartu resume kini merender halaman 1 dari konten resume sungguhan (`ResumeContentThumbnail`) dengan tipografi, rich text, foto profil, dan geometri layout masing-masing — menggantikan wireframe SVG statis pada kartu; resume multi-halaman tampil sebagai kover halaman 1 yang utuh, bukan konten yang dipadatkan.
- **Perbaikan Bug Paginasi Thumbnail:** Thumbnail kini meniru persis pipeline `PaginatedResumeView` (kontainer ukur tersembunyi + pengukuran ulang setelah `document.fonts.ready` + `runPagination()`), sehingga hanya halaman 1 yang dirender dalam rasio A4 asli; teks thumbnail terverifikasi identik dengan halaman 1 modal preview (fill ratio identik pada fixture multi-halaman 2 lembar).
- **Menu Aksi Kartu & Tampilan Daftar:**
  - Menu tiga titik pada kartu dashboard: `Rename resume` (inline, tersimpan langsung via `handleRenameResume`), `Duplicate resume`, `Download PDF`, dan `Delete resume`.
  - Tampilan daftar (*list view*) menambah tombol mata *Quick preview* pada kolom *Actions* (lebar kolom `8.5rem`) dan label waktu relatif `Updated 2 hours ago` (`src/utils/relativeTime.ts`).
- **Perataan Kiri-Kanan (Justify) Standard ATS V2:** Ringkasan (`.resume-summary-text`), paragraf deskripsi (`.ref-para`), dan butir bullet (`.ref-bullet-list li`) kini `text-align: justify` — konsisten dengan `standard-ats-v1`. Berlaku seragam di kanvas editor, modal preview, dan cetak PDF (rule lawan `text-align: left` pada `.text-justify` dihapus dari match). Kategori skills, heading section, dan nama dokumen tetap rata kiri.
  - Bagian aspek layout `standard-ats-v2` (deskripsi + fitur) diperbarui menjadi "justified".
- **Polish AuthPage:** Brand mark Cevee dipindahkan dari top bar ke dalam kartu autentikasi di atas heading.
- **Verifikasi:** `npm run lint` ✓, `npm run build` ✓; suite headless ALL_PASS (22 assertion: identitas teks thumbnail vs halaman 1 modal, V2 justify bullets/para, canvas `.text-justify` aktif, baseline V1 tidak berubah); gate review Better Design (rules, comprehension, inspect-spacing 390/1440/1728) lolos tanpa temuan critical/serius.

### 1.30.0 — Full Codebase Quality, Security & Cloud Audit Hardening
- **Sinkronisasi Kolom Layout Cloud:** Penambahan kolom `layout_id TEXT NOT NULL DEFAULT 'classic-ats'` ke database Supabase `resumes` dengan migrasi otomatis dan mekanisme fallback graceful degradation di `resumeService.ts`.
- **Kredensial Supabase Reaktif:** Getter lazy `getSupabaseUrl()` dan `getSupabaseAnonKey()` di `supabase.ts` dan `AuthPage.tsx` menggantikan konstanta statis agar konfigurasi kredensial lokal langsung aktif tanpa reload halaman.
- **Eliminasi Race Condition Unduh PDF:** Penggantian `setTimeout(250ms)` arbitrer dengan siklus `pendingPrintIdRef` dan `useEffect` di `App.tsx` yang memastikan dokumen target telah ter-render penuh di area print sebelum pencetakan dieksekusi.
- **Proteksi Data Mode Tamu (Guest Exit Confirmation):** Menu "Log out" untuk pengguna guest diubah menjadi "Exit guest mode" dengan dialog konfirmasi eksplisit (`ConfirmDialog`) sebelum data lokal dihapus.
- **Sanitasi Konten & XSS Hardening:** Integrasi library `dompurify` dan utilitas `sanitizeHtml` pada seluruh 8 titik render `dangerouslySetInnerHTML`. Penggantian dialog `window.prompt` pada `RichTextEditor` dengan komponen inline link input terintegrasi.
- **Aksesibilitas & Anti-Slop Visual:**
  - Penambahan atribut `aria-label` yang konsisten pada seluruh tombol ikon interaktif (`PreviewModal`, `RichTextEditor`, `DatePicker`, `SectionHeader`, `AddSectionBar`, `ConfirmDialog`, `Navbar`, `ResumeHeader`).
  - Penggantian kelas non-standar `rounded-xs` menjadi `rounded-sm` pada frame foto `ResumeHeader` dan `PaginatedResumeView`.
  - Peningkatan kontras teks helper/opsional dari `text-slate-400` menjadi `text-slate-500` (WCAG AA).
  - Modal `PreviewModal`: dukungan navigasi tombol `Escape`, penguncian body-scroll saat terbuka, dan kalkulasi dinamis reset zoom.
  - Perbaikan SVG `ResumeMiniPreview` menggunakan `React.useId()` agar ID klip/gradien unik per instance.
- **Optimalisasi Bundle & Tooling:**
  - Konfigurasi code splitting `manualChunks` di `vite.config.ts` untuk memecah vendor chunk (supabase, tiptap, tabler icons), mengeliminasi warning chunk >500 kB.
  - Penambahan konfigurasi flat ESLint 10 (`eslint.config.js`) dan Prettier (`.prettierrc.json`) serta script `lint`, `lint:fix`, `format`, `format:check`. Pembersihan seluruh `any` type via *discriminated union* pada `ResumeSection`.
  - Penambahan meta `description` dan `theme-color` pada `index.html`. Pembersihan dependensi tak terpakai `shadcn`.
- **Eliminasi Skeleton AI Generik:** Mengganti baris skeleton `h-1.5` / `rounded-full` yang terdistorsi dan meninggalkan whitespace berlebihan dengan komponen vektor SVG `ResumeMiniPreview` presisi koordinat milimeter A4 (210 × 297).
- **Struktur Konten Proporsional & Otentik:** Pratinjau layout kini mencerminkan konten nyata Cevee secara proporsional (~80% kepadatan halaman):
  - Header adaptif (`classic-ats` simetris tengah vs `modern-photo` asimetris foto portrait 3:4 dengan siluet formal).
  - Paragraf Summary 3 baris rata kiri-kanan tanpa judul bawaan.
  - Section Work Experience dengan 2 posisi kerja, tanggal rata kanan, dan poin pencapaian berpeluru dot `•`.
  - Section Education, Projects (dengan tautan), Skills terstruktur, dan Certifications.
- **Konsistensi Lintas Komponen:** Dipakai seragam pada sidebar kanvas editor (`LayoutSidebar` via `LayoutThumbnail`) dan dialog modal pra-pembuatan resume (`LayoutSelectModal`).

### 1.28.0 — Full English (US) UX Writing & Microcopy Standardization
- **Standarisasi Bahasa Menyeluruh:** Mengeliminasi seluruh residu teks bahasa Indonesia pada antarmuka pengguna sesuai standar `Default Language: English (US)`.
- **Pembersihan Komponen & CTA:**
  - `Navbar`: Normalisasi istilah konsisten `Resume` (menghapus "CV" pada `Rename resume`), sentence case pada menu dropdown (`Create new resume`, `Duplicate resume`, `Delete resume`), dan penambahan `aria-label` aksesibilitas.
  - `ResumeDashboard`: Tombol kartu diubah dari `Customize` menjadi `Edit resume` (`[Verb] [object]`), label metadata waktu menjadi `Updated:` (paralel dengan `Created:`), dan empty state CTA menjadi `Start building resume`.
  - `LayoutSelectModal` & `LayoutSidebar`: Modal title dan tombol konfirmasi diselaraskan ke sentence case (`Choose resume layout`, `Create resume` / `Apply layout`).
  - `DatePicker`: Normalisasi placeholder default menjadi `Select date`, tombol aksi footer menjadi `This month` dan `Clear`.
  - `AuthPage`: Pembaruan pesan galat OAuth Google (`Google sign-in is not enabled in your Supabase project...`), penulisan pesan validasi tanpa filler `please`, dan pesan error login yang actionable.
  - `RichTextEditor`: Perbaikan dialog URL link menjadi `Enter link URL (e.g. https://example.com):`.
  - `SummarySection` & `PaginatedResumeView`: Penggantian teks placeholder summary lama menjadi panduan ATS profesional 3 baris presisi (`Results-driven professional with proven experience...`).
  - `ExperienceSection`: Normalisasi placeholder bullets rich text (`Describe your responsibilities and achievements...`), label promosi multi-posisi (`Position {n} (Latest / Promotion)`), tombol hapus posisi (`Delete Position`), tombol tambah posisi (`Add Position`), tombol tambah pengalaman (`Add Experience`), dan placeholder tanggal (`Select start date`, `Select end date`).
  - `SkillsSection`: Label form disederhanakan menjadi `Skills *`, petunjuk pemisah koma menjadi `Separate skills with commas`, tombol tambah menjadi `Add category`, dan penambahan aria-labels.
  - `ProjectsSection`: Normalisasi placeholder bullets (`Describe project goals, technical highlights, and key results...`), label deskripsi (`Project Description`), tombol tambah menjadi `Add project`, dan placeholder tanggal (`Select start date`, `Select end date`).
  - `EducationSection`: Tombol tambah menjadi `Add education`, placeholder tanggal (`Select start date`, `Select graduation date`).
  - `CustomSection`: Normalisasi placeholder tanggal sertifikasi/kustom (`Select issue date`, `Select expiry date`, `Select date`), tombol tambah menjadi `Add item`, serta koreksi label menjadi `Expiry Date`.
  - `AddSectionBar`: Normalisasi tombol custom menjadi `Add custom section`.
- **Refinement Modal Konfirmasi:** Teks konfirmasi destruktif pada `ResumeDashboard` dan `Navbar` disederhanakan menjadi pesan universal yang akurat untuk akun lokal maupun cloud (`...permanently deleted.`).

### 1.36.0 — Remediasi Font Type 3, Normalisasi Spasi Nama, Penegakan Unicode Bullet List, & Teks URL Profil (Layout 1 & 2)
- **Eliminasi 100% Font Type 3:**
  - `src/App.tsx`: Rutin `printResume` kini memanggil `document.fonts.load()` untuk seluruh bobot Inter (`400`, `500`, `600`, `700`) dan Arimo, lalu menunggu `await document.fonts.ready` serta dua siklus `requestAnimationFrame` sebelum mengeksekusi `window.print()`.
  - `src/main.tsx`: Pemuatan awal (*early preloading*) font diinisialisasi saat booting aplikasi agar file WOFF2 langsung siap di cache browser.
  - `src/index.css`: Penambahan `font-synthesis: none !important;` pada `.a4-page-sheet`, `.resume-a4-page`, dan `@media print` untuk memblokir faux-bolding procedural yang menyebabkan Skia/Chromium mengonversi teks tebal/semibold menjadi objek Type 3.
  - Hasil audit verifikasi PyMuPDF pada berkas PDF: `Type 3 Font Count: 0`. Seluruh font (`Inter-Bold`, `Inter-Regular`, `Inter-SemiBold`, `Inter-Medium`, `LiberationSans-Bold`, `LiberationSans-Regular`) disematkan sebagai format native `Type0` (CID TrueType) dengan pemetaan Unicode bersih.
- **Normalisasi Spasi Nama Lengkap & Preservasi 1 Baris Kontak (Layout 1):**
  - `src/layouts/standard-ats-v1/header.tsx` & `src/layouts/modern-photo/header.tsx`: Menghapus kelas `tracking-tight` (-0.025em) pada `<h1>` nama lengkap kandidat, digantikan dengan `tracking-normal` dan `letterSpacing: 'normal'`. Nama diekstrak konsisten dengan karakter spasi ASCII standar (`0x20`) di semua mesin ATS tanpa kerning jitter.
  - Preservasi tracking bawaan Inter (`-0.011em`) pada body/kontak sheet serta penggabungan teks relokasi `(Willing to relocate)` ke dalam span lokasi, menjamin baris kontak padat (lokasi, relokasi, email, no. telp, dan 3+ tautan portofolio/Behance/LinkedIn) muat presisi dalam 1 baris tunggal tanpa pembungkusan (*wrap*) yang tidak diinginkan.
- **Kalibrasi Margin Fisik & Spasi Antar Item (Layout 1):**
  - `src/layouts/standard-ats-v1/index.tsx` & `src/index.css`: Margin atas dan bawah lembar fisik A4 untuk layout ATS V1 dikalibrasi menjadi `7.00 mm` (`padding: 7mm 13mm 7mm 13mm`) pada kanvas editor desktop, pratinjau lembar, dan hasil cetak PDF.
  - Tinggi konten efektif diperluas menjadi `283 mm` (`297mm - 7mm - 7mm`), dan batas aman paginasi ditingkatkan menjadi `maxPageHeightPx: 1050` (dari sebelumnya `1020`) untuk kapasitas vertikal maksimal yang tetap aman dari pemotongan halaman.
  - `src/layouts/shared/single-column-blocks.tsx`: Jarak vertikal dari butir poin terakhir ke item posisi / proyek berikutnya (Skenario A) disesuaikan dari `mb-2` (~8px) menjadi `mb-1.5` (~6px), menjaga kepadatan vertikal yang elegan dan proporsional.
- **Karakter Teks Bullet Unicode Asli (U+2022) & Preservasi Layout (Layout 1 & 2):**
  - `src/index.css` & `src/layouts/standard-ats-v2/standard-ats-v2.css`: Aturan bullet list Layout 1 dan Layout 2 diperkuat dengan pseudo-elemen `li::marker { content: '•  ' !important; }`. Titik peluru kini diekspor sebagai karakter teks Unicode `•` (`\u2022`) riil di layer teks PDF (terbaca di pdftotext, PyMuPDF, dan saat disalin ke Notepad), bukan sekadar lingkaran grafis `path`/vektor.
  - Pada Layout 2 (`standard-ats-v2`), `position: relative` pada `li` dihilangkan untuk menjaga urutan teks linier alami dalam stream PDF (menghindari teks bullet tergeser ke bawah section lain), sementara margin `margin-left: 27.0217pt` dipertahankan presisi sesuai spesifikasi tanpa pergeseran visual.
- **Preservasi Display Label Tautan Profil (Layout 2):**
  - Tautan kontak header menampilkan teks label Display pilihan pengguna (`link.label || link.url`), dengan atribut `title={link.url}` dan hyperlink `/URI` aktif agar tetap 100% terbaca dan dapat diekstrak oleh parser ATS tanpa memaksa tampilan teks visual menjadi URL panjang.
- **Verifikasi:** `npm run build` ✓ (bundle sukses), `npm run lint` ✓ (0 error). Audit PDF riil membuktikan zero Type 3 fonts, deteksi teks bullet 100% akurat, dan alamat URL profil terekstrak bersih.

### 1.35.0 — Modularisasi Arsitektur Layout (Layout Registry `src/layouts/*`)
- **Arsitektur Plugin Layout:** Seluruh mesin render & paginasi tiga preset diekstraksi dari monolit `PaginatedResumeView.tsx` menjadi registry plugin modular per layout:
  - `src/layouts/registry.ts` — peta `LAYOUT_PLUGINS` + `getLayoutPlugin()`; core bersama `core/types.ts`, `core/content.tsx`, `core/packing.ts`; blok bersama `shared/single-column-blocks.tsx` + `shared/MiniPreview.tsx`.
  - `standard-ats-v1/`, `standard-ats-v2/`, `modern-photo/` — masing-masing `index.tsx` (plugin: header, blok, geometri, kelas halaman) + `Thumbnail.tsx`; `standard-ats-v2` memuat `blocks.tsx`, `metrics.ts`, dan `standard-ats-v2.css` (CSS referensi diekstraksi dari blok inline menjadi stylesheet terisolasi ber-selektor `data-layout`).
  - `PaginatedResumeView.tsx` kini orkestrator tipis (konsumen registry); `App.tsx` (dispatcher `data-layout`), `main.tsx`, `types/resume.ts`, `data/layouts.ts`, `data/initialData.ts`, `lib/resumeService.ts`, `LayoutSidebar`, `LayoutSelectModal`, `LayoutThumbnail`, `ResumeMiniPreview` menyesuaikan.
- **ID Baru + Normalisasi Legacy Non-Destruktif:** `classic-ats` → `standard-ats-v1`, `reference-nodeflair` → `standard-ats-v2` (`modern-photo` tetap). `normalizeLayoutId()` dipanggil di batas pemuatan data (localStorage `cevee_resumes_v3` & respons Supabase) sehingga dokumen lama tetap terbuka tanpa migrasi database. `DEFAULT_LAYOUT_ID = 'standard-ats-v1'`; urutan katalog sidebar: v1 → modern-photo → v2.
- **Verifikasi Byte-Exact E2E (Helium headless + `Page.printToPDF`, fixture Bangkit identik, guest mode):**
  - `standard-ats-v1`: `69.526` byte — **byte-identik** dengan baseline `e2e-app-current.pdf` kecuali `/CreationDate`+`/ModDate` (10 byte berbeda, 4 rentang, seluruhnya di dalam objek timestamp).
  - `standard-ats-v2`: `75.547` byte — **byte-identik** dengan baseline `e2e-reference-v2.pdf` kecuali timestamp (10 byte, 2 rentang).
  - `modern-photo`: output kode refactor vs kode pra-refactor (worktree HEAD + font static) — diff `6` byte, 2 rentang, murni timestamp; output final `71.396` byte span-identik (118 span, teks & koordinat sama persis).
  - Ketiga layout: objek `Type3 = 0`, substet `Inter-Bold/Regular/SemiBold/Medium` (Type0/CIDFontType2).
- **Catatan Paritas Baseline (Keputusan Disengaja):** Markup label kategori skills dipertahankan dalam bentuk 3 text-node `:{' '}` pada `shared/single-column-blocks.tsx` dan `standard-ats-v2/blocks.tsx` agar reproduksi byte-identik dengan artefak baseline yang telah disetujui pengguna (baseline dihasilkan runtime dev lama dengan struktur tersebut). Bentuk 2-node `: ` menghasilkan teks visual 100% sama, hanya berbeda encoding internal stream PDF (+375 byte) — bukan regresi visual.
- **Verifikasi:** `npm run build` ✓ (bundle + aset font), `npm run lint` ✓ (0 error).

### 1.34.0 — Migrasi Font Inter ke Self-Hosted Statis (Reduksi Ukuran PDF ~68%)
- **Perbaikan Bug (Ukuran PDF Membengkak pada Layout Inter):** Output cetak `classic-ats` dan `modern-photo` menyematkan font **variabel** Google Fonts Inter sebagai **18 objek font Type3 prosedural** (`/CharProcs` — program glyph per karakter), membengkakkan berkas hingga ~3× dibanding `reference-nodeflair` yang menyematkan substet TrueType statis.
- **Solusi:** `@fontsource/inter@^5.3.0` (WOFF2 statis per weight: `400`/`500`/`600`/`700`) di-import dari `src/main.tsx`; tautan CDN Google Fonts dihapus dari `index.html`. Identitas visual Inter tidak berubah (nama family `'Inter'` sama), namun pipeline cetak kini menyematkan substet **Type0/CIDFontType2** seperti referensi, dan aplikasi bebas dependensi CDN font.
- **Hasil Verifikasi A/B Cetak (Helium headless, fixture identik, `Page.printToPDF`):**
  - `classic-ats`: `230.155` → `72.783` bytes (**−68,4%**); objek Type3 `18` → `0`; 4 substet Type0 (`Inter-Bold`, `Inter-Regular`, `Inter-SemiBold`, `Inter-Medium`).
  - `modern-photo`: `231.955` → `74.551` bytes (**−67,9%**); Type3 `18` → `0`; struktur halaman & teks 100% identik.
  - `reference-nodeflair`: tidak terpengaruh (delta posisi `0.000pt`, hanya metadata PDF yang berbeda).
  - Pemenggalan halaman dan pembungkusan baris identik di kedua berkas (jumlah & urutan kata sama); deviasi maksimum `1.06pt` vertikal pada 5 baris heading/kontak (pembulatan baseline statis-vs-variabel), tanpa pergeseran horizontal.
- **Verifikasi:** `npm run build` ✓ (assets WOFF2 Inter ter-bundle), `npm run lint` ✓ (0 error), halaman aplikasi memuat font dari `/node_modules/@fontsource` (tanpa permintaan ke `fonts.googleapis.com`/`fonts.gstatic.com`).

### 1.33.0 — Verifikasi Cetak Presisi Layout Referensi V2 & Kalibrasi Ikon Tautan Proyek
- **Verifikasi Presisi Cetak (Headless Chrome → PDF vektor):** Output cetak `standard-ats-v2` (`reference-nodeflair`) diaudit ankor-per-ankor terhadap PDF spesifikasi referensi (2 halaman, total 217 span teks identik di kedua berkas — bukti zero content loss):
  - Seluruh ankor sumbu-Y (nama, baris kontak, heading section, divider, bullet, ikon, pendidikan) menyimpang ≤ `0.38pt` dari referensi — murni kuantisasi grid pipeline cetak Chrome (300 dpi); tanpa deviasi struktural.
  - Titik pemenggalan halaman identik: halaman 1 berakhir tepat di bullet ke-6 proyek Dokidou; halaman 2 memuat sisa konten + EDUCATION.
  - Lingkungan yang memiliki `Liberation Sans` terpasang (font generator referensi) dirender identik dengan referensi; `Arimo` (metric-compatible) tetap menjadi fallback terpasang untuk lingkungan tanpa Liberation Sans.
- **Perbaikan Bug (Ikon External-Link pada Nama Proyek):** Anchor tautan proyek tidak lagi memakai `inline-flex` (yang menghapus spasi antar elemen dan mengabaikan `vertical-align`); kembali ke aliran inline murni dengan spasi eksplisit — posisi ikon kini presisi (Δ ≤ `0.09pt` terhadap referensi, sebelumnya lenceng hingga `2.3pt`).
- **Divergensi Diterima (Disengaja & Terdokumentasi):** Pemenggalan halaman menggunakan model *atomic-per-item* (`<li>` utuh tidak pernah terbelah antar halaman), berbeda dari generator referensi yang bersifat *line-atomic*. Konsekuensi: bullet ke-7 Dokidou utuh berpindah ke halaman 2 sehingga heading EDUCATION di halaman 2 berada `+12.6pt` (satu baris) lebih rendah dari referensi. Perilaku ini dipertahankan demi integritas item dan konsistensi dengan preset layout lain.

### 1.32.0 — Standard ATS V2 Reference Layout Preset Integration
- **Baru:** Preset layout ketiga `standard-ats-v2` (Standard ATS V2; ID legacy `reference-nodeflair`) — implementasi non-destruktif spesifikasi layout referensi (`PDF_MAKER_REFERENCE_LAYOUT_SPEC.md`):
  - Font stack: `Liberation Sans` / `Arimo` (regular & bold).
  - Tipografi terkalibrasi: Nama `18.01pt` bold `#1F2937`, body & heading seragam `8.41pt` (`#1F2937` / `#212529`), kontak `8.41pt` `#6B7280` dengan underline muted-gray.
  - Line rhythm: `12.61pt` exact baseline-to-baseline advance.
  - Margin fisik: Kiri `26.86pt` (~9.48mm) dan kanan `27.11pt` (~9.57mm), lebar konten efektif `541.03pt`.
  - Alignment: Summary & bullet descriptions berformat rata kiri (*left-aligned*, non-justified).
  - Divider: `0.60pt solid #1F2937`.
- **Preservasi Lintas Format:** Pengguna dapat beralih antara `classic-ats`, `modern-photo`, dan `reference-nodeflair` kapan saja melalui modal pembuatan CV maupun sidebar kiri editor tanpa kehilangan data.

### 1.32.0 — Floating Rounded Navbar & Account Profile Dropdown (Pillow Light)
- **Pembaruan Floating Navbar:** Header bilah navigasi atas dashboard dimodifikasi menjadi model *rounded floating pill* (`rounded-full`, backdrop blur kaca, border halus, elevasi bayangan) yang terangkat mengambang di atas konten halaman.
- **Pembaruan Trigger Profil Akun:** Mengadopsi format pill horizontal terintegrasi dengan foto avatar, nama dan email pengguna (pada desktop), serta ikon panah chevron penunjuk dropdown.
- **Pembaruan:** Modal popup profil pada avatar dashboard diselaraskan dengan referensi desain dan token **Pillow Light**:
  - Menampilkan foto profil, nama pengguna (`Guest` / nama akun), badge status `Beta Tester`, dan email pengguna.
  - Selektor bahasa menampilkan opsi "Language" dengan bendera UK (status aktif terpilih) dan bendera Indonesia (non-aktif/segera hadir).
  - Tombol keluar terpadu dengan label "Exit guest mode" / "Log out" dan ikon merah berlatar rounded box.
  - Standarisasi copy 100% bahasa Inggris konsisten di seluruh elemen menu akun.
- **Pembaruan Toolbar Dashboard:** Input pencarian resume pada toolbar dashboard kini berukuran dinamis (`sm:flex-1 sm:min-w-0`) mengisi ruang horizontal hingga mendekati tombol filter sortir ("Last updated") dan view mode switcher (`sm:gap-3`), menciptakan tata letak yang proporsional dan mudah diakses.

### 1.31.0 — Comprehensive PDF Formatting & Layout Specification
- **Dokumentasi Terpadu:** Pembuatan dokumen `PDF_FORMATTING_SPEC.md` yang merinci 100% parameter tipografi dan tata letak output PDF vektor:
  - Dimensi lembar fisik A4 (`210mm × 297mm`), margin padat ATS (`10mm` atas, `13mm` samping, `12mm` bawah, printable content `184mm × 275mm`), dan ambang paginasi deterministik `1020px`.
  - Spesifikasi tipografi terperinci per elemen: Nama `17pt` bold tracking-tight, roles/kontak/section title `8.5pt`, konten/bullet/summary `7.75pt` line-height 1.48 text-justify.
  - Aturan proteksi anti-orphan untuk header section dan sub-header posisi, split-bullet lintas lembar, serta isolasi `@media print` murni vektor bebas artefak.

### 1.27.1 — Profile Photo 3:4 Aspect Ratio Fix & State Preservation
- **Perbaikan Bug:** Eliminasi kalkulasi dimensi kompresi kanvas yang menyebabkan gambar terdistorsi vertikal ("gepeng"). `compressProfilePhoto` kini melakukan crop tengah otomatis (*center-crop*) presisi rasio 3:4 (300x400 px).
- **Perbaikan State:** Nilai `data.photoUrl` kini dipreservasi secara konsisten saat membuka mode edit header (bahkan ketika resume berstatus placeholder), serta ditampilkan langsung pada kotak pratinjau form edit.

### 1.27.0 — Modern Photo Layout Preset with 3:4 Portrait Profile Frame
- **Baru:** Preset layout kedua `modern-photo` (Photo Header Single-Column) — header asimetris dengan bingkai foto profil portrait rasio 3:4 (~22mm x 28mm) di sisi kiri, serta nama kandidat bold dan kontak terpadu rata kiri di samping foto.
- **Pembaruan:** Uploader foto profil terintegrasi pada form edit header dengan kompresi kanvas client-side (`compressProfilePhoto`) Base64 hemat memori (~30 KB).
- **Pratinjau Sinkron:** Wireframe thumbnail pada sidebar kiri secara otomatis membedakan layout `classic-ats` (header tengah) dan `modern-photo` (header berfoto 3:4) secara visual murni tanpa teks.
- **Dukungan Cetak:** `PaginatedResumeView` merender foto profil secara deterministik pada mode pratinjau dan ekspor cetak PDF 1:1.

### 1.30.0 — MagneticDropZone for PDF Resume Import
- **Pembaruan:** Menggantikan dropzone native dengan komponen `MagneticDropZone` berbasis `motion/react` dengan efek fisika pegas magnetik yang responsif terhadap pergerakan kursor saat menarik file.

### 1.29.0 — PasswordStrength Component on Sign Up Page
- **Pembaruan:** Halaman registrasi / sign up (`AuthPage`) kini dilengkapi komponen resmi `PasswordStrength` dari Pillow Light.
- **Fitur Evaluasi:** Meter kekuatan password berbasis 4 segmen warna dinamis (`Empty`, `Weak`, `Fair`, `Good`, `Strong`), deteksi pola umum/tebakan populer (`Commonly guessed`), serta checklist kriteria keamanan (minimal 8 karakter, huruf besar & kecil, angka, dan karakter khusus) yang terupdate secara real-time.

### 1.30.0 — Final Thesis Field & Embedded Hyperlink in Education Section
- **Pembaruan:** Menambahkan opsi pengisian "Final Thesis" pada section Education di seluruh layout ATS (V1, V2, Modern-Photo).
- **Embedded Hyperlink:** Judul skripsi/tugas akhir langsung di-embed dengan URL naskah (`thesisUrl`) sebagai tautan interaktif murni tanpa ikon tambahan, dapat diklik langsung di kanvas editor dan pratinjau PDF.
- **Konsistensi Label GPA:** Layout ATS V1, Modern Photo, dan kanvas editor kini memuat label tebal `GPA: ` seragam persis seperti ATS V2.
- **Tata Letak & Justify:** Baris thesis dirender dengan label tebal `Final Thesis:` dan teks rata kanan-kiri (*text-justify*). Pada Layout 3 (ATS V2), seluruh baris turunan pendidikan (Related Coursework, Final Thesis, dan deskripsi) diberi indentasi presisi `padding-left: 4.8039pt` (`.ref-edu-para`) sehingga sejajar 1:1 dengan Degree dan Institution (`.ref-row`).
- **Skema Data:** Menambahkan field opsional `thesisTitle?: string` dan `thesisUrl?: string` pada `EducationItem` dan `ParsedEducationItemRaw`.

### 1.29.0 — Document Link & Related Coursework in Education Section & All Layouts
- **Pembaruan:** Menambahkan opsi pencantuman tautan dokumen (transkrip nilai, ijazah/sertifikat kelulusan) di samping nama gelar/degree dan input Related Coursework dengan perataan teks rata kanan-kiri (*text-justify*) pada section Education.
- **Form Editor:** Field Document link (URL) dengan opsi Link label kustom (default ikon eksternal di samping nama gelar), serta field Related coursework untuk mendaftar mata kuliah relevan.
- **Integrasi Layout:** Seluruh preset layout (`standard-ats-v1`, `standard-ats-v2`, `modern-photo`, dan pratinjau kanvas editor) merender tautan dokumen di samping nama gelar dan baris `Related Coursework:` berformat tebal dan rata kanan-kiri sebelum deskripsi.
- **Skema Data:** Menambahkan field opsional `url?: string`, `urlLabel?: string`, dan `relatedCoursework?: string` pada `EducationItem` dan `ParsedEducationItemRaw`.

### 1.28.0 — OnboardingStepper & TaskSteps Redesign for Resume Creation
- **Pembaruan:** Redesain modal pembuatan resume (`LayoutSelectModal`) mengadopsi komponen resmi Pillow Light:
  - **`OnboardingStepper` (`ix-onboarding-stepper`):** Menggantikan progress bar kaku dan tombol pill ganda dengan indikator segmen horizontal presisi (`segments`), transisi `motion/react`, dan teks status langkah `Step X of 2` bersanding dengan persentase `50%` / `100%`.
  - **`TaskSteps` (`ix-task-steps`):** Menggantikan baris progress bar AI lama dengan daftar tugas interaktif multi-status (`Extracting PDF document text` -> `Structuring experience and skills with AI` -> `Formatting layout and readying editor`) dengan animasi arc spinning, shimmer gradient text, centang hijau sukses, dan cross icon saat error.

### 1.27.0 — Currently Enrolled / Studying Option in Education Section
- **Pembaruan:** Menambahkan opsi status sedang menempuh pendidikan via checkbox `[ ] I currently study here` pada form editor section Education.
- **Perilaku UX:** Jika dicentang (`current: true`), field "End date or graduation" otomatis dinonaktifkan (`disabled`), tanda bintang wajib `*` disembunyikan, dan tanggal periode terkomputasi menjadi `[Start Date] - Present` (atau `Present`).
- **Skema Data:** Menambahkan field opsional `current?: boolean` pada tipe `EducationItem` dan parser resume AI `ParsedEducationItemRaw`.

### 1.26.2 — Left Sidebar Container Architecture (Mobbin-Aligned)
- **Pembaruan:** FR-12.2 disempurnakan sesuai referensi Mobbin (Adobe Express / Ditto / Canva) — arsitektur tata letak kini menggunakan **Left Sidebar Container** mandiri yang terpasang (*docked*) di sisi kiri layar di bawah navbar, dengan selector layout murni visual (tanpa teks) tertata rapi di dalamnya.

### 1.26.1 — Left Sidebar Pure Preview Layout Selector
- **Pembaruan:** FR-12.2 dimodifikasi — kontrol pergantian layout pada halaman editor kini ditempatkan di **sidebar kiri** (`LayoutSidebar`) dengan tampilan **pratinjau visual murni (thumbnail wireframe A4) tanpa teks apa pun** di dalam atau di sekitar kartu.
- **Desain Responsif:** Desktop (`≥ 1040px`) sticky di sisi kiri kanvas A4; mobile/tablet via drawer flyout kiri yang terisolasi dari cetak (`no-print`).

### 1.26.0 — Resume Layout Selection & Switching
- **Baru:** FR-12 (Fitur Pemilihan & Pergantian Layout Resume) — implementasi alur wajib memilih format layout sebelum membuat dokumen baru (`Pre-Creation Selection`) dan opsi mengganti layout kapan saja saat kanvas editor terbuka (`In-Editor Switching`).
- **Baseline Katalog:** Mengukuhkan 1 pilihan layout awal `classic-ats` (Standard Single-Column ATS) dengan arsitektur terbuka yang siap menerima format baru tanpa perombakan struktur data.
- **Diperbarui:** Lingkup Produk (§1.2 butir 13), Alur Pembuatan Resume (§3.2 FR-2.2), serta Skema Data TypeScript (§4.2 `ResumeLayoutId`).

### 1.25.0 — Responsive Mobile & Touch Experience
- **Baru:** FR-11 (Responsive Mobile & Touch Experience) — kanvas A4 mengalir ulang di bawah `900px`, navbar dua baris di mobile, kontrol editor berbasis `hover` selalu tampil di layar sentuh, baris aksi form edit membungkus, popover tanggal aman viewport, dan modal preview PDF *fit-to-width*.
- **Baru:** FR-3.5 (Universal Month-Year Date Picker) — komponen pemilih bulan-tahun seragam untuk seluruh field tanggal.
- **Diperbarui:** FR-3.1 (perilaku responsif `.resume-a4-page`), FR-4.4 (bilah aksi touch-friendly), FR-3.5/5 (multi-posisi & promosi pada Work Experience), FR-7.1 (debounce 800ms, diselaraskan dengan kode), FR-8.4 (zoom 25%-150% + *fit-to-width*).
- **Diperbarui:** Skema data (§4.2) — menambahkan `ExperiencePosition`, field `positions`/`startDate`/`endDate`/`current` pada `ExperienceItem`, tanggal pada `ProjectItem`/`EducationItem`, dan `CustomSectionItem`.
- **Diperbarui:** Target Platform kini mencakup mobile; NFR #6 (Responsivitas Mobile) ditambahkan.

### 1.24.0
- FR-9: Fitur Download PDF vektor dengan penamaan file otomatis.
- FR-10: Styling cetak presisi 1:1, eliminasi artefak ekstensi, konsistensi tipografi cetak.
