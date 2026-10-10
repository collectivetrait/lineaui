# Changelog

All notable changes to Linea UI will be documented in this file.

## [1.0.0] — 2026-10-08

Initial public release of Linea UI.

### Added
- **Foundation** — CSS reset, typography scale, color tokens, spacing utilities
  and an 8 px vertical-rhythm grid.
- **Cascade layers** — all styles are organized into `core`, `blocks` and
  `utilities` layers for predictable specificity.
- **BEM naming** — every component follows Block, Element, Modifier conventions.
- **Layout blocks** — section, grid, sidebar and container helpers.
- **Content blocks** — prose, page-header, card, list, avatar, badge, code,
  meta, quote and tag.
- **Component blocks** — alert, breadcrumb, button-group, divider, drawer,
  dropdown, menu, modal, navbar, pagination, progress, site-footer, skeleton,
  spinner, steps, tabs, toast and tooltip.
- **Form blocks** — input, select, textarea, checkbox, radio, switch, slider
  and form-field layout with validation states.
- **Pattern blocks** — hero sections and common page patterns.
- **Utility classes** — spacing, display, text alignment, color and visibility
  helpers compiled as the last layer.
- **JavaScript modules** — drawer, dropdown, modal, tabs, toast and tooltip
  behaviors bundled as ES modules.
- **Theme support** — light and dark modes via `data-theme` attribute with
  automatic OS preference detection.
- **SCSS source** — full source available for custom builds and variable
  overrides.
- **CSS outputs** — pre-built `styles.css` (all-in-one), plus individual
  `core.css`, `blocks.css` and `utilities.css` files.
- **MIT license**.
