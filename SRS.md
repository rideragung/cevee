# Software Requirements Specification (SRS)
# Project: Cevee (Personal CV Generator)

**Dokumen Versi:** 1.36.0  
**Status:** Approved  
**Model Operasional:** 100% Free-Tier (Zero Cost)  
**Target Platform:** Web (Responsive — Desktop, Tablet & Mobile)  
**Default Language:** English (US)

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

### 1.3 Batasan Biaya & Aturan Non-AI (Strict Constraints)
- **Zero Cost (Rp 0):** Seluruh infrastruktur wajib berjalan di tingkat gratis permanen (*free tier*) tanpa kewajiban kartu kredit.
- **Tanpa AI:** Tidak ada fitur peringkas atau generator kalimat berbasis LLM di dalam aplikasi. Sistem berfokus pada ketepatan format, penataan konten manual terstruktur, dan performa instan.

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
| **Icons** | Lucide React | Ikon antarmuka ringan dan konsisten |
| **Fonts** | `@fontsource/inter` + `@fontsource/arimo` | WOFF2 statis self-hosted (bebas CDN; substet Type0 saat cetak PDF) |
| **Backend & DB** | Supabase (PostgreSQL 15+) | Autentikasi email, database JSONB, Row Level Security (RLS) |
| **PDF Engine** | Native Print Engine (`window.print()` + CSS `@page`) | Cetak vektor PDF presisi A4 tanpa watermark |
| **Code Quality** | ESLint 10 + Prettier | Flat config strict typing, hooks check, & automated lint |
| **Deployment** | Vercel / Cloudflare Pages | Hosting static web gratis |

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

### 3.2 FR-2: Manajemen Multi-CV & Resume Dashboard
- **FR-2.1 (Resume Dashboard & Default Landing View):**
  - **Halaman Awal:** Saat pengguna membuka aplikasi, pengguna pertama kali diarahkan ke halaman **Resume Dashboard** (`ResumeDashboard`) yang menampilkan daftar seluruh CV yang dimiliki sebelum memasuki kanvas kustomisasi.
  - **Kartu Resume Terstruktur:** Setiap resume ditampilkan dalam kartu informatif memuat judul CV, nama kandidat, tanggal pembaruan terakhir (`relativeTime` — "Updated 2 hours ago"), jumlah section, serta tombol aksi cepat: *Edit resume* (membuka editor kanvas), *Quick Preview* (modal pratinjau instan), dan menu tiga titik berisi *Rename resume* (inline, langsung tersimpan), *Duplicate resume*, *Download PDF*, dan *Delete resume*. Pada tampilan daftar (*list view*), kolom *Actions* menyediakan tombol mata (*Quick preview*) dan menu tiga titik yang sama.
  - **Thumbnail Konten Nyata (Real-Content Thumbnail):** Kartu dashboard merender halaman 1 dari konten resume sungguhan dengan tipografi dan geometri layout masing-masing (`ResumeContentThumbnail`), menggantikan wireframe SVG statis. Konten mendukung rich text, foto profil, dan skala A4 aslinya.
  - **Kondisi Kosong (Empty State Anti-Slop):** Jika pengguna belum memiliki resume sama sekali (0 resume), dashboard menampilkan antarmuka bersih tanpa ilustrasi generik:
    - Judul: *"No resumes created yet"*
    - Penjelasan: *"You haven't created any resumes yet. Start building your first ATS-friendly resume to edit and download."*
    - Tombol primer: *"Start building resume"* yang langsung menginisialisasi template standar dan mengarahkan pengguna ke kanvas editor.
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
  - Thumbnail kartu dashboard menampilkan **hanya halaman 1** dari resume, bukan seluruh konten yang dipadatkan/terpotong ke dalam satu lembar.
  - `ResumeContentThumbnail` meniru persis pipeline `PaginatedResumeView`: kontainer ukur tersembunyi mengukur tinggi `getBoundingClientRect()` setiap blok (dikalibrasi ulang setelah `document.fonts.ready`), kemudian `runPagination()` di `layouts/core/packing.ts` mengambil halaman pertama dengan geometri layout (`maxPageHeightPx`, lebar konten, tipografi) yang sama persis.
  - Hasilnya identik 1:1 dengan halaman 1 modal preview — resume multi-halaman tampil sebagai kover halaman 1 yang utuh (whitespace bawah fisik dipertahankan), dan teks thumbnail terverifikasi identik dengan pratinjau print.

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
    6. **Work Experience Khusus:** Checkbox `[ ] I am currently working in this role`, grid 4 kolom (Position, City/Country, Start Date, End Date dengan tombol silang `x` pembatalan cepat), serta toolbar Rich Text Tiptap langsung terintegrasi di atas box deskripsi tugas.
    7. **Skills Khusus:** Input Skill Category dan Textarea List of skills dengan catatan panduan `Use comma to separate each skill`.
    8. **Bilah Aksi Bawah Terpadu:**
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
5. **Education Section:** Gelar, institusi, tahun, dan nilai (GPA).
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
  - Modal menampilkan daftar layout yang tersedia dengan thumbnail/pratinjau visual dan deskripsi ringkas format.
  - Pengguna memilih format layout yang diinginkan (default terpilih: layout standar aktif) dan menekan tombol konfirmasi pembuatan (*Use Layout* / *Create*) untuk membuat dokumen.
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
  gpa?: string;
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

export interface BaseResumeSection {
  id: string;
  title: string;          // BEBAS DIKUSTOMISASI OLEH USER
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
  - Konfigurasi code splitting `manualChunks` di `vite.config.ts` untuk memecah vendor chunk (supabase, tiptap, lucide), mengeliminasi warning chunk >500 kB.
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
