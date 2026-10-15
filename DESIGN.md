# DESIGN.md — Cevee

Design direction, derived from the existing implementation rather than invented.
Source of truth: `tailwind.config.js`, `src/index.css`, `src/components/*`, `index.html`.

## What it is

Cevee is an ATS resume builder. The user writes a resume in a structured editor, the
canvas renders an exact A4 sheet, and export is a print/PDF of that same sheet. Storage
is Supabase (cloud) or localStorage (local).

## Identity

The product's artifact is a document. The interface stays quiet so the A4 sheet is the
loudest thing on screen.

- Brand mark: a document glyph in emerald next to the "Cevee" wordmark (`FileText`).
- Favicon: the same document glyph, emerald `#059669`, in `index.html`.

## Personality

Calm, plain-spoken, tool-like. It behaves like a workshop, not a pitch.

## Palette (2-3 core + 1 accent)

- **Accent (the single deliberate accent):** `emerald-600` `#059669`, hover `emerald-700`.
  Used only for the primary action, the active state, and live/sync status.
- **Neutral core:** the slate scale. Body `slate-100`; surfaces white; field fills
  `slate-50/60`; borders `slate-200`; primary text `slate-900`; secondary `slate-500/600`;
  muted `slate-400`.
- **Semantic (state only, never decoration):** `red-50/600` for destructive and error,
  `amber-50/500` for warning. `blue-600` appears once (duplicate icon) and is not identity.
- No teal. No gradients. No radial orbs. No colored glow backgrounds.

## Typography

- **Inter** (Google Fonts, weights 400/500/600/700). Reason: neutral and highly legible at
  the small control sizes this UI relies on, and the printed canvas sets Inter too.
- Scale: controls 12px (`text-xs`), body 14px (`text-sm`), headings 18-24px, bold for the
  brand and headings, `tracking-tight` on headings.
- Micro-labels: 11px uppercase with `tracking-wider`, used only as list/section labels.

## Shape and depth

- Radius by hierarchy: `rounded-md` (6px) for chrome controls (buttons, dropdowns, chips);
  `rounded-lg`/`rounded-xl` for panels, fields, and cards; `rounded-2xl`/`rounded-3xl` for
  floating cards; `rounded-full` only for status dots.
- Shadow is an elevation marker, not a default: `shadow-xs`/`shadow-sm` on interactive
  chrome, `shadow-lg` on floating layers (dropdown, modal). Solid surfaces stay flat.

## Motion

- Hover and focus transitions only, 150ms `ease-out`, named properties (never
  `transition-all`). Press feedback `enabled:active:scale-[0.96]`, gated with `motion-safe:`.
- No endless loops (pulse, float, marquee). Spinners are functional loading indicators.

## Iconography

- `lucide-react`, functional glyphs only (Plus, Copy, Trash2, Eye, Download, Cloud,
  Loader2, FileText...). No sparkle, star, magic, lightning, diamond, robot, or orb.
  Icons name a real action or state; they are never decoration.

## Dial (R-37)

> Dial: ENERGY 1 / RHYTHM 1 / MOTION 1

Reason: a document tool for focused editing. Calm surface, uniform rhythm, motion for
feedback only. This sits at the Linear/GOV.UK end of the scale.

## Rules for this product

- The A4 sheet is the focal point on any editing screen.
- Emerald is the single accent. If it appears on anything beyond the primary action and the
  active/live state, that is wrong.
- No decorative background texture, gradient, glow, or orb.
- No badge that only restates the product name or the headline.
- Every icon and interactive element names a real action or state.
