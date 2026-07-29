/**
 * Authenticated principal for HTTP requests (board operator, agent API key, or none).
 * Populated by auth middleware; referenced by route handlers via `req.actor`.
 */

export type PaperclipActor = BoardActor | AgentActor | NoneActor;

export type BoardActor = {
  type: "board";
  userId: string;
  /**
   * Company memberships for non-admin board users. Optional for local-trusted mode
   * and instance admins (who may act across companies).
   */
  companyIds?: string[];
  isInstanceAdmin: boolean;
  keyId?: string;
  runId?: string;
  source: "local_implicit" | "session" | "board_key";
};

export type AgentActor = {
  type: "agent";
  agentId: string;
  companyId: string;
  keyId?: string;
  runId?: string;
  source: "agent_key" | "agent_jwt";
};

export type NoneActor = {
  type: "none";
  source: "none";
  runId?: string;
};
