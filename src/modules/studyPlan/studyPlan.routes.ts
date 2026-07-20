import { Router } from "express";
import { requireAuth } from "@middlewares/auth.middleware";
import { validate } from "@middlewares/validate.middleware";
import { generateStudyPlanSchema, refineStudyPlanSchema } from "./studyPlan.validation";
import {
  postGeneratePlan,
  postRefinePlan,
  getPlans,
  getLatestPlan,
  getPlan,
  removePlan,
} from "./studyPlan.controller";

const router = Router();

router.use(requireAuth);

router.get("/", getPlans);
router.get("/latest", getLatestPlan);
router.get("/:id", getPlan);
router.post("/generate", validate(generateStudyPlanSchema), postGeneratePlan);
router.post("/refine", validate(refineStudyPlanSchema), postRefinePlan);
router.delete("/:id", removePlan);

export default router;