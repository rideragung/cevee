# DESIGN.md — Cevee

Design direction derived from the installed Pillow Light design system and the product's
existing A4/ATS renderer. Source of truth: `src/index.css`, `tailwind.config.js`,
`src/components/ui/*`, and the feature components.

## What it is

Cevee is an ATS resume builder. The user writes a resume in a structured editor, the
canvas renders an exact A4 sheet, and export is a print/PDF of that same sheet. Storage
is Supabase (cloud) or localStorage (local).

## Identity

The product's artifact is a document. The interface stays quiet so the A4 sheet is the
loudest thing on screen.

- Brand mark: a document glyph in cobalt next to the "Cevee" wordmark (`FileText`).
- Favicon: the same document glyph, cobalt `#1E66FF`, in `index.html`.
- The brand is light-only. There is no dark theme; the only dark surface is the
  full-screen PDF preview chrome, which is intentionally inverted so the white page reads
  as the subject.

## Personality

Calm, plain-spoken, tool-like. It behaves like a workshop, not a pitch.

## Palette

- **Primary accent:** cobalt `#1E66FF`, foreground white. Used only for the primary
  action, active/selected state, and live/sync status. Not for decorative icons, metadata,
  or every button.
- **Neutral core:** background `#FFFFFF`, page wash `#F4F5F7`, foreground `#0F172A`,
  secondary text `#5B6573`, border `#E5E7EB`, input border `#E5E7EB`. Light accent wash `#EEF2FF` for selected
  surfaces.
- **Semantic (state only, never decoration):** destructive `#E11D48`; amber for warning
  and cloud-sync failure. Success states use a green that is distinct from the cobalt
  primary.
- No gradients, radial orbs, colored glows, or decorative background textures.
- Use semantic tokens (`bg-background`, `bg-muted`, `bg-card`, `border-border`,
  `text-muted-foreground`, `bg-primary`, `text-primary-foreground`, `bg-accent`) in
  product chrome. Hardcoded palette values are reserved for the A4 document, the dark
  preview chrome, and semantic alert colors.

## Typography

- **Inter** (Google Fonts, 400/500/600/700), also used by the printed canvas. Neutral and
  legible at the small control sizes this UI uses.
- Scale: controls 12px (`text-xs`), body 14px (`text-sm`), page titles 24-30px,
  section anchors 18-20px. Bold is reserved for the page title, section anchors, and active
  values.
- Labels and buttons are sentence case. No uppercase micro-labels and no added
  `tracking-wider`; only the A4 resume headings keep their own typographic treatment.
- Numbers in metric or status positions use `tabular-nums`.

## Shape and depth

- Design-system radius: `--radius: 0.875rem` (14px). Buttons and inputs share it; cards
  use `rounded-2xl`; badges are pills. Do not mix `rounded-md` chrome with pill buttons.
- Nested surfaces follow inner radius = outer radius - gap.
- Shadow is an elevation marker, not a default: the Pillow primary/secondary inset shadows
  on buttons, `shadow-sm` on interactive chrome, `shadow-lg` on floating layers. Flat
  surfaces stay flat.
- The editor A4 sheet keeps its document corner treatment and print shadow removal.

## Motion

- Feedback only: 150ms `ease-out`, named properties (never `transition-all`).
- Press feedback `enabled:active:scale-[0.96]` and hover scale are gated with
  `motion-safe:`.
- No endless decorative loops. Spinners are functional loading indicators.
- The installed `src/lib/motion.ts` tokens are the shared source for springs and
  transitions.

## Iconography

- `lucide-react` for feature code; `src/components/icons/` (tabler) exists for
  design-system internals. Functional glyphs only (Plus, Copy, Trash2, Pencil, Eye,
  Download, Cloud, Loader2, FileText). No sparkle, star, magic, lightning, diamond,
  robot, or orb.
- Icons name a real action or state; they are never decoration. Icon-only buttons require
  an accessible name plus a hit-area guard (see Conventions).

## Dial

> Dial: ENERGY 1 / RHYTHM 1 / MOTION 1

Reason: a document tool for focused editing. Calm surface, uniform rhythm, motion for
feedback only.

## Rules for this product

- The A4 sheet is the focal point on any editing screen. Editor chrome may use the design
  system; the A4 renderer does not.
- `src/layouts/*`, `src/components/sections/*` print markup, `PaginatedResumeView`, and the
  7.75pt A4 typography are a print contract. Do not apply Pillow surfaces, radii, or colors
  to them. Editor-only controls inside the canvas stay `no-print`.
- One primary action per screen. The dashboard's primary is "Create resume"; the editor's
  primary is "Download PDF".
- Accent color is not a status system. Pair every status color with text or an icon.
- No badge that only restates the product name, the page title, or the headline.
- Every visible text fragment has one job: context, outcome, next action, real doubt, or
  legal/security. Delete filler and provenance copy.
- Every icon and interactive element names a real action or state. Every input has a
  visible or programmatic label.
- A4 output must stay identical: verify print pagination after any chrome change.

## Conventions (set during the Phase 4 audit)

- The installed Pillow kit is the **radix flavor**, pinned to the official registry
  (`better-design.com/registry/pillow-light/{name}.json`). Only the 11 components actually
  imported live in `src/components/ui/`; the rest are not vendored.
- Touch/hit areas never rely on measure-blind pseudo sizing: any icon-only control under
  44px gets an `after:absolute after:-inset-{n} after:content-['']` overlay (title button,
  preview, more-actions, account menu `size-11`). Guard depth is 8px (`-inset-2`); click
  probes outside that band only verify via a real dispatched click, not by guard math.
- Text inputs are never given pseudo guards: an `after:` overlay on an input breaks
  caret interaction, so inputs get real height instead — the toolbar search is `h-11`.
- Adjacent control pairs (e.g. grid/list view toggle) use a vertical-only guard
  `after:absolute after:-inset-y-2 after:-inset-x-0.5 after:content-['']` so one
  control's hit area does not overlap the neighbor's, horizontal gaps stay usable, and
  the vertical seam is forgiving.
- Hover styles on feedback-aggressive states are gated `[@media(hover:hover)]:hover:...`
  so touch devices don't stick-and-hold them.
- The page's primary action (dashboard "Create resume") lives in the **title row**, right
  of the page heading — the sticky top bar carries only the logo and the account menu.
  The title-row CTA can scroll beneath the top bar; that is safe because of the closed
  popper-wrapper rule below (2026-10-20: the CTA was briefly moved into the top bar to
  dodge a click bug that turned out to be the closed dropdown portal, not the position).
- Pillow shadows always use the arbitrary-property form `[box-shadow:var(--shadow-pillow-*)]`,
  never `shadow-[var(...)]`: Tailwind v3 parses the latter as a `--tw-shadow-color` override,
  which yields `box-shadow: none` (found in the Phase 5 rendered audit, 2026-10-20). The
  config-based `shadow-pillow-*` utilities in `tailwind.config.js` are the safe alternative
  for feature code.
- `src/components/ui/dropdown-menu.tsx` carries three upstream fixes verified in QA:
  context-menu-sized open state, a pointer guard against erroneous outside-click close on
  right-click, and a `closed-portal` CSS rule so a closed dropdown cannot paint a stray
  layer over an open dialog.
- The kit mounts dropdown portals with `forceMount`, so a closed menu's
  `data-radix-popper-content-wrapper` stays parked at its trigger (e.g. the w-56 account
  menu box under the avatar) with `visibility: hidden` content. The wrapper's own box
  still hit-tests and swallows real clicks that land over whatever sits beneath it —
  this was the actual root cause of the "Create resume CTA doesn't register clicks"
  report (2026-10-20). The fix in `src/index.css` folds the closed state up to the
  wrapper: `[data-radix-popper-content-wrapper]:has([data-radix-menu-content]
  [data-state="closed"]) { pointer-events: none; }`. Open menus stay interactive
  because Content re-declares `pointer-events: auto` over the wrapper's inherited
  `none`. Verified with real clicks: title-row CTA at scroll 0/40/200, account and sort
  menus opening, sort item selection, and click-through on the parked closed wrapper.

## Profile & Account Dropdown (2026-10-21)

- Modifikasi modal popup dropdown avatar profil mengadopsi token **Pillow Light**:
  - Container: `rounded-[1.75rem]` dengan padding `p-5`, border `border-border/80`, background `bg-card`, dan shadow elevated 3D (`shadow-[0_12px_40px_-8px_rgba(15,23,42,0.12),0_4px_16px_-2px_rgba(15,23,42,0.06)]`).
  - Header profil: `Avatar` ukuran `size-14` dengan border ring, nama pengguna (`font-bold text-foreground text-base`), pill status badge (`Beta Tester` dengan ikon `User` dalam container `bg-[#F3E8FF] text-[#7E22CE] rounded-full`), dan email pengguna (`text-xs text-muted-foreground`).
  - Baris bahasa: Label "Language", bendera UK (`UKFlag` SVG circle) dalam pill container aktif (`bg-secondary/80 border-border shadow-2xs`), serta bendera Indonesia (`IndonesiaFlag` SVG circle) dalam status disabled/coming soon (`opacity-35 cursor-not-allowed`).
  - Aksi keluar: `DropdownMenuItem` dengan ikon `LogOut` dalam rounded box merah (`size-10 rounded-2xl bg-destructive/10 text-destructive`) dan label "Exit guest mode" / "Log out".
  - Standarisasi copy: Seluruh teks menggunakan bahasa Inggris konsisten (`Guest`, `User`, `Language`, `Exit guest mode`, `Log out`).

- Navbar Floating Rounded Pill: Header dashboard diubah menjadi bilah navigasi floating kapsul (`rounded-full`) dengan efek kaca `bg-background/90 backdrop-blur-md`, border `border-border/80`, dan shadow elevasi halus (`shadow-[0_4px_24px_-4px_rgba(15,23,42,0.08)]`). Kontainer terangkat di atas halaman (`sticky top-0 pt-3 sm:pt-4 px-3 sm:px-6`).
- Account Trigger Pill: Tombol pembuka profil pada navbar mengadopsi format pill horizontal (`rounded-full h-11 px-1 sm:pr-3`) yang menampilkan foto avatar, nama dan email pengguna secara vertikal (pada breakpoint `sm:` ke atas), serta ikon chevron down panah penunjuk dropdown.

## Resume Import UX & Copy Writing (2026-10-22)

- Standarisasi UX Writing pada modal import resume (`LayoutSelectModal` & `geminiParser`):
  - Mengabstraksi nama vendor teknis (tidak menampilkan "Gemini", nomor model, atau status code mentah ke antarmuka pengguna).
  - Teks progres dibuat alami dan bertahap:
    - Langkah 1: `1/3: Reading PDF document...` (indikator pill: `1. Read file`)
    - Langkah 2: `2/3: Structuring your experience and skills...` (indikator pill: `2. Structure content`)
    - Langkah 3: `3/3: Applying resume template...` (indikator pill: `3. Format layout`)
  - Penanganan error mengadopsi prinsip *better-writing*:
    - Nada tenang (*calm*), tanpa tanda seru (*no exclamation marks*), tanpa menyalahkan pengguna (*no blame*).
    - Judul banner error: `Unable to import resume`.
    - Pesan error dipetakan ke instruksi solusi nyata:
      - Quota/traffic tinggi: *"The resume analyzer is receiving high traffic right now. Wait a moment and try again, or continue by choosing a blank template."*
      - Timeout/durasi lambat: *"Document analysis took longer than expected. Try uploading a simpler PDF or fill in your details manually."*
      - Layanan sibuk/down: *"The resume analysis service is temporarily busy. Please wait a few moments and try again."*
      - PDF tidak terbaca/gambar hasil scan: *"Could not find readable text in this PDF. Ensure your file has selectable text rather than a scanned image, or enter your details manually."*

## Education Section "Currently Enrolled" Pattern (2026-10-22)

- Menyelaraskan form editor `EducationSection` dengan pola `ExperienceSection`:
  - Kontrol: Checkbox `[ ] I currently study here` (`h-3.5 w-3.5 rounded border-input text-primary focus:ring-primary/30`) dengan label klik (`text-xs text-foreground select-none cursor-pointer`).
  - Penempatan: Berada tepat di antara baris Gelar/GPA dan baris Institusi/Tanggal, memberikan pemisahan visual yang jelas dan konteks langsung sebelum tanggal diisi.
  - Interaktivitas & State:
    - Saat dicentang: Picker tanggal kelulusan/selesai (`End date or graduation`) terkunci (`disabled`), menampilkan label "Present", dan indikator wajib merah (`*`) disembunyikan.
    - Periode terkomputasi otomatis: Format `[Start Date] - Present` atau `Present`.
    - Saat tidak dicentang: Picker tanggal selesai kembali aktif untuk memilih bulan/tahun kelulusan spesifik.
  - Sort reverse-chronological: Utilitas `sortByPeriodDesc` memetakan `current: true` sebagai tanggal teratas (`HUGE` timestamp), memastikan pendidikan yang sedang ditempuh selalu berada di urutan teratas resume secara konsisten.

## Resume Creation Modal: OnboardingStepper & TaskSteps (2026-10-22)

- Redesain modal pembuatan resume (`LayoutSelectModal`) dengan adopsi komponen resmi **Pillow Light**:
  - **`OnboardingStepper` (`ix-onboarding-stepper` / `ix-onboarding-stepper-segments`):**
    - Diposisikan di header modal sebagai indikator progres utama alur 2-step: `1. Choose layout` dan `2. Content source`.
    - Menggunakan progress style `segments` dengan animasi pegas `scaleX` halus, ring highlight pada langkah aktif (`ring-2 ring-primary/30`), serta teks status langkah `Step X of 2` yang bersih (tanpa persentase berlebih di kanan atas).
    - Mengeliminasi bilah progress bar edge-to-edge kaku dan pill buttons yang saling tumpang tindih sebelumnya.
  - **`TaskSteps` (`ix-task-steps`):**
    - Menggantikan progress bar statis pada proses ekstraksi resume AI dari dokumen PDF.
    - Transformasi in-place: saat proses scanning berjalan, dropzone dan file card bertransisi langsung di tempat (*in-place morph*) menjadi kartu progress `TaskSteps`, mempertahankan posisi tombol footer tanpa pergeseran layout mendadak.
    - Memetakan 3 tahapan ekstraksi berurutan: `Extracting PDF document text` -> `Structuring experience and skills with AI` -> `Formatting layout and readying editor`.
    - Visual state interaktif:
      - Tahap aktif: Ikon arc berputar (`Arc spin`) dengan efek teks gradien berkilau (`shimmer gradient text animation`).
      - Tahap selesai: Lencana sukses hijau dengan ikon centang halus (`Tick`).
      - Tahap pending: Dot abu-abu netral terpadu.
      - Tahap gagal: Lencana merah dengan ikon silang (`Cross`) dan pesan error kontekstual.
  - **Zero-Scroll Step 2:**
    - Banner layout terpilih disederhanakan menjadi bilah ringkas 48px (`p-3 bg-muted/40 rounded-xl`) dengan thumbnail mikro A4, nama layout, badge, dan tombol `Change`, menghemat >100px tinggi vertikal.

## Password Strength Component on Registration (2026-10-22)

- Integrasi komponen `PasswordStrength` (`ix-password-strength`) dari katalog **Pillow Light** pada form Sign up (`AuthPage`):
  - Visual Meter: 4 bilah segmen proporsional dengan pewarnaan semantik (`danger` destructive merah, `caution` amber-500, `safe` emerald-500).
  - Indikator Guessability: Mendeteksi pola umum (`password`, `qwerty`, berulang, atau urutan karakter) dan menampilkan lencana peringatan *"Commonly guessed"*.
  - Rule Checklist: Grid 2 kolom responsif berisi 4 kriteria keamanan (minimal 8 karakter, huruf besar & kecil, angka, karakter khusus). Tiap butir dilengkapi ikon centang mikro animasi `scale` dan warna teks transisi dinamis.
  - Aksesibilitas: Pengumuman pembaca layar debounced melalui tag tersembunyi `aria-live="polite"` dan role `meter`.

## Magnetic Drop Zone (2026-10-22)

- Dropzone dokumen PDF pada modal pembuatan resume (`LayoutSelectModal`) mengadopsi komponen `MagneticDropZone` (`src/components/ui/magnetic-drop-zone.tsx`) dengan desain spesifik:
  - Bentuk Kartu: Kontainer persegi lapang (`py-10 px-6 sm:py-12 sm:px-8 rounded-[1.75rem] border-[1.5px] border-dashed border-border/90 bg-card hover:border-primary/50 hover:bg-primary/[0.02]`).
  - Puck Magnetik Sentral: Squircle mengambang (`size-14 sm:size-16 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-xs`) memuat ikon fungsi dokumen Cevee `FileUp` (`size-7 text-primary`).
  - Fisika Pegas: Menggunakan token pegas `stiffness: 350, damping: 25, mass: 0.5` dari `motion/react`. Ikon sentral ditarik secara dinamis mengikuti koordinat kursor pointer saat drag-and-drop (`clamp max 18px`).
  - Tipografi Sesuai Fungsi:
    - Judul tebal: *"Drop your PDF resume here"* (`text-sm sm:text-base font-bold text-foreground tracking-tight mb-1`).
    - Subjudul: *"or choose from your device · PDF up to 15 MB"* (`text-xs sm:text-[13px] text-muted-foreground font-normal`).
  - Efek Hover & Drag: Saat file diarahkan ke area drop, kontainer membesar lembut (`scale 1.012`), border menyala aksen primer (`border-primary bg-primary/[0.04] ring-2 ring-primary/25 ring-offset-2 ring-offset-card`), dan puck beralih ke warna solid brand Cevee (`bg-primary text-primary-foreground shadow-[0_8px_24px_-4px_rgba(30,102,255,0.35)]`).
  - Aksesibilitas: Mendukung navigasi keyboard (`Enter`/`Space`), pembaca layar, dan pematian otomatis efek magnetik pada preferensi `prefers-reduced-motion`.

## Dashboard Empty State: Icon Stack Component (2026-10-23)

- Redesain tampilan kosong dashboard saat belum ada resume (`ResumeEmptyState.tsx` di `ResumeDashboard.tsx`):
  - **Komposisi "Icon Stack":**
    - Desain visual bertumpuk (*layered icon stack*) dengan kedalaman 3 dimensi lembut mengikuti token **Pillow Light**:
      - Kartu belakang kiri: Sudut kemiringan `-12°` (`-rotate-12 -translate-x-8 -translate-y-1`), border `border-border/80`, background `bg-card/90`, memuat ikon `Layers` dan skematik baris dokumen miniatur.
      - Kartu belakang kanan: Sudut kemiringan `+12°` (`rotate-12 translate-x-8 -translate-y-1`), memuat ikon `FileCheck` dan baris konten terpadu.
      - Kartu depan (Centerpiece Hero): Kartu tegak elevasi tinggi (`shadow-md shadow-primary/5 ring-4 ring-primary/5 border-2 border-primary/25 bg-card`), memuat ikon `FileText` ukuran `size-6`, garis resume aksen primer, lencana sparkle amber di sudut kiri atas, serta tombol badge plus di sudut kanan bawah (`ring-2 ring-background`).
      - Efek hover interaktif: Sudut rotasi dan pergeseran kartu bertransisi dinamis (`group-hover:-rotate-16`, `group-hover:rotate-16`, `group-hover:scale-105`) dengan latar belakang glow radial lembut (`bg-primary/10 blur-3xl`).
  - **UX Writing Bersih & Fokus (Anti-Slop):**
    - Judul: `Create your first resume` (Sentence case, mengarahkan tindakan ke depan daripada mengulang ketiadaan data *"No resumes yet"*).
    - Deskripsi: `Choose an ATS-friendly layout, import an existing PDF, or start with a clean template.` (Konkret, tanpa kata pengisi, menjelaskan opsi yang akan didapat).
    - Tombol Aksi Utama: `Create resume` dengan ikon `Plus`, shadow `shadow-pillow-primary`.
    - Eliminasi AI Slop: Seluruh butir teks centang pajangan dihilangkan agar layout tidak redundan dan fokus 100% pada call-to-action utama tanpa artefak dot separator yang berantakan saat wrap.

## Review status (2026-10-20)

`npm run build` and lint pass. Better Design review gates pass:
`check-comprehension` on the dashboard home (segmented view toggle treated as one
grouped action), and `inspect-spacing` at 1440, 1728 and 390 with all layout roles
matching the Pillow comfortable density. Fixed in the 2026-10-20 pass: toolbar search
input raised `h-9` → `h-11` (inputs cannot carry pseudo guards), main content
padding moved onto the spacing token scale (`pt-8 pb-24 sm:py-12`), and the "Create
resume" CTA was returned to the title row once the real click bug was traced to the
force-mounted closed dropdown portal (see Conventions). Accepted findings:
the sort and view-toggle triggers report ~36px visible rects because their pseudo
guards are invisible to the spacing engine — both are verified with real clicks
(portal-based dropdowns must be detected via `[data-radix-popper-content-wrapper]` at
document level, not inside `main`). Also accepted: `h-9` text buttons (DS default,
WCAG AA min 24px met) and the A4 preview's mm-based print padding. Post-revert spot
check screenshots at 1440 and 390 confirm the title-row CTA placement.

If a restyle is ever wanted, catalog candidates: Marigold (recruiting, warm orange),
Interior (tactile, square, crafted), Column (corporate fintech, trustworthy blue),
Atelier (editorial calm), Precision (dense CRM, indigo). Cevee keeps its own design; none
is installed unless you pick one.
