# Frontend Typography & Visual Load Refresh — Plan

**Scope:** Public site only (`src/app/(public)/**`, `src/components/{home,layout,ui,shop,account,cart,checkout,tracking}/**`, `src/app/globals.css`, `src/app/layout.tsx`, `tailwind.config.ts`). **Do NOT touch `src/app/admin/**` or `src/components/admin/**`** — that's Fase 3, handled in a separate session.

**Branch:** `frontend/typography-refresh` (already created)

**Goal:** Improve readability (body text, contrast, font weights), reduce visual load (hero size, animations, grain overlay), keep the boutique-luxury feel.

---

## Phase 1 — Tipografía y legibilidad global

### Task 1.1 — Refactor `globals.css` typography tokens

Files:
- Modify: `src/app/globals.css`

Steps:
1. In the `body` rule (`@layer base`), change `font-size: 15px` → `font-size: 16px` and add `font-weight: 450`.
2. In the `h1, h2, h3` rule, keep Italiana but only when there's enough size; add a new rule for `h4, h5, h6` that uses Cormorant Garamond italic weight 600 instead of Italiana:
   ```css
   h4, h5, h6 {
     font-family: var(--font-cormorant), "Cormorant Garamond", Georgia, serif;
     font-style: italic;
     font-weight: 600;
     letter-spacing: 0;
     line-height: 1.25;
   }
   ```
3. Change `--tracking-luxury: 0.32em` → `--tracking-luxury: 0.16em` and `--tracking-ultra: 0.4em` → `--tracking-ultra: 0.22em`.
4. Update `.eyebrow` rule: `font-size: 12px` (was 11), `letter-spacing: 0.18em` (was 0.32em), `font-weight: 600`, and change color to `#cfc4b9` (more contrast vs current `--parchment-dim`).
5. Update `.btn-luxury` rule: `padding: 18px 32px` (was 16px 28px), `font-size: 12px` (was 11), `letter-spacing: 0.16em` (was 0.32em), `font-weight: 600`, `border-width: 1.5px`.
6. Update `.input-elegant`: change `font-family` to `var(--font-manrope)`, `font-size: 16px` (was 20), `font-weight: 500`, `padding: 14px 0`. Update `::placeholder` color from `#8a7f76` to `#a89e94`.
7. Update `.flourish`: `font-size: 12px` (was 11), `letter-spacing: 0.18em` (was 0.32em).
8. Update `.marquee-track-luxury`: `font-size: 20px` (was 22) is fine, keep; but change `letter-spacing: 0.12em` (was 0.18em) to be calmer.
9. Update the `:root` block: add `--color-parchment-muted: #a89e94;` override AND inside `@theme` change `--color-parchment-muted: #8a7f76` → `--color-parchment-muted: #a89e94`.

Verify:
- Run `npm run lint` — must pass.
- Open `http://localhost:3000` in the browser and confirm body text is bigger and bolder.

Commit: `style: globals.css typography tokens (size, weight, tracking, contrast)`

### Task 1.2 — Refactor `layout.tsx` Manrope weight

Files:
- Modify: `src/app/layout.tsx`

Steps:
1. The `Manrope` font import has `weight: ["300", "400", "500", "600", "700"]`. Remove `"300"` since light weight is what caused thin text. Keep `["400", "500", "600", "700"]`.
2. The `Toaster` `toastOptions.style` has `fontSize: "0.8125rem"` (13px) and `letterSpacing: "0.1em"` and `textTransform: "uppercase"`. Change to `fontSize: "0.875rem"` (14px), `letterSpacing: "0.04em"`, remove `textTransform: "uppercase"` (toasts should be readable, not styled).
3. No other changes.

Verify:
- Run `npm run lint`.
- Open `http://localhost:3000` and confirm no font 300 anywhere.

Commit: `style: drop Manrope 300, soften toast typography`

### Task 1.3 — Audit and fix muted-text usage in public components

Files (read first, modify if they use `parchment-muted`, `text-xs`, or hardcoded `#8a7f76`):
- Modify (scan): `src/components/layout/navbar.tsx`, `src/components/layout/footer.tsx`, `src/components/home/*.tsx`, `src/components/ui/product-card.tsx`, `src/components/ui/button.tsx`, `src/components/ui/input.tsx`, `src/components/ui/badge.tsx`, `src/app/(public)/page.tsx`, `src/app/(public)/layout.tsx`

Steps:
1. Grep across the listed files for: `text-parchment-muted`, `text-[#8a7f76]`, `text-xs`, `text-[11px]`, `tracking-luxury`, `tracking-ultra`.
2. For each hit:
   - `text-xs` (12px) used as body text → replace with `text-sm` (14px).
   - `text-[11px]` → `text-[12px]`.
   - `tracking-luxury` used on text < 14px → replace with `tracking-[0.12em]`.
   - `tracking-ultra` → `tracking-[0.18em]`.
   - Body paragraphs using `text-parchment-muted` → change to `text-parchment-dim` (better contrast).
3. Do NOT mass-replace blindly — only where the class is applied to text that's meant to be readable body/label content. Decorative `tracking-luxury` on a single H6 micro-line at 11px is fine to keep IF it's part of an eyebrow-style decorative element.
4. Look for hardcoded font-weight `300` or `font-light` on body paragraphs in components — bump to `font-normal` or `font-medium`.

Verify:
- `npm run lint`
- Visual check at `http://localhost:3000`, `/tienda`, `/nosotros`, `/contacto`, `/login`.

Commit: `style: lift muted text contrast and weights across public components`

---

## Phase 2 — Reducir carga visual del público

### Task 2.1 — Compact hero typography

Files:
- Modify: `src/app/globals.css`

Steps:
1. In `@theme`, change `--text-hero: clamp(72px, 12vw, 176px)` → `--text-hero: clamp(56px, 9vw, 128px)`.
2. Change `--text-hero--letter-spacing: 0.04em` → `--text-hero--letter-spacing: 0.02em`.
3. Add a new spacing reduction: where `.grain-overlay::after` uses `opacity: 0.04` (inside the SVG), change `opacity='0.04'` to `opacity='0.02'`.

Verify: refresh home, hero should not occupy more than 80% of viewport height.

Commit: `style: compact hero size and soften grain overlay`

### Task 2.2 — Reduce scroll-reveal saturation

Files:
- Find with grep: any component in `src/components/home/*.tsx` or `src/app/(public)/page.tsx` that uses `.reveal` class on every section or `data-reveal` attributes.

Steps:
1. Identify all sections that use scroll-reveal animation.
2. Keep reveal on the hero and the first content section only. Remove the `reveal` class from all subsequent sections (best-sellers, occasions, press, testimonials, map, etc.) so they render statically (still fade in on initial load, but not on scroll).
3. If there's a shared `useReveal` hook or IntersectionObserver, leave it alone — just remove the trigger class from the section JSX.

Verify:
- Scroll through home; subsequent sections should appear instantly when scrolled to (no extra fade).
- `npm run lint`.

Commit: `style: limit scroll-reveal to hero and first section`

### Task 2.3 — Tighten vertical rhythm on home and public pages

Files:
- Modify (scan): `src/components/home/*.tsx`, `src/app/(public)/page.tsx`, `src/app/(public)/nosotros/page.tsx`, `src/app/(public)/contacto/page.tsx`, `src/app/(public)/tienda/page.tsx`

Steps:
1. Grep for `py-30`, `py-34`, `py-22` (the largest spacings).
2. Replace `py-34` → `py-22`, `py-30` → `py-20`, `py-22` → `py-16` ONLY in section containers (not the body root).
3. Skip the hero section's `py-*` — that one can stay.

Verify:
- Sections should feel closer; less empty negative space.
- Visual diff at `http://localhost:3000` and `/nosotros`.

Commit: `style: tighten section spacing on public pages`

### Task 2.4 — Polish marquee and floating-petals

Files:
- Modify: `src/components/home/marquee-section.tsx`, `src/components/ui/floating-petals.tsx`

Steps:
1. In `marquee-section.tsx`: if the marquee uses a custom interval, slow it down further (e.g., `--animate-marquee` is 38s — leave that, but if it's instantiated with a custom duration prop, set it to 60s or 70s for a calmer feel). If no custom duration, leave the CSS as-is.
2. In `floating-petals.tsx`: reduce the number of petals rendered by half (if the component renders an array of N petals via `Array.from({ length: N })`, halve N). If it's based on a prop default, halve the default. Also reduce opacity by ~30%.

Verify:
- Home looks less busy.
- `npm run lint`.

Commit: `style: calm marquee speed and reduce floating petals density`

---

## Phase 3 — Verification & cleanup

### Task 3.1 — Full verification pass

Steps:
1. Run `npm run lint` from project root. Must pass.
2. Run `npx tsc --noEmit` (if there's no `type-check` script). Must pass.
3. Run `npm run build` — must complete without errors.
4. Open Playwright, navigate to `http://localhost:3000`, `/tienda`, `/nosotros`, `/contacto`, `/login` and take full-page screenshots into `docs/plans/screenshots-after/`.
5. Compare against the pre-existing screenshots `01-home-top.png` through `07-login.png` at repo root.

Verify:
- All gates pass.
- Screenshots saved.

Commit: `chore: post-refresh verification screenshots`

---

## Out of scope (explicit)

- Admin styling (Fase 3 — separate session after admin features land).
- Color palette changes (we keep noir + parchment).
- Component restructure or rewrites.
- New components, new pages, layout changes.
- Anything inside `src/app/admin/**` or `src/components/admin/**`.
