# Cevee

Cevee adalah aplikasi pembuat resume (CV) profesional yang berfokus pada format **ATS-friendly (Applicant Tracking System)**, estetika minimalis, dan sinkronisasi cloud real-time. Aplikasi ini dirancang agar dokumen hasil ekspor memiliki tata letak standar A4 yang presisi 1:1 tanpa artefak pemotongan halaman.

---

## Fitur Utama

- **ATS-Friendly Formatting**: Menggunakan hierarki tipografi standar, urutan elemen terstruktur, dan pemisah garis presisi (hairline 0.5px) yang terbaca optimal oleh sistem ATS scanner.
- **1:1 PDF Print & Download**: Mesin cetak berbasis CSS print terisolasi menghasilkan file PDF vektor murni tanpa margin terpotong, tanpa halaman blank, dan tanpa pembengkakan ukuran file.
- **Rich Text Editor**: Didukung oleh Tiptap untuk format teks deskripsi pekerjaan (bold, underline, link, bullet list).
- **Multi-Resume Management**: Buat, duplikasi, ganti nama, dan kelola beberapa versi resume untuk berbagai posisi pekerjaan.
- **Cloud Sync & Guest Mode**:
  - **Cloud Mode**: Terhubung dengan database Supabase secara real-time melalui enkripsi dan Row Level Security (RLS).
  - **Guest Mode**: Berfungsi penuh secara offline/lokal menggunakan penyimpanan `localStorage` pada perangkat pengguna tanpa memerlukan registrasi.
- **Modern Clean Interface**: Kanvas editor dengan sudut rounded bergaya iOS, panel kustomisasi interaktif, dan modal pratinjau A4 responsif.

---

## Tech Stack

| Kategori | Teknologi |
| --- | --- |
| **Frontend Framework** | React 18, TypeScript |
| **Bundler & Build Tool** | Vite |
| **Styling** | Tailwind CSS |
| **Rich Text Engine** | Tiptap (StarterKit, Underline, Link) |
| **Icons** | Lucide React |
| **Backend & Auth** | Supabase (PostgreSQL, Auth, Row Level Security) |
| **Deployment Target** | Vercel (SPA Rewrites) |

---

## Struktur Direktori

```text
├── src/
│   ├── components/
│   │   ├── sections/           # Komponen tiap bagian resume (Experience, Education, Skills, dll.)
│   │   ├── AddSectionBar.tsx   # Toolbar penambahan section kustom
│   │   ├── AuthPage.tsx        # Halaman autentikasi (Email & Google OAuth)
│   │   ├── ConfirmDialog.tsx   # Dialog konfirmasi aksi destruktif
│   │   ├── Navbar.tsx          # Navigasi utama, indikator sync cloud, & download PDF
│   │   ├── PaginatedResumeView.tsx # Engine kalkulasi sheet A4 & print renderer
│   │   ├── PreviewModal.tsx    # Modal pratinjau 1:1 format PDF
│   │   ├── ResumeDashboard.tsx # Dashboard manajemen banyak resume
│   │   ├── ResumeHeader.tsx    # Editor data kontak & profile header
│   │   └── RichTextEditor.tsx  # Wrapper editor teks Tiptap
│   ├── data/
│   │   └── initialData.ts      # Template resume awal
│   ├── lib/
│   │   ├── resumeService.ts    # Service query & mutasi Supabase
│   │   └── supabase.ts         # Inisialisasi Supabase client
│   ├── types/
│   │   └── resume.ts           # Type definitions TypeScript
│   ├── App.tsx                 # Root application controller
│   └── index.css               # A4 dimensions & print styles
├── .env.example                # Template variabel lingkungan
├── vercel.json                 # Konfigurasi routing SPA untuk Vercel
└── vite.config.ts              # Konfigurasi Vite
```

---

## Memulai Proyek (Local Development)

### 1. Prasyarat
- Node.js (v18.0.0 atau lebih baru)
- npm / pnpm / yarn

### 2. Kloning & Instalasi
```bash
git clone https://github.com/rideragung/cevee.git
cd cevee
npm install
```

### 3. Konfigurasi Environment Variables
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```

Isi variabel dengan kredensial Supabase Anda:
```env
VITE_SUPABASE_URL=https://<project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key-anda>
```

### 4. Menjalankan Server Development
```bash
npm run dev
```
Buka browser di `http://localhost:5173`.

### 5. Build Produksi
```bash
npm run build
```
Hasil build siap saji akan berada di dalam direktori `dist/`.

---

## Skema Database Supabase

Jika menggunakan database Supabase pribadi, buat tabel `resumes` menggunakan query SQL berikut di SQL Editor Supabase:

```sql
CREATE TABLE IF NOT EXISTS public.resumes (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL DEFAULT auth.uid(),
  title TEXT NOT NULL DEFAULT 'Untitled Resume',
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS resumes_user_id_idx ON public.resumes(user_id);

ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own resumes"
  ON public.resumes FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own resumes"
  ON public.resumes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own resumes"
  ON public.resumes FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resumes"
  ON public.resumes FOR DELETE USING (auth.uid() = user_id);
```

---

## Deployment ke Vercel

1. Import repositori GitHub `rideragung/cevee` ke dashboard Vercel.
2. Di bagian **Environment Variables**, tambahkan:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Klik **Deploy**.
4. Di dashboard Supabase (**Authentication** → **URL Configuration**), tambahkan domain produksi Vercel ke daftar **Redirect URLs** (`https://<domain-anda>.vercel.app/**`).
