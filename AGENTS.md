# Project rules for AI agents

## Library styles must never depend on docs styles
The library SCSS must never reference or depend on classes, tokens, or styles
defined in the docs app. The library is a standalone artifact — it must compile
and work without the docs site.

## Class prefix
The `ln-` prefix (or whatever `$prefix` is set to) applies ONLY to BEM blocks
(`@layer layout` and `@layer blocks`). Helpers (`@layer helpers`) and utilities
(`@layer utilities`) use bare unprefixed class names.

## BEM elements require their block
Never use a BEM element class (`block__element`) without the corresponding
block class (`block`) present in the HTML ancestry. An orphaned element class
is a BEM violation — either add the block class to the markup or rename the
class to avoid the `__` pattern.

## No wildcard selectors in BEM blocks
Never use `> *` or `*` selectors inside BEM blocks. Always target children by
their explicit BEM class name (e.g. `> .#{s.$prefix}button` instead of `> *`).
Wildcards break BEM's contract that every selector maps to a named class.

## Use the simplest property available
Always prefer the simplest CSS property. Use `margin-top` not
`margin-block-start`, `margin-bottom` not `margin-block-end`, `padding-left`
not `padding-inline-start`, etc. Logical properties are only justified when the
layout genuinely needs to support both LTR and RTL writing modes.

## Outline vs border
Use `outline` with a negative offset for box outlines around containers (e.g.
boxed tabs). Use real `border` only for single-side separators (e.g. the
bottom line on a tab list). When a real border is used on a separator, adjust
the element height to compensate so vertical rhythm is preserved.

## JS module init guards
Every `initFoo()` function must guard against double-init by checking a flag on
the root element (e.g. `if (root._lnTabs) return; root._lnTabs = true;`). The
MutationObserver in `index.js` re-runs `init()` on DOM changes, and without
guards every observer tick would duplicate event listeners.

## Prefix from config
The class prefix lives in `config.json` and is consumed as `s.$prefix` in SCSS
and `prefix` in JS (via `config.js`). Never hardcode the string `ln-`.
