# Border System Design

## Intent

Linea UI's border utilities currently use `outline` with negative offset to avoid breaking vertical rhythm. This works for all-sides borders but cannot target individual sides or axes. Developers work around this with ad hoc `box-shadow` rules or native `border-*` properties. This design introduces a unified border system with three approaches, new tokens, and per-side utility classes — all backwards-compatible with the existing `.border` utilities.

## Why now

The outline-only approach has been a friction point: per-side borders (dividers, accent lines, section separators) are common and the library offers no utility for them. The codebase itself uses native `border-*` in ~55 places across 20+ blocks, with per-block compensation to preserve rhythm. Utility users have no such mechanism.

## Goals

- Per-side and per-axis border utilities that don't break vertical rhythm
- Unified `--border-size` and `--border-color` tokens that all three approaches consume
- Combinable classes (e.g. `.border-t .border-s` on the same element)
- Full backwards compatibility: `.border`, `.border-2`, `.border-3`, `.border-0`, `.border-default` keep working exactly as they do today

## Non-goals

- Migrating existing block internals from native `border-*` to shadow — those already compensate and are outside this scope
- Providing a rhythm compensation mechanism for native border utilities — that's the developer's responsibility

## Anti-goals

- A system so complex that developers avoid it and keep writing custom CSS

## The Three Approaches

### 1. Outline (existing, unchanged)

**Mechanism:** `outline` + `outline-offset: calc(-1 * width)`

**Pros:** True border appearance, respects `border-radius`, no layout shift, well-tested.

**Cons:** All-sides only. Cannot target individual sides or axes.

**Use case:** Full borders on cards, containers, form controls.

**Classes:** `.border`, `.border-2`, `.border-3`, `.border-0`, `.border-default` — no changes.

### 2. Box-shadow (new — per-side, rhythm-safe)

**Mechanism:** `box-shadow: inset` with directional offsets.

**Pros:** No layout shift, per-side and per-axis targeting, combinable via comma-separated shadows using CSS custom properties.

**Cons:** Doesn't respect `border-radius` at corners (the inset shadow bleeds straight). Competes with elevation shadows on the same element (requires combining via custom properties, not raw `box-shadow` declarations).

**Use case:** Section dividers, list separators, top/bottom accents — anywhere you need a single-side border without rhythm cost.

**Implementation — combinability:**

Each per-side class sets a custom property for its shadow layer. A shared rule combines them:

```scss
--_border-t: ;
--_border-b: ;
--_border-s: ;
--_border-e: ;
box-shadow: var(--_border-t) var(--_border-b) var(--_border-s) var(--_border-e);
```

Each side class sets its variable:

```scss
.border-t { --_border-t: inset 0  var(--border-size) 0 var(--border-color); }
.border-b { --_border-b: inset 0 calc(-1 * var(--border-size)) 0 var(--border-color); }
.border-s { --_border-s: inset  var(--border-size) 0 0 var(--border-color); }
.border-e { --_border-e: inset calc(-1 * var(--border-size)) 0 0 var(--border-color); }
```

Axis classes set both sides:

```scss
.border-x { --_border-s: ...; --_border-e: ...; }
.border-y { --_border-t: ...; --_border-b: ...; }
```

The empty initial values (space token ` `) ensure unused layers produce no shadow. The trailing comma handling uses the CSS custom property space toggle pattern.

**Shadow coexistence:** Per-side border classes set `box-shadow` directly. They must not be combined with `.shadow-*` elevation or inset utilities on the same element — document this as a constraint. The `.shadow-*` utilities are unchanged; no breaking changes to elevation.

### 3. Native border (new — per-side, developer compensates)

**Mechanism:** Standard CSS `border-*` properties.

**Pros:** Full CSS border behavior — respects `border-radius`, supports `border-style` variants (dashed, dotted), works with CSS transitions.

**Cons:** Adds to element dimensions, breaks vertical rhythm. The library cannot compensate automatically; the developer must adjust padding or use `calc()`.

**Use case:** When border-style matters (dashed outlines, dotted separators) or when the developer is handling their own rhythm compensation.

**Classes:** `.border-native-t`, `.border-native-b`, `.border-native-s`, `.border-native-e`, `.border-native-x`, `.border-native-y`. The `native` infix makes the rhythm cost explicit in the class name.

```scss
.border-native-t { border-top: var(--border-size) solid var(--border-color); }
.border-native-b { border-bottom: var(--border-size) solid var(--border-color); }
// etc.
```

## New Tokens

```scss
:root {
  --border-size:  var(--bd1);    // default width, aliases existing token
  --border-color: var(--border); // default color, aliases existing token
}
```

All three approaches consume these tokens. Developers override them locally:

```html
<div class="border-b" style="--border-size: var(--bd3); --border-color: var(--primary);">
```

The existing `--bd1/2/3` tokens remain. `--border-size` is the semantic default; `--bd*` are the explicit widths available for overrides.

## Utility Classes — Full List

### All-sides (existing, unchanged)

| Class | Approach | Description |
|-------|----------|-------------|
| `.border` | outline | 1px border, all sides |
| `.border-2` | outline | 2px border, all sides |
| `.border-3` | outline | 3px border, all sides |
| `.border-0` | outline | Remove border |
| `.border-default` | outline | Neutral border color variant |

### Per-side shadow (new)

| Class | Shadow rule |
|-------|------------|
| `.border-t` | `inset 0 var(--border-size) 0 var(--border-color)` |
| `.border-b` | `inset 0 calc(-1 * var(--border-size)) 0 var(--border-color)` |
| `.border-s` | `inset var(--border-size) 0 0 var(--border-color)` |
| `.border-e` | `inset calc(-1 * var(--border-size)) 0 0 var(--border-color)` |
| `.border-x` | `.border-s` + `.border-e` |
| `.border-y` | `.border-t` + `.border-b` |

### Per-side native (new)

| Class | CSS property |
|-------|-------------|
| `.border-native-t` | `border-top` |
| `.border-native-b` | `border-bottom` |
| `.border-native-s` | `border-left` |
| `.border-native-e` | `border-right` |
| `.border-native-x` | `border-inline` |
| `.border-native-y` | `border-block` |

### Reset variants

| Class | Effect |
|-------|--------|
| `.border-t-0` | Remove top shadow border |
| `.border-b-0` | Remove bottom shadow border |
| `.border-s-0` | Remove start shadow border |
| `.border-e-0` | Remove end shadow border |

## Responsive

Per-side classes get responsive variants following the existing pattern: `.border-t@md`, `.border-b@lg`, etc.

## Constraints

- `.border` (all-sides outline) is unchanged. Backwards compatibility is non-negotiable.
- Per-side shadow border classes and `.shadow-*` utilities must not be used on the same element. This is a documented constraint, not a technical composition problem. `.shadow-*` utilities are unchanged.
- The `--border-size` and `--border-color` tokens must default to values that match the existing `.border` visual output.

## What's Left to the Builder

- Implement the custom property composition pattern for combining multiple per-side shadow borders on the same element.
- Decide whether native border utilities are worth the class count given they require external compensation, or whether documentation guidance is sufficient.
- Wire the new utilities into the existing utility generator in `scss/utilities/_map.scss` or determine if they need hand-written rules (the `declarations` format in the utility map may not support the custom property pattern needed).
- Add documentation page for the border system.
