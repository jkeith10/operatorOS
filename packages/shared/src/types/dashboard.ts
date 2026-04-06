/** Issue-linked artifact surfaced on the company dashboard (documents + attachments). */
export type DashboardDeliverable =
  | {
      kind: "document";
      issueId: string;
      issueTitle: string;
      issueIdentifier: string | null;
      documentKey: string;
      documentTitle: string | null;
      format: string;
      updatedAt: string;
    }
  | {
      kind: "attachment";
      issueId: string;
      issueTitle: string;
      issueIdentifier: string | null;
      attachmentId: string;
      fileName: string | null;
      contentType: string;
      createdAt: string;
    };

export interface DashboardSummary {
  companyId: string;
  agents: {
    active: number;
    running: number;
    paused: number;
    error: number;
  };
  tasks: {
    open: number;
    inProgress: number;
    blocked: number;
    done: number;
  };
  costs: {
    monthSpendCents: number;
    monthBudgetCents: number;
    monthUtilizationPercent: number;
  };
  pendingApprovals: number;
  budgets: {
    activeIncidents: number;
    pendingApprovals: number;
    pausedAgents: number;
    pausedProjects: number;
  };
  /** Recent issue documents and attachments, merged and sorted by recency (newest first). */
  recentDeliverables: DashboardDeliverable[];
}
