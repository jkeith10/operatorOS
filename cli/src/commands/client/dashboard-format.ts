import pc from "picocolors";
import type { DashboardDeliverable, DashboardSummary } from "@operatoros/shared";

function formatUsd(cents: number): string {
  return (cents / 100).toFixed(2);
}

/** YYYY-MM-DD from an ISO timestamp (terminal-friendly). */
function shortDate(iso: string): string {
  const t = iso.trim();
  if (t.length >= 10) return t.slice(0, 10);
  return t;
}

function formatDeliverableLine(d: DashboardDeliverable): string {
  if (d.kind === "document") {
    const label = (d.documentTitle ?? "").trim() || d.documentKey;
    const issueRef = d.issueIdentifier ?? d.issueId.slice(0, 8);
    const t = d.updatedAt ? ` · ${shortDate(d.updatedAt)}` : "";
    return `  ${pc.dim("doc")}  ${label}  ${pc.dim(`${issueRef} · ${d.format}`)}${pc.dim(t)}`;
  }
  const name = (d.fileName ?? "").trim() || "attachment";
  const issueRef = d.issueIdentifier ?? d.issueId.slice(0, 8);
  const t = d.createdAt ? ` · ${shortDate(d.createdAt)}` : "";
  return `  ${pc.dim("file")}  ${name}  ${pc.dim(`${issueRef} · ${d.contentType}`)}${pc.dim(t)}`;
}

/** Human-readable dashboard for terminal (use `--json` for machine output). */
export function formatDashboardSummary(row: DashboardSummary): string {
  const lines: string[] = [];
  lines.push(pc.bold(`Company ${row.companyId}`));
  lines.push("");
  lines.push(
    `${pc.cyan("Agents")}   active ${row.agents.active} · running ${row.agents.running} · paused ${row.agents.paused} · error ${row.agents.error}`,
  );
  lines.push(
    `${pc.cyan("Tasks")}    open ${row.tasks.open} · in progress ${row.tasks.inProgress} · blocked ${row.tasks.blocked} · done ${row.tasks.done}`,
  );
  lines.push(
    `${pc.cyan("Costs")}    $${formatUsd(row.costs.monthSpendCents)} this month` +
      (row.costs.monthBudgetCents > 0
        ? ` (${row.costs.monthUtilizationPercent}% of $${formatUsd(row.costs.monthBudgetCents)} budget)`
        : " (no monthly budget cap)"),
  );
  lines.push(`${pc.cyan("Approvals")} ${row.pendingApprovals} pending`);
  lines.push(
    `${pc.cyan("Budgets")}  ${row.budgets.activeIncidents} incidents · ${row.budgets.pendingApprovals} pending approvals · ${row.budgets.pausedAgents} agents paused · ${row.budgets.pausedProjects} projects paused`,
  );

  const deliverables = row.recentDeliverables ?? [];
  lines.push("");
  lines.push(pc.cyan("Recent deliverables"));
  if (deliverables.length === 0) {
    lines.push(pc.dim("  (none — add issue documents or attachments)"));
  } else {
    for (const d of deliverables) {
      lines.push(formatDeliverableLine(d));
    }
  }

  return lines.join("\n");
}
