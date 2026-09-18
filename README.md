# baruntayenjam.github.io

Portfolio of Barun Tayenjam — Technical Lead (Marketo API · Zoho Deluge · Google Apps Script · DevOps · AI).

Swiss Terminal Editorial design. Typography is the only image. Zero canvas, zero WebGL, zero images. 6KB JS total.

## Design system

- **Tokens**:  +  inline; 16 CSS custom properties. Dark default, light equal.
- **Type**: Syne 600–800 (display) + Instrument Serif (editorial voice) + Space Grotesk (body) + JetBrains Mono (data/labels). All self-hosted woff2 in .
- **Motion**: transform/opacity only. Three signature moments — velocity-reactive skew on display type, manifesto word-reveal, sticky case-study stack. All gated behind .
- **Layout**: strict 12-column hairline grid, list-rows over cards, one accent  used like ink. No gradient text, no glow shadows, no orbs.

## Structure
```
index.html            # full scroll page — hero, stats, manifesto, projects, commit wall,
                      #   case studies (sticky), skills, writing, experience, contact, footer
style.css / .min.css  # all tokens + all component styles; @font-face self-hosted
app.js / .min.js      # chrome behaviors + velocity skew + commit wall + theme toggle
commits.json          # 100 recent commits driving the wall (replaced the Three.js galaxy)
content.json          # portfolio data for og-image generator
vendor/               # removed (was Three.js; now zero dependencies)
assets/fonts/         # 16 woff2 self-hosted, 236KB total
blog/                 # 3 static HTML articles (was .md, now serves without Jekyll)
```

## Performance
| Metric | v2 (Three.js) | v3 (type-only) |
|--------|----------------|-----------------|
| DCL | 5,756ms | 43ms |
| Requests | 20+ | 7 |
| JS payload | 683KB + 23KB | 6KB |
| JS heap | ~45MB | 9.5MB |
| Canvas | 1 | 0 |
| WebGL | yes | no |

## Local preview
```bash
cd baruntayenjam.github.io && python3 -m http.server 8000
```

## CI (on push to main)
- app.js/style.css changed → esbuild regenerates .min files
- content.json changed → og-image.png regenerated
- blog .md changed → PDF rebuilt

## Deploy
Push to main (GitHub Pages). Uncomment Plausible snippet in index.html when deploying.
