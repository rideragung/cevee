# Cevee

**Build, edit, and export ATS-friendly resumes right in the browser.**

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)

Cevee is a browser-based resume builder that renders a real A4 page while you edit. Type directly on the sheet, reorder sections in place, and export a vector PDF whose text applicant tracking systems can parse. Guest mode keeps documents in the browser; signing in keeps them in sync through Supabase.

## Features

### Editing

- **Edit on the page.** Change the name, contact line, bullets, or section titles in place, without a separate form pane.
- **Rich text where it counts.** Bold, italic, underline, links, and bulleted or numbered lists inside job descriptions.
- **Month-year date picker.** A compact picker replaces the native date input in every section.
- **Chronological ordering.** Entries sort from most recent to oldest across all sections, and current roles stay on top.
- **Grouped promotions.** Keep several roles under one company to show career progression without repeating the employer on every line.

### Templates and export

- **Three switchable templates.** They share a single content model, so switching never moves or drops content.
- **True A4 export.** Print styles are isolated from the editor, so the PDF contains the resume only: a 210 × 297 mm vector document with selectable text.
- **Calibrated previews.** Sidebar and modal miniatures render the actual template at A4 scale with its real typography.
- **Real-content dashboard thumbnails.** Dashboard cards render page 1 of the actual resume with each template's real typography and pagination engine, so multi-page resumes are never squashed or clipped into a single preview.
- **Justified body copy.** Summary and achievement bullets align flush on both edges in every template, on the canvas, in the preview, and in the printed PDF.
- **Self-hosted fonts.** Inter and Arimo ship with the app through `@fontsource`, so font assets load from the bundle and exported PDFs embed static subsets instead of depending on a CDN.

### Content

- **Sections for every case.** Summary, Work Experience, Education, Projects, and Skills are built in; add Certifications, Languages, Publications, Awards, Volunteering, References, or a custom section.
- **Multiple resumes.** Create, duplicate, rename, and delete as many versions as you have applications, with quick preview available from the card menu or the list view.
- **Mobile editing.** The editor reflows down to 320 px: the A4 canvas scrolls, controls become tappable, and the preview fits the screen.

### Data and privacy

- **Cloud sync or guest mode.** Sign in to store resumes in Supabase with row-level security, or stay a guest with data in `localStorage`.
- **No content tracking.** Cevee does not read or report on resume contents.

## Layout Templates

Templates are plugins. Each one lives in its own folder under `src/layouts/` and exports a `LayoutPlugin`: page geometry, line metrics, header renderer, content blocks, and preview thumbnail. The registry in `src/layouts/registry.ts` assembles them for the editor and maps retired layout identifiers to their current equivalents, so resumes saved by earlier releases open unchanged.

Folder and file names are free to choose. The example below shows how a template named `Layout Name` is built:

```text
src/layouts/
├── core/                          # Framework shared by every template
│   ├── types.ts                   # LayoutPlugin, ContentBlock, and LayoutGeometry types
│   ├── packing.ts                 # Paginates measured blocks across A4 pages
│   └── content.tsx                # Parses and renders rich text content parts
├── shared/                        # Building blocks reused across templates
│   ├── single-column-blocks.tsx   # Section block builder for single-column formats
│   └── MiniPreview.tsx            # Scaled A4 preview used in cards and modals
├── layout-name/                   # One template plugin
│   ├── index.tsx                  # Exports the LayoutPlugin definition
│   ├── metrics.ts                 # Page height caps and estimated line heights
│   ├── blocks.tsx                 # Header and section renderers for the template
│   ├── Thumbnail.tsx              # Preview image shown on the template card
│   └── layout-name.css            # Template-scoped page and print styles
└── registry.ts                    # Template registry, default template, legacy ID normalization
```

Templates keep only the files they need, and anything reusable belongs in `core/` or `shared/`. Register the plugin in `registry.ts` to make it selectable.

Switching templates from the creation dialog or the editor sidebar preserves all content.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | React 18 + TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS |
| Typography | Inter and Arimo via `@fontsource` (self-hosted static fonts) |
| Rich text | Tiptap (StarterKit, Underline, Link) |
| Sanitization | DOMPurify (XSS prevention) |
| Icons | Tabler Icons (`@tabler/icons-react`) |
| Backend and auth | Supabase (PostgreSQL, Auth, Row Level Security) |
| PDF engine | Native print engine (`window.print()` + CSS `@page`) |
| Code quality | ESLint 10 (Flat config) + Prettier |
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

Supabase is optional. Without it, the app runs in guest mode and stores documents in `localStorage`, so you can start building immediately.

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

# Gemini API Keys (Server-side proxy, kept private from browser bundle)
GEMINI_API_KEYS=key1,key2
GEMINI_MODEL=gemini-3.5-flash-lite
```

| Variable | Description | Scope |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Your Supabase project URL. | Client |
| `VITE_SUPABASE_ANON_KEY` | Public anon key for Supabase project. Safe to expose; access is enforced by RLS. | Client |
| `GEMINI_API_KEYS` | Google Gemini API key(s) for AI resume parsing. Kept private on serverless function; never bundled to client. | Server (Vercel / Dev) |
| `GEMINI_MODEL` | Optional model override (default: `gemini-3.5-flash-lite`). | Server (Vercel / Dev) |

Leave Supabase blank to run in guest mode. Leave Gemini blank if you do not use PDF import.

## Database Setup

If you want cloud sync, create the `resumes` table in your Supabase project's SQL Editor:

```sql
create table if not exists public.resumes (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  title text not null default 'Untitled Resume',
  layout_id text not null default 'standard-ats-v1',
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

Each row stores a full resume document as JSONB, so the schema stays stable as new section types are added.

## Project Structure

```text
src/
├── components/
│   ├── sections/                # Section editors (Summary, Skills, Experience, Projects, Education, Custom)
│   ├── AddSectionBar.tsx        # Preset and custom section picker
│   ├── AuthPage.tsx             # Sign-in screen (email and Google)
│   ├── ConfirmDialog.tsx        # Confirmation for destructive actions
│   ├── DatePicker.tsx           # Month-year picker
│   ├── LayoutSelectModal.tsx    # Template picker shown before a resume is created
│   ├── LayoutSidebar.tsx        # Docked template switcher in the editor
│   ├── LayoutThumbnail.tsx      # Template card with active indicator
│   ├── Navbar.tsx               # Resume switcher, sync status, export
│   ├── PaginatedResumeView.tsx  # Pagination and print rendering for the active template
│   ├── PreviewModal.tsx         # Full preview of the printed output
│   ├── ResumeContentThumbnail.tsx # Page-1 real-content thumbnail for dashboard cards
│   ├── ResumeDashboard.tsx      # Multi-resume dashboard
│   ├── ResumeHeader.tsx         # Contact and profile header editor
│   ├── ResumeMiniPreview.tsx    # Scaled A4 preview in the editor
│   ├── RichTextEditor.tsx       # Tiptap wrapper
│   └── SectionHeader.tsx        # Section title with reorder and delete controls
├── data/
│   ├── initialData.ts           # Starter resume
│   └── layouts.ts               # Template catalog for the UI, built from the registry
├── layouts/                     # Template plugins and shared layout code
│   ├── core/                    # Layout contract, page packing, and content renderer
│   ├── shared/                  # Single-column blocks and mini previews shared by templates
│   └── registry.ts              # Template registry, default template, legacy ID normalization
├── lib/
│   ├── resumeService.ts         # Supabase read and write helpers
│   └── supabase.ts              # Supabase client initialization
├── types/
│   └── resume.ts                # Document and layout types
├── utils/
│   ├── imageCompressor.ts       # 3:4 profile photo compression
│   ├── periodSort.ts            # Chronological sorting
│   ├── relativeTime.ts          # Relative time labels ("2 hours ago")
│   ├── sanitize.ts              # HTML sanitization with DOMPurify
│   └── whatsApp.ts              # Phone normalization and WhatsApp links
├── App.tsx                      # Root controller and template dispatcher
├── index.css                    # Global styles and A4 print rules
└── main.tsx                     # Entry point and font imports
```

## Documentation

- `SRS.md`: software requirements, layout catalog, and version history.
- `PDF_FORMATTING_SPEC.md`: page geometry and print output specification.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server with hot reload. |
| `npm run build` | Type-check with `tsc`, then build to `dist/`. |
| `npm run preview` | Serve the production build locally. |
| `npm run lint` | Run ESLint across all TypeScript source files. |
| `npm run lint:fix` | Automatically fix fixable ESLint warnings/errors. |
| `npm run format` | Format code using Prettier. |
| `npm run format:check` | Check code formatting compliance with Prettier. |

## Deployment

1. Import the `rideragung/cevee` repository into Vercel.
2. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` under **Environment Variables**.
3. Add `GEMINI_API_KEYS` (without `VITE_` prefix) under **Environment Variables** so the key stays private.
4. Deploy. The included `vercel.json` handles SPA routing and serverless `/api/parse-resume`.
5. In Supabase, open **Authentication → URL Configuration** and add your production domain to the **Redirect URLs** list.

## Contributing

Issues and pull requests are welcome. For larger changes, open an issue first so the approach can be agreed on before you write code. Keep the existing code style, and make sure `npm run build` and `npm run lint` pass before submitting.

## License

Released under the [MIT License](LICENSE).
