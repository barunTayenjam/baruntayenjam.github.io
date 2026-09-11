---
title: "Building a commit galaxy from 15 years of git history"
date: "2026-08-14"
description: "How I turned 15 years of git log into a 3D interactive galaxy with Three.js, and what it taught me about visual storytelling."
---

15 years of `git log` sat scattered across laptops, GitHub orgs, client GitLabs. Decided to see it all at once.

Not as a bar chart. As a galaxy.

## Pipeline

Step 1: dump everything.

```bash
git log --all --pretty=format:'%H|%ad|%s' --date=short --numstat > raw.log
```

Step 2: aggregate repos into one `commits.json`. Fields: `hash`, `date`, `repo`, `insertions`, `deletions`, `message`. Small script, Python stdlib only, no deps.

Step 3: feed JSON to Three.js. Each commit = one star. Position from time + repo hash. Size from diff size. Color per repo.

## Design choices

- Constellation metaphor: repos become clusters, long-running projects form dense cores
- Time slider: `<input type="range">` scrubbing 2010 → 2026, stars fade in chronologically
- Color-coded repos: consistent palette in `content.json`, legend toggles visibility
- Orbit controls, nothing else: rotate, zoom, click star for `git show` detail

Skipped: backend, DB, build step. Static JSON + CDN Three.js loads anywhere, even GitHub Pages.

## Lessons

Developer experience becomes story when data stays raw. No dashboards, no aggregation hiding outliers. That one 3am weekend with 400 commits? Visible as a bright flare. That dead quarter? Visible as void.

Biggest surprise: gaps tell more than clusters. Hiring managers ask about voids, then I explain sabbaticals, management stints, burnout breaks. Honest history beats polished resume.

Code lives on baruntayenjam.github.io — open `commits.json` in devtools, whole thing is there.
