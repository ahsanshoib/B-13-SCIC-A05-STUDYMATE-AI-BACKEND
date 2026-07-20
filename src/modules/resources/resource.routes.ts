import { Router } from "express";
import { requireAuth, attachSession } from "@middlewares/auth.middleware";
import { validate } from "@middlewares/validate.middleware";
import {
  createResourceSchema,
  updateResourceSchema,
  listResourcesQuerySchema,
} from "./resource.validation";
import {
  getResources,
  getMyResources,
  getResource,
  getRelated,
  postResource,
  patchResource,
  removeResource,
} from "./resource.controller";

const router = Router();

router.get("/mine", requireAuth, getMyResources);
router.get("/", attachSession, validate(listResourcesQuerySchema, "query"), getResources);
router.get("/:id/related", getRelated);
router.get("/:id", getResource);

router.post("/", requireAuth, validate(createResourceSchema), postResource);
router.patch("/:id", requireAuth, validate(updateResourceSchema), patchResource);
router.delete("/:id", requireAuth, removeResource);

export default router;