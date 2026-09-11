---
title: "One-command git automation with AI"
date: "2026-07-22"
description: "My gitops tool: one `git ai` command for AI commit messages via Groq or local Ollama, and how the team actually adopted it."
---

I got tired of `fix stuff` commits. Built `git ai`.

One command:

```bash
git ai
```

It diffs staged changes, sends to LLM, writes back a conventional commit message. Review, accept, push.

## How it works

- `git diff --cached` piped to prompt template
- Backend 1: Groq + Llama, fast, good for team default
- Backend 2: Ollama (`llama3.1`), local, zero data leaves machine — client work stays compliant
- Output forced to conventional format: `type(scope): message`
- Config in `~/.gitai.yaml`: model, backend, max diff chars

No framework, ~200 lines shell + Python. `ponytail:` ceiling is monorepo-aware scoping, add when team asks.

## Team adoption

Rolled out to 8 engineers. Week 1: skepticism. Week 2: converts when they saw `git log --oneline` become readable.

Real wins:

- Commit hygiene standardized without lint-shaming in PRs
- ~5 min saved per commit × 10 commits/day × 8 devs = real hours back
- Juniors learned conventional commits by example, not wiki page nobody reads

Rule: AI drafts, human owns. `git ai` never auto-commits. You read message, edit if wrong, then `git commit`.

## AI-assisted git in practice

AI works best on boring deterministic toil with clear output contract. Commit messages fit perfectly: input bounded (`git diff`), output format fixed, human review cheap.

Don't start with agents rewriting code. Start with `git ai`. Smallest loop, fastest trust.
