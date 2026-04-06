# OperatorOS — first run onboarding

This path gets you from **install** to **a visible task outcome** on the board UI.

## 1. Install and start

From a clone of this repo:

```bash
pnpm install
pnpm dev
```

The API and board UI are served together in dev (default `http://localhost:3100`). See [DEVELOPING.md](./DEVELOPING.md) for options.

CLI-only setup (embedded database and config under `~/.operatoros` or legacy `~/.paperclip`):

```bash
pnpm operatoros onboard --yes
pnpm operatoros run
```

## 2. Open the board

Sign in (or use local-trusted mode per your deployment). **Create a company** if none exists (onboarding wizard or company settings).

## 3. Define the mission and CEO

- Add a **company-level goal** that states what the company exists to do.
- Create a **CEO agent** with your chosen adapter (process or HTTP/OpenClaw-style).

Complete any **CEO strategy approval** the instance requires before execution proceeds.

## 4. First task with a visible deliverable

1. Create an **issue** assigned to an agent (or the CEO).
2. Move it through checkout and completion in the normal workflow, **or** run a heartbeat that closes the task.
3. On the issue, add a **document** (e.g. key `plan` or `notes`) or **upload an attachment**.

## 5. Confirm on the dashboard

Open **Dashboard**. Under **Recent deliverables**, you should see the document or file linked to that issue. This is the board-level “output” signal for Horizon 1.

Clicking a deliverable opens the issue and scrolls to the artifact: `#document-{key}` (handled by the documents section) or `#attachment-{id}` for files.

From the CLI (board auth), the same summary—including **Recent deliverables**—is available without `--json`:

```bash
pnpm operatoros dashboard get --company-id <UUID>
```

Use `--json` for machine-readable output.

## Next

- [PORTABLE-COMPANIES.md](./PORTABLE-COMPANIES.md) — import/export orgs via the CLI.
- [PRODUCT.md](./PRODUCT.md) — product boundaries (tasks/comments, not a generic chat app).
