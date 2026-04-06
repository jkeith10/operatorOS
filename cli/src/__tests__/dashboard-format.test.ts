import { describe, expect, it } from "vitest";
import { formatDashboardSummary } from "../commands/client/dashboard-format.js";
import type { DashboardSummary } from "@operatoros/shared";

const base: DashboardSummary = {
  companyId: "c1",
  agents: { active: 2, running: 0, paused: 0, error: 0 },
  tasks: { open: 3, inProgress: 1, blocked: 0, done: 5 },
  costs: {
    monthSpendCents: 12345,
    monthBudgetCents: 50000,
    monthUtilizationPercent: 24.69,
  },
  pendingApprovals: 0,
  budgets: {
    activeIncidents: 0,
    pendingApprovals: 0,
    pausedAgents: 0,
    pausedProjects: 0,
  },
  recentDeliverables: [],
};

describe("formatDashboardSummary", () => {
  it("includes headings and deliverables section", () => {
    const text = formatDashboardSummary(base);
    expect(text).toContain("Company c1");
    expect(text).toContain("Agents");
    expect(text).toContain("Recent deliverables");
    expect(text).toContain("123.45");
  });

  it("lists document and attachment lines", () => {
    const row: DashboardSummary = {
      ...base,
      recentDeliverables: [
        {
          kind: "document",
          issueId: "i1",
          issueTitle: "Task",
          issueIdentifier: "PAP-1",
          documentKey: "plan",
          documentTitle: "Plan",
          format: "markdown",
          updatedAt: "2026-04-05T00:00:00.000Z",
        },
        {
          kind: "attachment",
          issueId: "i1",
          issueTitle: "Task",
          issueIdentifier: "PAP-1",
          attachmentId: "a1",
          fileName: "out.png",
          contentType: "image/png",
          createdAt: "2026-04-05T01:00:00.000Z",
        },
      ],
    };
    const text = formatDashboardSummary(row);
    expect(text).toContain("Plan");
    expect(text).toContain("PAP-1");
    expect(text).toContain("out.png");
    expect(text).toContain("image/png");
  });
});
