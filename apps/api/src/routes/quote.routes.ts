import { Router } from "express";
import {
  getQuoteAgentController,
  searchQuoteAgentsController,
} from "../controllers/quote.controller.js";

const router = Router();

router.get("/agents", searchQuoteAgentsController);
router.get("/agents/:agentId", getQuoteAgentController);

export default router;
