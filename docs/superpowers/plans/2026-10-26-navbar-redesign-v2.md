# Navbar Redesign v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add auto-collapse, keep group, named panel toggle, submenus, and megamenus to `ln-navbar` using a custom-property-based padding correction that makes `__panel` render identically inside or outside `__inner`.

**Architecture:** `__inner` declares its inline padding as `--_px`. `__panel` uses `margin-inline: calc(-1 * var(--_px, 0px))` to cancel it when nested. In `--collapse` mode, JS adds the `__panel` class to `__nav` on mobile — all panel styling is reused, never duplicated. The dropdown module gets a non-popover click handler for submenus. Named panel toggles and megamenus use `data-ln-navbar-panel` at any viewport.

**Tech Stack:** Sass (SCSS), vanilla JS (ES modules), BEM naming

**Spec:** `docs/superpowers/specs/2026-10-26-navbar-redesign-v2.md`

## Global Constraints

- Existing navbars without `--collapse` must keep working unchanged
- `data-ln-navbar-toggle` continues to work as today for the global mobile toggle
- `__panel` is the single source of mobile nav styling — collapse reuses it via JS class, never duplicates it
- `--_px` custom property replaces `px-*` utilities on `__inner` for inline padding
- Navbar submenus must not use the `popover` attribute
- Mutual exclusion applies among named panels/megamenus only, not the collapse `__nav`

## Review Focus

1. **Existing explicit-panel navbar unchanged** — a navbar with `__panel:not([id])` and no `--collapse` must compile and behave identically. Verify compiled CSS diff is additive only (Task 1, Step 1 baseline).
2. **Collapse + named panel coexistence** — a `--collapse` navbar with a `__megamenu[id]` must activate collapse (JS adds panel class to `__nav`) AND allow the megamenu toggle to work. The detection uses `__panel:not([id])`. Verify in Task 3, Step 5.
3. **Panel padding correction** — `__panel` inside `__inner` with `--_px: 1rem` must have `margin-inline: -1rem`. Outside inner, `margin-inline: 0`. Verify compiled CSS in Task 1, Step 3.
4. **Resize desktop→mobile→desktop** — collapse class added on mobile, removed on desktop. `__nav` must return to horizontal flex with no panel class and no `aria-hidden`. Verify in Task 3, Step 5.
5. **Outside click on megamenu** — clicking inside the megamenu content must NOT close it; clicking outside must. Verify in Task 3, Step 5.

---

### Task 1: Inner padding custom property and panel margin correction

**Files:**
- Modify: `scss/blocks/_navbar.scss`

**Interfaces:**
- Consumes: existing `__inner` and `__panel` element rules
- Produces: `--_px` on `__inner`; `margin-inline` correction on `__panel`; `__panel[aria-hidden="false"]` show rule moved to base (outside media query); panel link styles moved to base

- [ ] **Step 1: Record baseline**

Run: `npm run build && grep -c 'ln-navbar' dist/styles.css`
Record count. Capture the full `__panel` and `__inner` rule output for later diff.

- [ ] **Step 2: Modify `__inner` and `__panel` in `_navbar.scss`**

In `__inner`: add `--_px: 0px;` and change to `padding-inline: var(--_px);`.

In `__panel`: add `margin-inline: calc(-1 * var(--_px, 0px));`. Move `&[aria-hidden="false"] { display: block; }` from inside the mobile media query to the base element rule. Move the panel link styles (`.ln-navbar__link` width, display, padding, hover) from inside the media query to the base `__panel` element.

Remove the now-redundant panel rules from inside the mobile media query (the `&__panel` block at lines 122-128 and the link styles at lines 130-138). Keep the `&__nav`, `&__actions`, and `&__toggle` mobile rules unchanged.

- [ ] **Step 3: Build and verify**

Run: `npm run build && npm run lint`
Expected: exit code 0.

Run: `grep -A2 'navbar__panel' dist/styles.css | head -20`
Verify: `margin-inline: calc(-1 * var(--_px, 0px))` present. `[aria-hidden=false] { display: block }` is outside any media query.

Run: `grep 'navbar__inner' dist/styles.css | head -5`
Verify: `--_px: 0px` and `padding-inline: var(--_px)` present.

- [ ] **Step 4: Verify existing navbar unchanged functionally**

The compiled output will differ (moved rules), but the effective behavior is identical: panel hidden by default, shown on `aria-hidden="false"`, link styles apply. Verify the same selectors and properties exist.

- [ ] **Step 5: Commit**

```
git add scss/blocks/_navbar.scss dist/
git commit -m "Add --_px custom property to inner and panel margin correction"
```

---

### Task 2: Dropdown non-popover click handler

**Files:**
- Modify: `js/modules/dropdown.js`

**Interfaces:**
- Consumes: existing `Dropdown` class
- Produces: click-to-toggle for non-popover menus via `aria-expanded`; outside-click close

- [ ] **Step 1: Add click handler in `Dropdown.init()`**

Store `this.isPopover = this.menu.hasAttribute('popover')`. If not popover:
- Add click listener on toggle: read `aria-expanded`, toggle between `"true"`/`"false"`, call `open()`/`close()`
- Move the `toggle` event listener into an `if (this.isPopover)` guard

Update `open()`: if not popover, set `aria-expanded="true"` on toggle.
Update `close()`: if not popover, set `aria-expanded="false"` on toggle, focus toggle, clear active.

- [ ] **Step 2: Add outside-click close**

Module-level: `let outsideClickBound = false; const openNonPopoverDropdowns = new Set()`.
In `open()` (non-popover): add `this` to the set.
In `close()` (non-popover): remove `this` from the set.
In `initDropdown()`: if not bound, add document click listener that closes any dropdown whose `root` doesn't contain the click target.

- [ ] **Step 3: Build and verify**

Run: `npm run build && npm run lint`
Expected: exit code 0.

Run: `grep -c 'aria-expanded' dist/bundle.js`
Verify: the string appears (confirms the non-popover path is in the bundle).

- [ ] **Step 4: Commit**

```
git add js/modules/dropdown.js dist/
git commit -m "Add non-popover click handler to dropdown module"
```

---

### Task 3: Collapse mode JS, named panel toggle, keep element, submenu and megamenu SCSS

**Files:**
- Modify: `js/modules/navigation.js`
- Modify: `scss/blocks/_navbar.scss`

**Interfaces:**
- Consumes: `__panel` margin correction (Task 1); dropdown click handler (Task 2)
- Produces: `--collapse` modifier CSS; `__keep` element; `__megamenu`/`__megamenu-inner` elements; `data-ln-navbar-panel` JS handler; collapse class toggle on resize

- [ ] **Step 1: Add `--collapse`, `__keep`, submenu context, and megamenu SCSS**

In `_navbar.scss`, add after the `--center` modifier:

`__keep` element: `display: flex; align-items: center; gap: var(--s-h);`

Dropdown context inside navbar: `.#{s.$prefix}dropdown { position: relative; }`

Submenu inline rules inside `__panel`: `.#{s.$prefix}navbar__panel .#{s.$prefix}dropdown { position: static; width: 100%; }` and `.#{s.$prefix}navbar__panel .#{s.$prefix}dropdown__menu:not([popover]) { position: static; box-shadow: none; border: 0; border-radius: 0; min-width: 0; padding-left: var(--s3); }`

`__megamenu` element: `display: none; width: 100%; background: var(--surface); border-top: var(--bd1) solid var(--_border-color); box-shadow: var(--sh3);` with `&[aria-hidden="false"] { display: block; }`

`__megamenu-inner` element: `max-width: var(--container-wide); margin-inline: auto; padding: var(--s3) var(--gutter);`

`--collapse` modifier with mobile media query:
- `.ln-navbar__inner { flex-wrap: wrap; row-gap: 0; }`
- `.ln-navbar__toggle { display: flex; align-items: center; justify-content: center; margin-left: auto; }`
- `.ln-navbar__nav.ln-navbar__panel { flex-basis: 100%; order: 99; }`

- [ ] **Step 2: Update `navigation.js`**

Refactor `openNavbarPanel`/`closeNavbarPanel` to accept a target element parameter instead of querying inside.

Add `getToggleTarget(navbar)`: returns `__panel:not([id])` if it exists, otherwise (if navbar has `--collapse`) returns `__nav`. Update the global toggle handler to use this.

Add collapse class management: use `matchMedia` for the collapse breakpoint (`768px`). On match (mobile): if navbar has `--collapse` and no `__panel:not([id])`, add `ln-navbar__panel` class to `__nav`, set `aria-hidden="true"`. On unmatch (desktop): remove the class, remove `aria-hidden`.

Add `data-ln-navbar-panel` handler: on click, find target by id in the same navbar, toggle `aria-hidden`/`aria-expanded`. Before opening, close other open `__panel[id][aria-hidden="false"]` and `__megamenu[aria-hidden="false"]` in the same navbar (not the collapse `__nav`).

Add outside-click close for named panels/megamenus: document click listener, close if click target is outside the panel/megamenu AND outside its trigger button.

Update Escape handler: also close named panels/megamenus, return focus to trigger.

- [ ] **Step 3: Build and verify**

Run: `npm run build && npm run lint`
Expected: exit code 0.

Verify SCSS output:
- `grep 'navbar--collapse' dist/styles.css | head -5` — collapse rules present
- `grep 'navbar__keep' dist/styles.css | head -3` — keep element present
- `grep 'megamenu' dist/styles.css | head -5` — megamenu rules present
- `grep 'navbar__panel.*dropdown' dist/styles.css | head -3` — submenu inline rules present

Verify JS bundle:
- `grep -c 'navbar-panel\|navbar--collapse\|matchMedia' dist/bundle.js` — all strings present

- [ ] **Step 4: Verify existing navbar unchanged**

Run: `grep -A3 '^  \.ln-navbar__panel {' dist/styles.css | head -8`
Verify: panel base rules include margin correction and aria-hidden show rule.

The existing mobile media query still hides `__nav`, `__actions`, shows `__toggle` — unchanged for non-collapse navbars.

- [ ] **Step 5: Visual verification**

Build, start the docs dev server, open the navbar page in a browser at mobile width.

Test each scenario:
1. Collapse navbar: toggle opens/closes nav with panel styling
2. Keep group: kept links stay in bar, rest collapse
3. Named panel: "More" button opens panel at any viewport
4. Submenu: dropdown inside nav opens on click, renders inline on mobile
5. Megamenu: full-width panel opens below bar
6. Mutual exclusion: opening megamenu A closes megamenu B but not collapse nav
7. Outside click: closes named panel/megamenu
8. Escape: closes named panel/megamenu, returns focus
9. Resize: collapse class added on mobile, removed on desktop, nav returns to horizontal
10. Existing explicit-panel navbar: works as before

Take screenshots comparing collapse nav vs explicit panel at mobile to verify identical rendering.

- [ ] **Step 6: Commit**

```
git add scss/blocks/_navbar.scss js/modules/navigation.js dist/
git commit -m "Add collapse mode, keep group, named panels, submenus, and megamenus"
```

---

### Task 4: Documentation

**Files:**
- Modify: docs site `src/app/(docs)/components/navbar/page.tsx`

**Interfaces:**
- Consumes: all previous tasks

- [ ] **Step 1: Rewrite navbar docs page**

Sections in order:
1. Standard navbar (existing, unchanged)
2. Collapse navbar — `--collapse` with `__nav`, `__toggle`, no explicit panel
3. Keeping links visible — `__keep` as sibling of `__nav`
4. Panel toggle — `data-ln-navbar-panel` with named `__panel`
5. Submenus — `ln-dropdown` inside `__nav`, non-popover
6. Megamenu — `data-ln-navbar-panel` with `__megamenu`
7. Responsive navbar with explicit panel (existing, moved to end)
8. Reference table — add `--collapse`, `__keep`, `__megamenu`, `__megamenu-inner`, `data-ln-navbar-panel`

Each section has a code block and a live preview. Use `style="--_px: 1rem"` on `__inner` for examples that need padding.

- [ ] **Step 2: Build docs and verify**

Run: `cd docs && npx next build --webpack`
Expected: exit code 0.

- [ ] **Step 3: Visual verification**

Open each example at both mobile and desktop widths. Verify all interactive features work. Compare collapse nav vs explicit panel — they must look identical at mobile.

- [ ] **Step 4: Commit**

```
git add src/app/\(docs\)/components/navbar/page.tsx
git commit -m "Document navbar collapse, keep, submenus, megamenus, and named panels"
```

---

## Verification

After all tasks:

1. `npm run build` — exit code 0
2. `npm run lint` — exit code 0
3. `npx next build --webpack` in docs — exit code 0
4. Existing simple navbar CSS is unchanged
5. `__panel` renders identically inside `__inner` (with `--_px`) and outside (without)
6. Collapse toggle adds/removes `__panel` class on `__nav` at mobile breakpoint
7. `__keep` links stay visible on mobile while nav collapses
8. Named panels open at any viewport via `data-ln-navbar-panel`
9. Submenus open via non-popover click, render inline on mobile
10. Megamenus toggle via `data-ln-navbar-panel`, full width, mutual exclusion
11. Outside click closes named panels/megamenus
12. Resize desktop↔mobile preserves correct state
