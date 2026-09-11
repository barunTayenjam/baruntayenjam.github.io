---
title: "Automating DevOps toil: the 20 hrs/week math"
date: "2026-06-30"
description: "Where 20+ hours of weekly DevOps toil actually goes, what I automated, and a simple ROI framework for picking the next target."
---

Every team I've led burns ~20 hrs/week on toil. Here's the breakdown I keep seeing:

| Toil | hrs/week |
|---|---|
| Manual deploys + rollback babysitting | 5 |
| Flaky CI reruns + pipeline babysitting | 4 |
| Log grepping + alert triage | 4 |
| Env drift (`it works on staging`) | 3 |
| Certs, secrets, access tickets | 2 |
| Status updates about the above | 2 |

Total: 20. One half-time engineer doing nothing creative.

## What I automated

- CI/CD: hermetic pipelines in GitHub Actions, `deploy.sh` single entrypoint, blue-green with one-command rollback
- Deploy scripts: `./deploy --env prod --version $SHA`, no wiki runbooks, no SSH-into-prod
- Monitoring: SLO alerts only, `runbook.md` linked in every page, auto-remediate disk/memory with systemd handlers
- Incident response: `incident init` scaffolds timeline + Slack channel + status page draft

Stack boring on purpose: bash, cron, GitHub Actions, Prometheus. No platform team needed.

## Compound effect

First automation saves 2 hrs/week. Feels small. By month 3, five automations stack: deploy fear gone → ship smaller → fewer rollbacks → fewer pages → more build time → more automation.

Team of 6 went from fortnightly painful releases to daily calm deploys in one quarter. Same headcount.

## ROI framework

Score each toil 1-5 on:

1. Frequency (`cron` daily = 5)
2. Pain (pages at 3am = 5)
3. Automate-ability (deterministic script = 5)

Sort by sum. Top item wins. Timebox to one day. If script takes longer than a day, slice smaller.

Rule: automate top toil before building new features. Toil taxes every future sprint; features don't.
