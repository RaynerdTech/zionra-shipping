import type { NextFunction, Request, Response } from "express";
import { HTTP_STATUS, HttpError } from "../lib/httpError.js";
import { getQuoteAgent, searchQuoteAgents } from "../services/quote.service.js";
import { validateQuoteAgentSearch } from "../validators/quote.validators.js";

export async function searchQuoteAgentsController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const validation = validateQuoteAgentSearch(req.query as Record<string, unknown>);
    if (!validation.success) {
      res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
        message: "Validation failed.",
        errors: validation.errors,
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json(await searchQuoteAgents(validation.data));
  } catch (error) {
    next(error instanceof HttpError ? error : new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Unable to compare shipping agents."));
  }
}

export async function getQuoteAgentController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const agentId = typeof req.params.agentId === "string" ? req.params.agentId.trim() : "";
    if (!agentId) {
      throw new HttpError(HTTP_STATUS.BAD_REQUEST, "Shipping partner is required.");
    }

    res.status(HTTP_STATUS.OK).json(await getQuoteAgent(agentId));
  } catch (error) {
    next(error instanceof HttpError ? error : new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Unable to load the shipping agent."));
  }
}
