import { Router } from "express";
import { requireAuth } from "@middlewares/auth.middleware";
import { documentUpload } from "./upload.middleware";
import { postAnalyzeDocument, getDocuments, getDocument, removeDocument } from "./document.controller";

const router = Router();

router.use(requireAuth);

router.get("/", getDocuments);
router.get("/:id", getDocument);
router.post("/analyze", documentUpload.single("file"), postAnalyzeDocument);
router.delete("/:id", removeDocument);

export default router;