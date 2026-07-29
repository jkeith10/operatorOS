import type { RequestHandler } from "express";
import type {
  AgentActor,
  BoardActor,
  NoneActor,
  PaperclipActor,
} from "../../types/actor.js";

/** Test middleware: set `req.actor` with full typing (no `as any`). */
export function withTestActor(actor: PaperclipActor): RequestHandler {
  return (req, _res, next) => {
    req.actor = actor;
    next();
  };
}

export function makeBoardActor(
  overrides: Partial<BoardActor> = {},
): BoardActor {
  return {
    type: "board",
    userId: "board-user",
    companyIds: ["company-1"],
    isInstanceAdmin: false,
    source: "session",
    ...overrides,
  };
}

export function makeAgentActor(
  overrides: Partial<AgentActor> = {},
): AgentActor {
  return {
    type: "agent",
    agentId: "agent-1",
    companyId: "company-1",
    source: "agent_key",
    ...overrides,
  };
}

export function makeNoneActor(overrides: Partial<NoneActor> = {}): NoneActor {
  return {
    type: "none",
    source: "none",
    ...overrides,
  };
}
