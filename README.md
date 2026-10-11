# Linea UI

A lightweight CSS and JavaScript component library built on two core principles: **BEM naming** and an **8 px vertical rhythm**. Styles are organized into CSS cascade layers for predictable specificity, and every component ships with accessible defaults and a small footprint.

Full documentation, live demos, and usage guides are available at **[lineaui.com](https://lineaui.com)**.

## Core principles

**BEM naming** — Every component follows Block–Element–Modifier conventions. Selectors are flat and predictable: `ln-button`, `ln-card__header`, `ln-button--primary`. The `ln-` prefix applies to layout and block classes; helpers and utilities use bare names (`mb-3`, `text-center`). The prefix is configurable via `config.json`. See the [BEM guide](https://lineaui.com/getting-started/bem) for details.

**Vertical rhythm** — All spacing, line heights, and component sizing align to an 8 px baseline grid. This keeps text, form controls, and whitespace visually consistent across any combination of components. See the [vertical rhythm guide](https://lineaui.com/getting-started/vertical-rhythm) for details.

## Quick start

Include the stylesheet and script:

```html
<link rel="stylesheet" href="path/to/linea-ui/dist/styles.css">
<script type="module" src="path/to/linea-ui/dist/bundle.js"></script>
```

Or import in a bundler:

```js
import 'linea-ui/dist/styles.css';
import 'linea-ui';
```

To prevent a flash of unstyled content on themed pages, add the theme-init script to `<head>` before any stylesheet:

```html
<script src="path/to/linea-ui/dist/theme-init.js"></script>
```

## What's included

### CSS

Five CSS files, each self-contained:

| File | Contents |
|------|----------|
| `dist/styles.css` | Everything: tokens, reset, base, layout, blocks, helpers, utilities |
| `dist/core.css` | Foundation only: tokens, reset, base, layout, helpers |
| `dist/blocks.css` | Component styles (requires layer order declaration) |
| `dist/utilities.css` | Utility classes (requires layer order declaration) |
| `dist/icons.css` | Icon classes (see Icons below) |

All styles are scoped to cascade layers in this order:

```
reset → tokens → base → layout → blocks → helpers → utilities
```

### JavaScript

`dist/bundle.js` is an ESM bundle that auto-initializes interactive behaviors (dialogs, dropdowns, tooltips, tabs, toasts, galleries, and more) on `DOMContentLoaded` and observes the DOM for dynamically added elements.

### Icons

The library includes its own SVG icon set (35 icons). Each icon is a 24 × 24 filled SVG embedded via CSS masks, so icons inherit `currentColor` and scale with `font-size`. Include `dist/icons.css` alongside your main stylesheet:

```html
<link rel="stylesheet" href="path/to/linea-ui/dist/icons.css">
```

```html
<i class="ln-i-chevron-down"></i>
<i class="ln-i-search"></i>
```

`dist/icons-manifest.json` lists every available icon with its class name and SVG source. See the [icons guide](https://lineaui.com/foundation/icons) for the full set.

### SCSS source

Import the SCSS source directly for custom builds:

```scss
@use 'linea-ui/scss' as *;
```

Or import individual layers:

```scss
@use 'linea-ui/scss/tokens';
@use 'linea-ui/scss/base';
@use 'linea-ui/scss/blocks';
```

## Cascade layers

| Layer | Description |
|-------|-------------|
| `reset` | Normalize and box-sizing |
| `tokens` | Design tokens as CSS custom properties (color palette, spacing scale, type scale, elevation, motion, borders) |
| `base` | Element-level typography, forms, tables, code, media, interactive defaults |
| `layout` | Structural primitives: container, grid, shell, section, cluster |
| `blocks` | ~50 UI components from accordions to tooltips |
| `helpers` | Vertical rhythm, typographic helpers |
| `utilities` | Generated utility classes for spacing, flex, display, text, color, and more |

## Development

```bash
cd lineaui
npm install
npm run build      # one-time build
npm run dev        # watch mode
npm run lint       # ESLint + Stylelint
```

## License

[MIT](LICENSE)
