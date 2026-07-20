import { Router } from "express";
import { requireAuth } from "@middlewares/auth.middleware";
import { getSummary } from "./dashboard.controller";

const router = Router();

router.use(requireAuth);
router.get("/summary", getSummary);

export default router;