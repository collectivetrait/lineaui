# Changelog

All notable changes to Linea UI will be documented in this file.

## [1.0.2] — 2026-10-26

### Added
- **Border system** — three border families: outline (`border`), shadow (`border-sh`) for rhythm-safe per-side borders, and native (`border-n`) for standard CSS borders. New `--border-size` and `--border-color` tokens. Shadow borders are combinable and support responsive variants. Added `bg-transparent` utility.
- **Navbar collapse mode** (`--collapse`) — JS adds the `__panel` class to `__nav` on mobile, reusing all panel CSS with no link duplication. Inner padding declared via `--_px` custom property with automatic margin correction on the panel.
- **Navbar keep group** (`__keep`) — element inside `__inner` that stays visible on mobile while `__nav` collapses.
- **Named panel toggle** (`data-ln-navbar-panel`) — toggles panels and megamenus by id at any viewport, with mutual exclusion, outside-click close, and Escape key support.
- **Navbar submenus** — nest `ln-dropdown` inside `__nav`; renders inline in the panel on mobile. Dropdown module now supports non-popover click-to-toggle via `aria-expanded`.
- **Navbar megamenus** (`__mega`, `__megamenu`, `__megamenu-inner`, `__megamenu-link`, `__mega-toggle`) — full-width absolute panel on desktop, inline under the trigger on mobile.
- **Visually-hidden utility** (`sr-only`) — clip-based pattern for screen-reader-only content.
- **Typography utilities** — `text-body-lg`, `text-body-sm`, `text-body-xs`, `text-meta` with responsive variants.
- **Missing block classes** — `ln-button--solid`, `ln-tag--outline`, `ln-code__filename`, `ln-form__heading`, `ln-site-footer__column`.
- **Spacing scale** — extended from `--s4` (2rem) to `--s8` (4rem). Padding, margin, negative margin, and gap utilities now support values 1–8.

### Changed
- **Rhythm units** — `$g` and `$r` changed from `px` to `rem` (`0.5rem`/`1.5rem`). All `r.lines()` and `r.step()` calls now output rem. All hardcoded px values across blocks converted to rem (border widths remain in px).
- **Warning contrast** — `--on-warning` changed from `#FFFFFF` to `#1C1917` for WCAG AA compliance.
- **SVG base rule** — scoped to `svg:not([class])` to avoid breaking inline icon SVGs.
- **Navbar breakpoint** — mobile max-width changed from `768px` to `767.98px` to avoid overlap with `@md` utilities.
- **Navbar toggle close icon** — changed from `display: inline` to `display: inline-block`.
- **Page header** — added `display: flex; flex-direction: column`; removed `margin-top` from `__lead`; switched `__meta`/`__actions`/`__tabs` from `margin-top` to `margin-bottom` on preceding elements; added border compensation on `__tabs`.
- **Menu** — reorganized as grid with gaps, removed `margin-top` from `__group`.
- **Toast** — reorganized `__content` as grid with gaps.
- **Quote** — moved `margin-top` from `__footer` to `margin-bottom` on `__text`.
- **Timeline** — moved `margin-top` from `__body` to `margin-bottom` on `__time`.

### Removed
- **Icon set** — removed `dist/icons.css`, `dist/icons-manifest.json`, and package.json exports. The library does not ship its own icon classes.
- **Navbar `--compact`** — removed (was a no-op since `--_height` was unused).
- **Navbar `--_height`** — removed unused custom property.
- **Stat `__chart`** — removed undocumented element.

### Fixed
- Pre-commit hook now alerts on `margin-top` declarations without `// allowed exception`.

## [1.0.1] — 2026-10-14

### Changed
- **Navbar** — mobile panel is now inline instead of modal; toggle uses CSS icon swap instead of JavaScript; removed `--bordered` modifier; simplified inner element (removed default padding, min-height and margins); mobile border only appears when panel is open.
- **Input group** — added explicit `2.5rem` height to `__control` element to match the addon.

## [1.0.0] — 2026-10-08

Initial public release of Linea UI.

### Added
- **Foundation** — CSS reset, typography scale, color tokens, spacing utilities and an 8 px vertical-rhythm grid.
- **Cascade layers** — all styles are organized into `core`, `blocks` and `utilities` layers for predictable specificity.
- **BEM naming** — every component follows Block, Element, Modifier conventions.
- **Layout blocks** — section, grid, sidebar and container helpers.
- **Content blocks** — prose, page-header, card, list, avatar, badge, code, meta, quote and tag.
- **Component blocks** — alert, breadcrumb, button-group, divider, drawer, dropdown, menu, modal, navbar, pagination, progress, site-footer, skeleton, spinner, steps, tabs, toast and tooltip.
- **Form blocks** — input, select, textarea, checkbox, radio, switch, slider and form-field layout with validation states.
- **Pattern blocks** — hero sections and common page patterns.
- **Utility classes** — spacing, display, text alignment, color and visibility helpers compiled as the last layer.
- **JavaScript modules** — drawer, dropdown, modal, tabs, toast and tooltip behaviors bundled as ES modules.
- **Theme support** — light and dark modes via `data-theme` attribute with automatic OS preference detection.
- **SCSS source** — full source available for custom builds and variable overrides.
- **CSS outputs** — pre-built `styles.css` (all-in-one), plus individual `core.css`, `blocks.css` and `utilities.css` files.
- **MIT license**.
