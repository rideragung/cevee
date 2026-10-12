# Software Requirements Specification (SRS)
# Project: Cevee (Personal CV Generator)

**Dokumen Versi:** 1.22.0  
**Status:** Approved  
**Model Operasional:** 100% Free-Tier (Zero Cost)  
**Target Platform:** Web (Desktop & Tablet First)  
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
2. Mengedit teks langsung di atas kanvas format standar A4 (in-place WYSIWYG) dengan margin padat standar ATS (`10mm` atas, `13mm` samping).
3. Header adaptif dengan baris Role / Headline opsional yang dapat diisi atau disembunyikan bebas, serta tautan portofolio bergaris bawah (*underlined*).
4. Section Summary tanpa judul "SUMMARY" bawaan yang langsung tampil di bawah kontak dengan format rata kiri-kanan (*justify*) dan tipografi presisi `7.75pt` (menghasilkan susunan 3 baris padat sesuai standar referensi).
5. Melakukan format teks kaya (Bold, Italic, Underline, Link, Bulleted List).
6. Menyesuaikan nama judul setiap section secara bebas (tidak terkunci pada nama bawaan).
7. Menambah section preset maupun section kustom buatan sendiri.
8. Mengatur urutan section (naik/turun) dan menghapus section yang tidak diperlukan.
9. Pratinjau dokumen (PDF Live Preview) yang mencerminkan 1:1 bentuk PDF asli sebelum dicetak/diunduh, lengkap dengan indikator pemisah halaman A4.
10. Mengunduh CV langsung dalam format file `.pdf` dengan penamaan file otomatis dan kualitas vektor bersih.
11. Menyimpan data otomatis ke database Supabase dan cadangan lokal `localStorage`.

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
| **Icons** | Lucide React | Ikon antarmuka ringan dan konsisten |
| **Backend & DB** | Supabase (PostgreSQL 15+) | Autentikasi email, database JSONB, Row Level Security (RLS) |
| **PDF Engine** | Native Print Engine (`window.print()` + CSS `@page`) & PDF.js | Cetak vektor PDF presisi A4 tanpa watermark |
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
  - **Kartu Resume Terstruktur:** Setiap resume ditampilkan dalam kartu informatif memuat judul CV, nama kandidat, tanggal pembaruan terakhir, jumlah section, serta tombol aksi cepat: *Customize* (membuka editor kanvas), *Quick Preview* (modal pratinjau instan), *Duplicate*, dan *Delete*.
  - **Kondisi Kosong (Empty State Anti-Slop):** Jika pengguna belum memiliki resume sama sekali (0 resume), dashboard menampilkan antarmuka bersih tanpa ilustrasi generik:
    - Judul: *"No resumes created yet"*
    - Penjelasan: *"You haven't created any resumes yet. Start building your first ATS-friendly resume to customize and download."*
    - Tombol primer: *"Start Building Resume"* yang langsung menginisialisasi template standar dan mengarahkan pengguna ke kanvas editor.
  - **Navigasi Antar Halaman:** Di kanvas editor, pengguna dapat kembali ke halaman Dashboard kapan saja melalui logo Cevee atau tombol navigasi *"Dashboard"* di bilah navbar atas.
- **FR-2.2 (Create New Resume Standard Template):** Saat pengguna membuat CV baru, sistem secara otomatis menginisialisasi dokumen dengan struktur standar referensi:
  1. **Header:** 'Your Name', 'City, State/Country', 'email@address.com', '+65 1234 5678', serta 3 tautan portofolio (`linkedin.com/in/your_linkedin`, `github.com/username`, `otherlink.com`).
  2. **Urutan Section Bawaan:** Summary (tanpa judul), WORK EXPERIENCE, EDUCATION, PROJECTS, SKILLS.
  3. **Warna Teks Acuan:** Seluruh teks pada dokumen baru dimulai dalam status placeholder berwarna abu-abu redup (`text-slate-400`).
  4. **Formulir Kosong Saat Edit:** Saat pengguna mengklik untuk mengedit header maupun section, seluruh kolom input dimulai dalam keadaan kosong (`value=""`) dengan panduan di atribut `placeholder`.
- **FR-2.3 (Duplicate):** Pengguna dapat menduplikasi CV yang sudah ada untuk membuat variasi CV (misal: "CV - Product Designer" dan "CV - Frontend Dev").
- **FR-2.4 (Rename):** Pengguna dapat mengubah nama internal dokumen CV.
- **FR-2.5 (Delete & Danger Prevention Modal via React Portal):**
  - Seluruh tindakan penghapusan CV (dari dashboard maupun navbar dropdown) dan penghapusan section pada editor dilindungi modal pencegahan khusus (`ConfirmDialog`) menggantikan dialog browser native.
  - **Portal Stacking-Context Elimination:** Seluruh modal `ConfirmDialog` dirender menggunakan `ReactDOM.createPortal` langsung ke `document.body` dengan z-index `z-[9999]`. Ini mengeliminasi bug CSS stacking context di mana modal sebelumnya terperangkap di dalam batas header bernavigasi `backdrop-blur`.
  - **Click-Outside & Dismissal Resilient:** Dropdown pemilih CV di Navbar dilengkapi backdrop transparan (`fixed inset-0 z-40`) yang stabil, menghilangkan efek glitch penutupan prematur dari event `onMouseLeave`, sehingga tombol *Delete Resume* dapat diklik dengan responsif dan memunculkan modal di tengah layar penuh.
  - Dialog modal memuat ikon peringatan segitiga merah (`AlertTriangle bg-red-50 text-red-600`), judul spesifik dengan nama objek, penjelasan konsekuensi permanen, tombol penolakan berorientasi verba (`Keep Resume` / `Keep Section`), dan tombol destruktif primer (`Delete Resume` / `Delete Section`).
  - Mendukung navigasi keyboard: tombol `Escape` untuk membatalkan dialog serta penguncian scroll latar belakang (`overflow: hidden`) saat modal aktif.
- **FR-2.6 (Switch Active):** Pengguna dapat berpindah dari satu CV ke CV lain tanpa me-refresh halaman.
- **FR-2.7 (UX Writing & Microcopy Standards):** Seluruh tombol aksi, tooltip, status indikator, dan teks konfirmasi distandarisasi ke bahasa Inggris profesional yang ringkas, berorientasi tindakan (*verb-oriented*), dan bebas dari emoji atau jargon generik.

### 3.3 FR-3: In-Place Canvas & Editor (WYSIWYG)
- **FR-3.1 (A4 Container & Margin Padat):** Area kerja menampilkan lembar putih dengan rasio aspek A4 (210mm x 297mm) dengan margin padat standar ATS: `10mm` (atas), `13mm` (samping kiri-kanan), dan `12mm` (bawah) guna memaksimalkan kepadatan informasi dokumen.
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

### 3.4 FR-4: Kustomisasi & Kontrol Section Penuh
- **FR-4.1 (Rename Title Bebas):** Setiap judul section dapat diklik dan diedit langsung (misal: dari "WORK EXPERIENCE" menjadi "PENGALAMAN KERJA" atau "RIWAYAT PROYEK"). Tidak ada section yang judulnya terkunci.
- **FR-4.2 (Reorder Section):** Setiap section memiliki kontrol tombol:
  - `Move Up (↑)`: Menukar posisi section dengan section di atasnya.
  - `Move Down (↓)`: Menukar posisi section dengan section di bawahnya.
- **FR-4.3 (Delete Section):** Tombol tempat sampah (`Trash`) untuk menghapus section terkait dari dokumen.
- **FR-4.4 (Section Actions Hover Pill):**
  - Saat section diarahkan kursor (*hover*), sebuah bilah aksi mengambang berbentuk kotak putih dengan border abu-abu dan bayangan halus (`bg-white border border-slate-200 rounded-md shadow-xs px-1.5 py-0.5 flex items-center gap-1`) muncul di pojok kanan atas section.
  - Memuat tombol aksi: Ikon pensil abu-abu (`Pencil text-slate-600 hover:text-slate-900`) dan ikon tong sampah merah (`Trash2 text-red-500 hover:text-red-700`), serta panah reorder naik/turun jika berlaku.
  - Bilah ini tersembunyi secara default (`opacity-0 group-hover:opacity-100`) dan otomatis hilang saat cetak/preview.
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
   - Format teks rata kiri-kanan (*justify*) dengan ukuran font presisi `7.75pt` dan line-height `1.38` seimbang, menjamin paragraf ringkasan memecah tepat dalam 3 baris proporsional sesuai dokumen referensi.
   - Kontrol toolbar edit (Tiptap) tetap aktif saat teks diklik atau saat kursor diarahkan ke area summary.
2. **Key-Value / Skills Section:** Kategori dan daftar item (contoh: "Design & Research: ...", "Tools: ...").
3. **Timeline / Experience Section:** Berisi kumpulan item pengalaman:
   - Posisi / Jabatan
   - Nama Perusahaan / Instansi
   - Periode Waktu (Bulan Tahun - Bulan Tahun)
   - Lokasi & Tipe (Remote / On-site)
   - Poin-poin pencapaian (Bulleted list format Tiptap)
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
- **FR-7.1 (Debounce):** Setiap ketukan tuts keyboard memicu penyimpanan lokal seketika dan mengirim permintaan update ke Supabase dengan jeda debounce 1000ms.
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
- **FR-8.4 (Zoom & Page Indicators):** Dilengkapi kontrol zoom (50% - 150%) dan indikator penomoran lembar (*Page X of Y*).
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
- **FR-10.3 (Client-Side Photo Compressor Readiness):** Disertakan modul utilitas kompresi kanvas HTML5 client-side (`compressProfilePhoto`) yang otomatis mengubah ukuran dan mengompresi foto profil menjadi maksimal 320x320 px (~20-40 KB) sebelum disematkan ke dokumen, menjaga file PDF tetap di bawah 100 KB bahkan ketika layout foto diaktifkan.

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

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  location: string;
  period: string;  // contoh: "Aug 2025 - Dec 2025"
  bullets: string; // rich text HTML dari Tiptap
}

export interface ProjectItem {
  id: string;
  name: string;
  url?: string;
  period: string;
  bullets: string;
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  period: string;
  gpa?: string;
}

export type SectionType = 
  | 'summary'
  | 'skills'
  | 'experience'
  | 'projects'
  | 'education'
  | 'custom_list'
  | 'custom_text';

export interface ResumeSection {
  id: string;
  type: SectionType;
  title: string;          // BEBAS DIKUSTOMISASI OLEH USER
  showTitle?: boolean;    // Dapat disembunyikan (misal: default false untuk summary)
  isPlaceholder?: boolean;// Menampilkan format dummy saat baru ditambahkan tanpa mengunci input
  data: any;             // Menampung array items atau string HTML sesuai tipe
}

export interface ResumeDocument {
  id: string;
  title: string;
  layoutId?: string; // Layout template selector ('classic-ats' | 'modern-sidebar')
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
