# Fase 3 — Admin styling + remaining public pages + merge

**Scope:**
- Admin shell (sidebar, header, layout)
- Admin dashboard, orders, products, clients, reports, POS pages
- Remaining public pages we haven't audited: carrito, checkout, producto, mi-cuenta, registro, seguimiento
- Code review of the entire branch (includes the other chat's reports + POS personalizado feature)
- Merge to develop

**Branch:** `frontend/typography-refresh` (current)

**Rules everywhere (consistent with public site):**
- Inline `fontSize: 9 | 10 | 11` → 12 minimum
- Inline `fontSize: 12 | 13` for body/labels → 13/14
- `letterSpacing: 0.18em+` on small uppercase → 0.14em
- Add `fontWeight: 500/600` to body/labels that lack it
- Replace `var(--font-italiana)` with `var(--font-cormorant)` italic 600 OR `var(--font-manrope)` 600
  depending on context (Cormorant for decorative h1/h2, Manrope for utilitarian labels/buttons/status)
- Admin is light/cream theme — DO NOT touch its color palette, only typography sizes/weights
- Low contrast colors (rgba alpha < 0.6) → bump to ≥0.7

---

## Phase A — Admin shell + dashboard

### Task A.1 — Admin sidebar + header
Files:
- `src/components/admin/admin-sidebar.tsx`
- `src/components/admin/admin-header.tsx`

Steps:
1. Replace any `fontFamily: "var(--font-italiana)..."` with `var(--font-manrope)` (admin is utilitarian, not boutique).
2. Bump all `fontSize: 10` → 12, `11` → 13, `12` (utility labels) → 13 if it's body text.
3. Reduce `letterSpacing: 0.18em+` → 0.14em on small uppercase.
4. Brand "Deco·Imperio ADMIN" in sidebar: keep Italiana but reduce visual hierarchy weight if needed.
5. Active link state: ensure ≥600 weight when active.

Verify: `npm run lint`. Commit: `style(admin): legible sidebar + header typography`

### Task A.2 — Admin dashboard
Files:
- `src/components/admin/admin-dashboard-client.tsx`

Steps:
1. KPI labels and values: bump font sizes for legibility.
2. "Pedidos recientes" / "Más vendidos" lists: row titles 12 → 13 weight 600, sub-labels 10/11 → 12.
3. Replace any Italiana for KPI numbers with Manrope 600 (these are data, not decorative).
4. Empty states "No hay pedidos aún" 13 → 14, weight 500.

Commit: `style(admin): dashboard typography`

---

## Phase B — Admin tables (orders, products, clients)

### Task B.1 — Admin orders list
Files:
- `src/components/admin/admin-orders-client.tsx`

Steps:
1. Table headers (Pedido, Cliente, Estado, Entrega, Total, Acción): bump to 12px weight 700 letterSpacing 0.08em.
2. Row text: bump all `fontSize: 11/12` → 13. Weight 500 minimum for primary text, 400 for muted.
3. Action buttons "ACEPTAR" / "DESPACHAR": padding more generous, font 12 weight 600.
4. Filter tab buttons (Todos, Recibidos, etc.): bump 11 → 13 weight 600.

Commit: `style(admin): orders list legibility`

### Task B.2 — Admin products + clients lists
Files:
- `src/app/admin/productos/page.tsx` and its inline table styles (or component if applicable)
- `src/components/admin/clients-client.tsx`

Steps: Same pattern as B.1. Bump small font sizes, increase weight on primary text.

Commit: `style(admin): products and clients lists`

### Task B.3 — Product form
Files:
- `src/components/admin/product-form.tsx`

Steps: Field labels, input text, helper text bumped to 13-14px weight 500. Section headings using Italiana → Manrope 600 18px.

Commit: `style(admin): product form labels and inputs`

---

## Phase C — Admin POS + Reports (these are the other chat's recent work)

### Task C.1 — POS client
Files:
- `src/components/admin/pos-client.tsx`

Steps:
1. Audit all inline `fontSize:` for 9-11 and bump.
2. The new "Personalizado" tab and its form: same typography rules.
3. Customer name + total summary on the right: ensure values are 14+ weight 600.

Commit: `style(admin): POS legibility (catalog + personalizado)`

### Task C.2 — Reports section
Files:
- `src/components/admin/reports-client.tsx`
- `src/components/admin/download-reports-section.tsx`

Steps: Audit + bump font sizes, increase contrast on download button text.

Commit: `style(admin): reports section typography`

### Task C.3 — Order detail
Files:
- `src/components/admin/order-detail-client.tsx`

Steps: Same pass. Make sure the tracking link (recently added) is prominent.

Commit: `style(admin): order detail typography`

---

## Phase D — Remaining public pages

### Task D.1 — Carrito (cart drawer + cart page)
Files:
- `src/components/cart/cart-drawer.tsx`
- `src/components/cart/cart-page-client.tsx`

Steps: Audit for inline tiny text, decorative Italiana on headers (use Cormorant italic 600 instead). Buttons "PROCEDER AL PAGO" etc. consistent with `.btn-luxury`.

Commit: `style(cart): typography pass`

### Task D.2 — Checkout
Files:
- `src/components/checkout/checkout-client.tsx`
- `src/app/(public)/checkout/page.tsx`

Steps: Form labels, step indicators, totals.

Commit: `style(checkout): typography pass`

### Task D.3 — Product detail
Files:
- `src/components/shop/product-detail-client.tsx`
- `src/app/(public)/producto/[slug]/page.tsx`

Steps: Product name, price, description, size selector, CTA.

Commit: `style(producto): typography pass`

### Task D.4 — Mi cuenta + registro + seguimiento
Files:
- `src/components/account/account-client.tsx`
- `src/app/(public)/mi-cuenta/page.tsx`
- `src/app/(public)/registro/page.tsx`
- `src/components/tracking/tracking-client.tsx`
- `src/app/(public)/seguimiento/[orderNumber]/page.tsx`

Steps: Same pattern.

Commit: `style(public): mi cuenta, registro, seguimiento typography`

---

## Phase E — Verification

### Task E.1 — Lint + type-check + build
Steps:
1. `npm run lint` — no new errors vs baseline (currently 17 errors, 13 warnings — mostly pre-existing from tests).
2. `npx tsc --noEmit` — no regressions.
3. `npm run build` — must complete.

### Task E.2 — Screenshots
Steps: Capture mobile (390×844) + desktop (1440×900) for:
- Home (`/`), tienda (`/tienda`), producto, carrito, checkout, contacto, nosotros, login, registro, mi-cuenta
- Admin: dashboard, pedidos, productos, POS, reportes, clientes
Save to `docs/plans/screenshots-fase3/`

---

## Phase F — Code review

### Task F.1 — Review entire diff vs `develop`
Use the `code-review:code-review` skill or `superpowers:requesting-code-review`. Cover:
- Public typography refresh
- Reports feature (PDF/Excel/data aggregator/API endpoints)
- POS Personalizado feature (DB schema change, API change, UI)
- Admin styling changes

Acceptance: No critical or high-severity issues. If any found, fix in follow-up commit.

---

## Phase G — Merge

### Task G.1 — Merge to develop
Steps:
1. `git checkout develop`
2. `git merge --no-ff frontend/typography-refresh -m "merge: typography refresh + reports + POS personalizado"`
3. Do NOT push to remote (user decides when).
