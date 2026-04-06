# OperatorOS — Horizon 1 (builder credibility)

Date: 2026-04-05  
Status: shipped (MVP); optional follow-ups: UI copy sweep, deep-links to document tabs

## Goals

1. **Artifacts / deliverables (MVP)** — Board **Recent deliverables** lists recent issue documents + attachments via `recentDeliverables` on `GET /api/companies/:id/dashboard`; links open the issue.
2. **Guided onboarding** — [doc/OPERATOROS-ONBOARDING.md](../OPERATOROS-ONBOARDING.md) plus README + AGENTS links.
3. **Portable company polish** — [doc/PORTABLE-COMPANIES.md](../PORTABLE-COMPANIES.md) documents Agent Companies + `pnpm operatoros company` (no `companies.sh` script in-repo).

## Non-goals (this horizon)

- npm scope rename (`@operatoros/*` → `@operatoros/*`)
- Full UI copy sweep (many strings still say “Paperclip”)
- Multi-human board (Horizon 2)
