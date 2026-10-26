# Navbar Redesign v2

## Lessons from v1

The first attempt tried to make `__nav` visually escape `__inner` through CSS tricks (flex-wrap, absolute positioning, display: contents). All failed because `__inner`'s padding, gap, and flex context leak into the nav — the panel looks different inside inner than outside it. The solution is not to fight the DOM but to make the panel styling position-independent.

## Core Mechanism: Inner Padding as a Custom Property

`__inner` declares its inline padding as `--_px`. The `__panel` element (real or JS-added) uses negative inline margins to cancel it when nested inside inner. When the panel is outside inner, `--_px` is not inherited and the fallback (0px) means no correction.

```scss
@include b.element('inner') {
  --_px: 0px;
  padding-inline: var(--_px);
  // ... existing rules
}

@include b.element('panel') {
  margin-inline: calc(-1 * var(--_px, 0px));
  // ... existing rules
}
```

Developers set inner padding via `--_px` instead of utility classes:

```html
<div class="ln-navbar__inner py-1" style="--_px: 1rem">
```

Or via a modifier/class that sets `--_px`. The `py-*` utility still works for block padding since it's separate from inline.

With this, `__panel` renders identically whether it's a child of `__inner` or a sibling. The link padding, font, hover, and display are the same — only the container offset changes, and the custom property corrects it.

## Feature 1: Auto-collapse (`--collapse`)

When the navbar has `--collapse` and no explicit `__panel` exists, JS adds the `ln-navbar__panel` class to `__nav` on mobile. The element now matches all existing `__panel` selectors — visibility toggle, link styles, hover background. Zero new panel CSS.

### CSS

The `--collapse` modifier adds minimal rules:

```scss
@include b.modifier('collapse') {
  @media (max-width: $collapse-bp) {
    .#{s.$prefix}navbar__inner {
      flex-wrap: wrap;
      row-gap: 0;
    }

    .#{s.$prefix}navbar__nav.#{s.$prefix}navbar__panel {
      flex-basis: 100%;
      order: 99;
    }
  }
}
```

- `flex-wrap: wrap` + `row-gap: 0` on inner lets the nav wrap below the bar with no gap
- `flex-basis: 100%` forces the nav to its own row
- `order: 99` pushes it after brand/keep/toggle
- All visual styling comes from the `__panel` class — link display, width, padding, hover

The `margin-inline` compensation from the custom property handles the inner padding difference.

### JS

In `initNavigation()`, for each `--collapse` navbar:

1. Check if an explicit unnamed `__panel` exists (`.ln-navbar__panel:not([id])`). If so, use the current behavior (no change). Named panels (`__panel[id]`) are Feature 3 targets and don't prevent collapse from activating.
2. If not, on mobile:
   - Add `ln-navbar__panel` class to `__nav`
   - Set `aria-hidden="true"` on `__nav`
3. The existing toggle handler (`data-ln-navbar-toggle`) already queries `.ln-navbar__panel` — now it finds `__nav` because it has the class.
4. On window resize crossing the breakpoint:
   - Going to mobile: add the class, set `aria-hidden`
   - Going to desktop: remove the class, remove `aria-hidden`

### HTML

```html
<nav class="ln-navbar ln-navbar--collapse">
  <div class="ln-navbar__inner py-1" style="--_px: 1rem">
    <a class="ln-navbar__brand" href="#">Brand</a>
    <div class="ln-navbar__nav">
      <a class="ln-navbar__link" href="#">Home</a>
      <a class="ln-navbar__link" href="#">Products</a>
      <a class="ln-navbar__link" href="#">About</a>
    </div>
    <button class="ln-navbar__toggle" data-ln-navbar-toggle
            aria-expanded="false" aria-label="Toggle menu">
      <i class="fa-solid fa-bars ln-navbar__toggle-open"></i>
      <i class="fa-solid fa-xmark ln-navbar__toggle-close"></i>
    </button>
  </div>
</nav>
```

No `aria-hidden` on `__nav` in the source HTML — JS adds it on mobile. On desktop, `__nav` is a normal horizontal flex row with no panel class.

## Feature 2: Keep group (`__keep`)

A `__keep` element inside `__inner` holds links that stay visible on mobile. It's a sibling of `__nav`, not inside it.

```scss
@include b.element('keep') {
  display: flex;
  align-items: center;
  gap: var(--s-h);
}
```

On mobile in `--collapse` mode, `__nav` gets hidden/panelized but `__keep` stays visible in the bar row because it's a separate element unaffected by the nav's display/order changes.

```html
<div class="ln-navbar__inner py-1" style="--_px: 1rem">
  <a class="ln-navbar__brand" href="#">Brand</a>
  <div class="ln-navbar__keep">
    <a class="ln-navbar__link" href="#">Home</a>
  </div>
  <div class="ln-navbar__nav">
    <a class="ln-navbar__link" href="#">Products</a>
    <a class="ln-navbar__link" href="#">About</a>
  </div>
  <button class="ln-navbar__toggle" data-ln-navbar-toggle ...></button>
</div>
```

## Feature 3: Named panel toggle (`data-ln-navbar-panel`)

A button with `data-ln-navbar-panel="<id>"` toggles a panel or megamenu by id at any viewport.

### Panel visibility

The base `__panel` rule currently hides the panel everywhere and only shows it on mobile via the media query. For named panels to work at any viewport, the show rule must be outside the media query:

```scss
@include b.element('panel') {
  display: none;
  margin-inline: calc(-1 * var(--_px, 0px));

  &[aria-hidden="false"] {
    display: block;
  }

  // link styles...
}
```

This is a change to the base panel rule. Backwards compatibility: the existing explicit panel pattern uses `aria-hidden` toggled by JS — this already works. The mobile media query's panel rules become redundant (the base rule handles it) and can be removed.

### JS

Wire up `data-ln-navbar-panel="<id>"` buttons:
- On click: find the target by id, toggle `aria-hidden`/`aria-expanded`
- Before opening: close any other open panel or megamenu in the same navbar (mutual exclusion among named targets, NOT the collapse `__nav`)
- Click outside a named panel or megamenu closes it (document-level click listener, consistent with dropdown behavior)
- Escape closes the nearest open named panel/megamenu and returns focus to its trigger
- On mobile, the collapse nav and a named panel/megamenu can be open simultaneously — the collapse nav is the container, the named target might be triggered from inside it

### HTML

```html
<nav class="ln-navbar">
  <div class="ln-navbar__inner py-1" style="--_px: 1rem">
    <a class="ln-navbar__brand" href="#">Brand</a>
    <div class="ln-navbar__nav">
      <a class="ln-navbar__link" href="#">Home</a>
      <a class="ln-navbar__link" href="#">Products</a>
    </div>
    <button class="ln-navbar__link" data-ln-navbar-panel="more"
            aria-expanded="false">More</button>
  </div>
  <div class="ln-navbar__panel" id="more" aria-hidden="true">
    <a class="ln-navbar__link" href="#">Resources</a>
    <a class="ln-navbar__link" href="#">Blog</a>
  </div>
</nav>
```

## Feature 4: Submenus

Nest `ln-dropdown` inside `__nav`. The dropdown toggle doubles as a `__link`.

### Dropdown non-popover click handler

The dropdown module currently relies on the browser's popover API for click-to-toggle — there is no click handler in JS. The non-popover CSS path (`aria-expanded` + adjacent sibling) exists but has no driver. Navbar submenus must not use `popover` so they can render inline on mobile. The dropdown module needs a click handler for the non-popover case:

- In `Dropdown.init()`: if `this.menu` lacks `[popover]`, add a click listener on the toggle that toggles `aria-expanded`
- Update `open()` and `close()` to set `aria-expanded` for non-popover menus
- Add outside-click close for non-popover dropdowns

### CSS context rules

```scss
// Inside navbar
.#{s.$prefix}navbar .#{s.$prefix}dropdown {
  position: relative;
}

// Inside a collapse panel on mobile: render inline
.#{s.$prefix}navbar__panel .#{s.$prefix}dropdown {
  position: static;
  width: 100%;
}

.#{s.$prefix}navbar__panel .#{s.$prefix}dropdown__menu:not([popover]) {
  position: static;
  box-shadow: none;
  border: 0;
  border-radius: 0;
  min-width: 0;
  padding-left: var(--s3);
}
```

These rules apply to ANY `__panel`, whether explicit or JS-added to `__nav`. On mobile in collapse mode, `__nav` has the `__panel` class, so the inline dropdown rules apply automatically.

### HTML

```html
<div class="ln-navbar__nav">
  <a class="ln-navbar__link" href="#">Home</a>
  <div class="ln-dropdown" data-ln-dropdown>
    <button class="ln-navbar__link ln-dropdown__toggle"
            aria-expanded="false">Products</button>
    <div class="ln-dropdown__menu">
      <a class="ln-dropdown__item" href="#">Widgets</a>
      <a class="ln-dropdown__item" href="#">Gadgets</a>
    </div>
  </div>
</div>
```

## Feature 5: Megamenus

A `__megamenu` element is a child of `.ln-navbar` (outside `__inner` — no padding correction needed). Toggled by `data-ln-navbar-panel`.

```scss
@include b.element('megamenu') {
  display: none;
  width: 100%;
  background: var(--surface);
  border-top: var(--bd1) solid var(--_border-color);
  box-shadow: var(--sh3);

  &[aria-hidden="false"] {
    display: block;
  }
}

@include b.element('megamenu-inner') {
  max-width: var(--container-wide);
  margin-inline: auto;
  padding: var(--s3) var(--gutter);
}
```

### JS

Reuses `data-ln-navbar-panel` from Feature 3. Same mutual exclusion: opening one closes others (not the collapse nav).

### HTML

```html
<nav class="ln-navbar">
  <div class="ln-navbar__inner py-1" style="--_px: 1rem">
    <a class="ln-navbar__brand" href="#">Brand</a>
    <div class="ln-navbar__nav">
      <a class="ln-navbar__link" href="#">Home</a>
      <button class="ln-navbar__link" data-ln-navbar-panel="mega-products"
              aria-expanded="false">Products</button>
    </div>
  </div>
  <div class="ln-navbar__megamenu" id="mega-products" aria-hidden="true">
    <div class="ln-navbar__megamenu-inner">
      <!-- grid, cards, whatever -->
    </div>
  </div>
</nav>
```

## Constraints

- Existing navbars (no `--collapse`, explicit `__panel`) must keep working unchanged
- `data-ln-navbar-toggle` continues to work as today
- The `__panel` class is the single source of mobile nav styling — collapse mode reuses it via JS, never duplicates it
- `--_px` custom property replaces inline padding utilities on `__inner`
- Navbar submenus must not use `popover`
- Mutual exclusion applies among named panels/megamenus only, never the collapse `__nav`

## Backwards Compatibility

- `__inner` currently has no SCSS padding — it comes from utility classes in the HTML. The `--_px` approach replaces `px-*` utilities with an inline style. Existing navbars that use `px-*` on inner still work but their panels won't have the margin correction (acceptable — they already work).
- The base `__panel` show rule moves from inside the media query to the base element. The mobile media query panel rules become redundant. Existing navbars with explicit panels still work because `aria-hidden` toggling is the same.

## What's Left to the Builder

- Resize listener strategy for the JS class toggle (matchMedia vs resize event)
- Focus management for megamenus (move focus in on open? return on Escape?)
- Whether inline submenus on mobile need an indentation marker (left border, etc.)
- Documentation with examples for each pattern
