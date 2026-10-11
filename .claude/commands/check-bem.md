---
description: Check Linea UI block SCSS files for BEM violations. Optionally pass a block name (e.g. "card") to check one file.
---

# Check BEM violations

Static analysis of SCSS source files under `scss/blocks/` for BEM methodology violations.

## Input

The argument is an optional block name (e.g. `card`, `tabs`).
If given, check only `_<name>.scss`. If omitted, check all block files (skip `_index.scss`).

## Violation types

### 1. Wildcard selectors

Any use of `> *` or bare `*` as a selector inside a BEM block. BEM requires every selector to target a named class.

**How to detect:** Look for `> *` or `* {` patterns in selector context. Ignore comments.

**Exceptions:** `_prose.scss` is a content-flow block that styles arbitrary HTML children by design — skip it for this rule. `_toast.scss`'s `toast-region` block uses `> *` for pointer-events on arbitrary toast children — skip `toast-region` selectors for this rule.

### 2. Raw class strings instead of BEM mixins

Selectors that spell out `.#{s.$prefix}blockname__element` or `.#{s.$prefix}blockname--modifier` at the top level of a block instead of using `@include b.element('name')` or `@include b.modifier('name')`. The BEM mixins exist to keep the nesting structure consistent.

**How to detect:** Inside a `@include b.block(...)` body, look for top-level selectors that match `.#{s.$prefix}<blockname>__<element>` or `.#{s.$prefix}<blockname>--<modifier>` but are NOT inside a `@include b.element(...)` or `@include b.modifier(...)` call.

**Exceptions:** References to the block's OWN elements/modifiers inside a modifier or element context are expected (e.g. a modifier restyling its block's elements). Only flag top-level definitions that should use the mixin.

### 3. Cross-block coupling

A block file that uses the `>` (direct child) combinator to target another block's class name. Descendant selectors without `>` are allowed — only `> .#{s.$prefix}other-block` is a violation. For example, `> .#{s.$prefix}button` inside `_button-group.scss` is a violation, but `.#{s.$prefix}button` (without `>`) is not.

**How to detect:** Inside a block file for block `X`, look for `> .#{s.$prefix}Y` where `Y` is a different block name (i.e. matches a different `_Y.scss` file in the blocks directory). Descendant references without `>` are allowed.

**Exceptions:** Cross-block references without `>` are allowed.

### 4. Unprefixed BEM block classes

Block-layer classes that hardcode `ln-` (or any literal prefix) instead of using `#{s.$prefix}`. This breaks configurability.

**How to detect:** Look for `.ln-` in selectors (not in comments, `@use`, or `@forward` statements).

### 5. Structural BEM violations

Invalid BEM structures:
- Double elements: `__element__subelement` (BEM is flat — elements don't nest)
- Modifier of element expressed backwards: `--modifier__element`

**How to detect:** In class names, look for patterns with two `__` segments or `--` followed by `__`.

## Steps

1. List all `_*.scss` files in `scss/blocks/` (excluding `_index.scss`).
2. If an argument was given, filter to just that block file.
3. For each file, read its contents and run all 5 checks.
4. Collect violations as `{ file, line, rule, detail }`.
5. Print results as a markdown table grouped by file.
6. Print a summary: files checked, files clean, files with violations, total violation count by rule.

## Output format

For each file with violations, print a section:

### `_card.scss`

| Line | Rule | Detail |
|------|------|--------|
| 42 | wildcard | `> *` selector inside `card__footer` |
| 78 | cross-block | references `button` block |

Then a summary:

**Summary:** 48 files checked, 45 clean, 3 with violations.

| Rule | Count |
|------|-------|
| wildcard | 2 |
| cross-block | 1 |

If all files are clean:

**Summary:** 48 files checked, all clean.
