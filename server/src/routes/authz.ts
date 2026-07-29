import type { Request } from "express";
import { forbidden, unauthorized } from "../errors.js";
import type { AgentActor, BoardActor, PaperclipActor } from "../types/actor.js";

type RequestWithActor<A extends PaperclipActor> = Request & { actor: A };

export function assertBoard(
  req: Request,
): asserts req is RequestWithActor<BoardActor> {
  if (req.actor.type !== "board") throw forbidden("Board access required");
}

export function assertInstanceAdmin(
  req: Request,
): asserts req is RequestWithActor<BoardActor> {
  assertBoard(req);
  if (req.actor.source === "local_implicit" || req.actor.isInstanceAdmin) {
    return;
  }
  throw forbidden("Instance admin access required");
}

export function assertCompanyAccess(req: Request, companyId: string) {
  if (req.actor.type === "none") {
    throw unauthorized();
  }
  if (req.actor.type === "agent" && req.actor.companyId !== companyId) {
    throw forbidden("Agent key cannot access another company");
  }
  if (
    req.actor.type === "board" &&
    req.actor.source !== "local_implicit" &&
    !req.actor.isInstanceAdmin
  ) {
    const allowedCompanies = req.actor.companyIds ?? [];
    if (!allowedCompanies.includes(companyId)) {
      throw forbidden("User does not have access to this company");
    }
  }
}

export function getActorInfo(req: Request) {
  if (req.actor.type === "none") {
    throw unauthorized();
  }
  if (req.actor.type === "agent") {
    return {
      actorType: "agent" as const,
      actorId: req.actor.agentId,
      agentId: req.actor.agentId,
      runId: req.actor.runId ?? null,
    };
  }

  return {
    actorType: "user" as const,
    actorId: req.actor.userId,
    agentId: null,
    runId: req.actor.runId ?? null,
  };
}
