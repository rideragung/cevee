# Cevee

**Build, edit, and export ATS-friendly resumes right in the browser.**

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)

Cevee is a resume builder for anyone who has watched a perfectly good CV disappear into an applicant tracking system. Instead of guessing how a PDF will render, you edit directly on a real A4 sheet — type into the page, rearrange sections in place, and export a clean vector PDF that looks exactly like the one you were editing. No watermark, no clipped margins, no mystery blank pages.

It runs entirely in the browser. Use it as a guest and your work stays in local storage, or sign in to keep every resume synced across devices.

## Features

- **Edit on the page, not next to it.** Click any part of the resume — name, contact line, a bullet, a section title — and edit it where it sits. There is no separate form pane, so what you see is what you get.
- **Pixel-accurate A4 export.** Print styles are isolated from the app chrome, so downloading produces a true 210 × 297 mm vector document with selectable text that ATS software can actually read.
- **ATS-first typography.** Tight ATS margins (10 mm top, 13 mm sides, 12 mm bottom), one consistent Inter type scale, and 0.5 px hairline section rules keep the document's structure machine-readable.
- **Any section you need.** Start with Summary, Work Experience, Education, Projects, and Skills, then add Certifications, Languages, Publications, Awards, Volunteering, References, or a fully custom section.
- **Show promotions in one place.** Group several roles under a single company to show career progression without repeating the employer on every line.
- **Rich text where it matters.** Bold, italic, underline, links, and bulleted or numbered lists for job descriptions.
- **A date picker that actually fits.** A compact month-year picker replaces the clunky native date input across every section.
- **Multiple resumes.** Create, duplicate, rename, and delete as many versions as you have job applications.
- **Works on your phone.** The whole editor is responsive down to 320 px: the A4 canvas reflows, hover controls become tappable, and the preview fits the screen.
- **Cloud sync or guest mode.** Sign in to store resumes in Supabase with row-level security, or stay a guest and keep everything on your device.
- **No tracking.** Your documents are your business. Cevee does not report on their contents.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | React 18 + TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS |
| Rich text | Tiptap (StarterKit, Underline, Link) |
| Icons | Lucide React |
| Backend & auth | Supabase (PostgreSQL, Auth, Row Level Security) |
| PDF engine | Native print engine (`window.print()` + CSS `@page`) |
| Deployment | Vercel (SPA rewrites) |

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm (or pnpm / yarn)

### Install and run

```bash
git clone https://github.com/rideragung/cevee.git
cd cevee
npm install
npm run dev
```

The dev server starts at `http://localhost:5173`.

Supabase is optional. Without it, the app runs in guest mode and stores everything in `localStorage`, so you can start building immediately.

### Production build

```bash
npm run build     # type-check, then bundle to dist/
npm run preview   # serve the production build locally
```

## Environment Variables

Copy the example file and fill in your own Supabase project credentials:

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=https://<project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

| Variable | Description |
| --- | --- |
| `VITE_SUPABASE_URL` | Your Supabase project URL. |
| `VITE_SUPABASE_ANON_KEY` | The public anon key for that project. Safe to expose; access is enforced by RLS. |

Leave both blank to run in guest mode.

## Database Setup

If you want cloud sync, create the `resumes` table in your Supabase project's SQL Editor:

```sql
create table if not exists public.resumes (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  title text not null default 'Untitled Resume',
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists resumes_user_id_idx on public.resumes (user_id);
create index if not exists resumes_updated_at_idx on public.resumes (updated_at desc);

alter table public.resumes enable row level security;

create policy "Users can view their own resumes"
  on public.resumes for select using (auth.uid() = user_id);

create policy "Users can insert their own resumes"
  on public.resumes for insert with check (auth.uid() = user_id);

create policy "Users can update their own resumes"
  on public.resumes for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can delete their own resumes"
  on public.resumes for delete using (auth.uid() = user_id);
```

Each row stores a full resume document as JSONB, so the schema stays stable even as new section types are added.

## Project Structure

```text
src/
├── components/
│   ├── sections/               # Summary, Skills, Experience, Projects, Education, Custom
│   ├── AddSectionBar.tsx       # Add preset or custom sections
│   ├── AuthPage.tsx            # Sign-in screen (email & Google)
│   ├── ConfirmDialog.tsx       # Confirm destructive actions
│   ├── DatePicker.tsx          # Reusable month-year picker
│   ├── Navbar.tsx              # Top bar, resume switcher, sync status, export
│   ├── PaginatedResumeView.tsx # A4 pagination engine + print renderer
│   ├── PreviewModal.tsx        # 1:1 PDF preview modal
│   ├── ResumeDashboard.tsx     # Multi-resume dashboard
│   ├── ResumeHeader.tsx        # Contact & profile header editor
│   ├── RichTextEditor.tsx      # Tiptap wrapper
│   └── SectionHeader.tsx       # Section title + reorder/delete controls
├── data/
│   └── initialData.ts          # Starter resume template
├── lib/
│   ├── resumeService.ts        # Supabase read/write helpers
│   └── supabase.ts             # Supabase client initialization
├── types/
│   └── resume.ts               # Document type definitions
├── utils/
│   └── imageCompressor.ts      # Client-side profile photo compression
├── App.tsx                     # Root application controller
├── index.css                   # A4 dimensions & print styles
└── main.tsx                    # Entry point
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server with hot reload. |
| `npm run build` | Type-check with `tsc`, then build to `dist/`. |
| `npm run preview` | Serve the production build locally. |

## Deployment

1. Import the `rideragung/cevee` repository into Vercel.
2. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` under **Environment Variables**.
3. Deploy. The included `vercel.json` handles SPA routing.
4. In Supabase, open **Authentication → URL Configuration** and add your production domain to the **Redirect URLs** list.

## Contributing

Issues and pull requests are welcome. If you are proposing a larger change, open an issue first so we can agree on the approach before you write code. When submitting a PR, keep the existing code style and make sure `npm run build` passes.

## License

Released under the [MIT License](LICENSE).
