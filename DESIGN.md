# DESIGN.md — baruntayenjam.github.io v3 "Swiss Terminal Editorial"

<!-- impeccable:design-schema 1 -->

## World

Swiss editorial poster discipline fused with terminal/data aesthetics. Typography is the only image. Every section is a composed poster on a strict 12-column hairline grid with intentional violations (marginalia, overlap, rotation) — never a card grid.

## Tokens

- bg `#050a0c` / ink `#e9f4f2` / muted `#8fa8a4` / faint `#7a938f`
- accent `#2dd4bf` (light: `#0a7d70`) — **used only for**: interactive states, data highlights, one underline moment. Scarcity = luxury.
- gold `#fbbf24` (light `#b45309`) — **only** in the career spine gradient. Nowhere else.
- violet is banned. Orbs, glow shadows, gradient text: banned.
- Hairline `rgba(148,196,190,.13)` replaces borders-as-boxes and shadows-as-depth.

## Type

- Syne 600–800: display, uppercase, tight tracking (-0.02em), max 15vw
- Instrument Serif italic: editorial voice — the `em` inside display heads, one manifesto block
- Space Grotesk: body
- JetBrains Mono: labels, data, commits, nav
- Floor: no functional text below 12px

## Motion (transform/opacity only)

- scroll-velocity skew (±1deg, lerped rAF) on display type + marquee
- per-letter rise reveals (IO-gated, staggered)
- sticky-stacking case studies (position:sticky)
- marquee speed/direction bound to scroll velocity
- magnetic buttons, custom cursor (fine pointers)
- all disabled under prefers-reduced-motion

## Signature moments

1. Hero poster: BARUN solid / TAYENJAM outline at 15vw, velocity-skewed
2. Commit wall: 100 real commit messages as dense mono texture, filterable by repo
3. Sticky case-study stack with massive metric numerals
4. Footer: TALK at 20vw

## Anti-generic bans

card grids, chip/tag walls, icon-tile stacks, hero eyebrow chips, gradient text, glow shadows, orbs, stock section order feel — content leads, list-rows over cards, rules over boxes.

## Performance contract

no canvas, no WebGL, no images; fonts self-hosted; content-visibility on below-fold; JS < 15KB min; LCP is text.
