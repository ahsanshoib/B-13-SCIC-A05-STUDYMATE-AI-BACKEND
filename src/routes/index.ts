import { Router } from "express";
import resourceRoutes from "@modules/resources/resource.routes";
import studyPlanRoutes from "@modules/studyPlan/studyPlan.routes";
import documentRoutes from "@modules/documents/document.routes";
import chatRoutes from "@modules/chat/chat.routes";
import dashboardRoutes from "@modules/dashboard/dashboard.routes";

const router = Router();

router.use("/resources", resourceRoutes);
router.use("/study-plans", studyPlanRoutes);
router.use("/documents", documentRoutes);
router.use("/chat", chatRoutes);
router.use("/dashboard", dashboardRoutes);

router.get("/", (_req, res) => {
  res.json({ success: true, message: "StudyMate AI API v1" });
});

export default router;