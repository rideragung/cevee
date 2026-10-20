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
  secondary text `#5B6573`, border `#E5E7EB`. Light accent wash `#EEF2FF` for selected
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
  preview, more-actions, account menu `size-11`).
- Hover styles on feedback-aggressive states are gated `[@media(hover:hover)]:hover:...`
  so touch devices don't stick-and-hold them.
- Pillow shadows always use the arbitrary-property form `[box-shadow:var(--shadow-pillow-*)]`,
  never `shadow-[var(...)]`: Tailwind v3 parses the latter as a `--tw-shadow-color` override,
  which yields `box-shadow: none` (found in the Phase 5 rendered audit, 2026-10-20). The
  config-based `shadow-pillow-*` utilities in `tailwind.config.js` are the safe alternative
  for feature code.
- `src/components/ui/dropdown-menu.tsx` carries three upstream fixes verified in QA:
  context-menu-sized open state, a pointer guard against erroneous outside-click close on
  right-click, and a `closed-portal` CSS rule so a closed dropdown cannot paint a stray
  layer over an open dialog.

## Review status (2026-10-19)

`npm run build` and `lint` pass. Better Design review gates pass:
`check-comprehension` on the dashboard home, and `inspect-spacing` at 1440, 1728 and 390
with all layout roles matching the Pillow comfortable density. The only remaining spacing
finding is the intentionally kept dashboard title tap target (label is 145x20; the visible
pseudo overlay is not measured by the engine). Known accepted sizes: `h-9` text buttons
(36px, DS default, WCAG AA min 24px met), the 32px grid/list view toggle pair (adjacent
controls), and the A4 preview's mm-based print padding.

If a restyle is ever wanted, catalog candidates: Marigold (recruiting, warm orange),
Interior (tactile, square, crafted), Column (corporate fintech, trustworthy blue),
Atelier (editorial calm), Precision (dense CRM, indigo). Cevee keeps its own design; none
is installed unless you pick one.
