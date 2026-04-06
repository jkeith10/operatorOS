import { Command } from "commander";
import type { DashboardSummary } from "@operatoros/shared";
import {
  addCommonClientOptions,
  handleCommandError,
  printOutput,
  resolveCommandContext,
  type BaseClientOptions,
} from "./common.js";
import { formatDashboardSummary } from "./dashboard-format.js";

interface DashboardGetOptions extends BaseClientOptions {
  companyId?: string;
}

export function registerDashboardCommands(program: Command): void {
  const dashboard = program.command("dashboard").description("Dashboard summary operations");

  addCommonClientOptions(
    dashboard
      .command("get")
      .description("Get dashboard summary for a company")
      .requiredOption("-C, --company-id <id>", "Company ID")
      .action(async (opts: DashboardGetOptions) => {
        try {
          const ctx = resolveCommandContext(opts, { requireCompany: true });
          const row = await ctx.api.get<DashboardSummary>(`/api/companies/${ctx.companyId}/dashboard`);
          if (row == null) {
            throw new Error("Dashboard response was empty.");
          }
          if (ctx.json) {
            printOutput(row, { json: true });
          } else {
            console.log(formatDashboardSummary(row));
          }
        } catch (err) {
          handleCommandError(err);
        }
      }),
    { includeCompany: false },
  );
}
