---
description: Check Linea UI compiled CSS for cross-browser compatibility issues. Optionally pass a path to a CSS file (defaults to dist/styles.css).
---

# CSS cross-browser compatibility check

Static analysis of the compiled stylesheet for CSS features that limit browser
support.

## Input

The argument is an optional path to a CSS file (e.g. `dist/styles.css`).
If omitted, check `dist/styles.css`.

## Steps

1. Read the CSS file.
2. Count occurrences of each CSS feature below and note the browser support
   floor for each:

| Feature | Pattern | Support floor |
|---------|---------|---------------|
| `@layer` | `@layer` | Chrome 99, Safari 15.4, Firefox 97 |
| `color-mix()` | `color-mix(` | Chrome 111, Safari 16.2, Firefox 113 |
| `:has()` | `:has(` | Chrome 105, Safari 15.4, Firefox 121 |
| `:is()` | `:is(` | Chrome 88, Safari 14, Firefox 78 |
| `:where()` | `:where(` | Chrome 88, Safari 14, Firefox 78 |
| `text-wrap: balance` | `text-wrap:\s*balance` | Chrome 114, Safari 17.5, Firefox 121 |
| `text-wrap: pretty` | `text-wrap:\s*pretty` | Chrome 117, Safari -, Firefox - |
| `aspect-ratio` | `aspect-ratio` | Chrome 88, Safari 15, Firefox 89 |
| `backdrop-filter` | `backdrop-filter` | Chrome 76, Safari 9, Firefox 103 |
| `@container` | `@container` | Chrome 105, Safari 16, Firefox 110 |
| `field-sizing` | `field-sizing` | Chrome 123, Safari -, Firefox - |
| `overflow: clip` | `overflow:\s*clip` | Chrome 90, Safari 16, Firefox 81 |

3. Determine the effective browser support floor (the highest minimum version
   across all features found).

## Output

Print a table:

| Feature | Count | Chrome | Safari | Firefox |
|---------|-------|--------|--------|---------|
| `@layer` | 72 | 99+ | 15.4+ | 97+ |
| `color-mix()` | 30 | 111+ | 16.2+ | 113+ |
| ... | | | | |

**Effective browser floor:** Chrome 114+, Safari 17.5+, Firefox 121+
(determined by `text-wrap: balance`).

Flag any feature with **no support** in a major browser (e.g. `text-wrap: pretty`
has no Safari/Firefox support) as a warning.
