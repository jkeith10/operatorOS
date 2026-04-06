# Portable companies (Agent Companies + CLI)

OperatorOS inherits **Paperclip’s company portability** model: structured orgs, agents, skills, and optional tasks can be moved between instances without a central registry.

## Concepts

- **Agent Companies format** — Markdown-first packages (`COMPANY.md`, `AGENTS.md`, `SKILL.md`, etc.). See [`docs/companies/companies-spec.md`](../docs/companies/companies-spec.md).
- **CLI** — Import/export uses the **`operatoros`** (or legacy **`paperclipai`**) CLI. There is no separate `companies.sh` script in-repo; that name refers to a possible future *discovery index*, not the import tool.

## Export

From a machine with a running instance and valid board auth:

```bash
pnpm operatoros company export --company-id <UUID> --out ./export.zip
```

Common flags (see `pnpm operatoros company export --help`): include projects, issues, skills; choose output path.

## Import

```bash
pnpm operatoros company import ./export.zip --yes
```

Or import from a Git URL (when supported by your CLI version):

```bash
pnpm operatoros company import https://github.com/org/agent-company-repo --yes
```

Use **`--dry-run`** to preview. Resolve **collisions** with `--collision rename|skip|replace` as documented in the CLI.

## Environment

- `OPERATOROS_HOME` / `PAPERCLIP_HOME` — data root for configs and instances.
- API base URL and auth — configured during `onboard` or via `configure`.

## Dashboard summary (CLI)

```bash
pnpm operatoros dashboard get --company-id <UUID>
```

Shows agents, tasks, costs approvals, and recent deliverables; add `--json` for scripts.

## Attribution

Packages may contain upstream **Paperclip**/`agentcompanies` metadata; OperatorOS-compatible instances accept the same portable shapes.
