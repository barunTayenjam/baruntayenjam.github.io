# Product

<!-- impeccable:product-schema 1 -->

## Platform

web — static GitHub Pages site

## Users

Prospective employers, recruiters, and fellow engineers evaluating Barun Tayenjam's profile, experience, and open-source tools. The portfolio is a standing professional presence, not an active job-seeking surface.

## Product Purpose

Personal portfolio for Barun Tayenjam, Technical Lead at Grazitti Interactive, showcasing open-source work, real commit history, measurable case studies, and technical writing.

## Positioning

Swiss Terminal Editorial — typography is the only image. A fast, accessible, poster-grade single page: 100 real commits as data-texture, metric-led case studies, list-row projects.

## Operating Context

Static site on GitHub Pages. Content data in `content.json` (feeds og-image CI), commit data in `commits.json` (drives the commit wall). Zero dependencies: no frameworks, no canvas/WebGL, no external CDNs — fonts self-hosted in `assets/fonts/`.

## Capabilities and Constraints

- Sections: hero poster, impact stats, manifesto, open-source projects, commit wall (filterable by repo), sticky case studies, skills, writing, experience timeline, contact.
- Light/dark theme with system-preference default, localStorage persistence, zero FOUC (inline head script).
- Velocity-reactive skew on display type; all motion gated behind `prefers-reduced-motion`.
- Requires JavaScript only for: commit wall rendering, theme toggle, reveals. All content is static HTML (crawlable) and readable without JS.

## Brand Commitments

- Name: Barun Tayenjam
- Title: Technical Lead
- Palette: near-black `#050a0c`, ink `#e9f4f2`, teal accent `#2dd4bf` (light: `#0a7d70`) used like ink — interactive states and data highlights only.
- Type: Syne (display) + Instrument Serif (editorial voice) + Space Grotesk (body) + JetBrains Mono (data/labels), all self-hosted.
- Design system documented in `DESIGN.md`.

## Evidence on Hand

- `content.json` (portfolio data, og-image generator input)
- `commits.json` (100 recent commits)
- `Barun-Tayenjam-Tech-Lead-Resume.pdf` + `build-resume.py` (CI rebuilds PDF)
- CI: minify (esbuild), og-image regen, resume PDF — all scoped `permissions: contents: write`

## Product Principles

- Performance budget: LCP < 1.2s, transfer < 300KB, JS < 15KB, zero console errors.
- Accessibility: WCAG AA verified on every text/surface pair in both themes; 44px touch targets; keyboard-complete; print stylesheet.
- Honest data: the commit wall renders only real commits — no synthetic filler.

## Accessibility & Inclusion

- Responsive 320px–2560px, zero horizontal scroll.
- Screen-reader landmarks, skip link, focus-visible rings, aria-hidden decorative layer.
