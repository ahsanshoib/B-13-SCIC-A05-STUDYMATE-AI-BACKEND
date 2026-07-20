import { Request, Response } from "express";
import { asyncHandler } from "@utils/asyncHandler";
import { ApiError } from "@utils/ApiError";
import * as studyPlanService from "./studyPlan.service";
import { GenerateStudyPlanInput, RefineStudyPlanInput } from "./studyPlan.validation";

export const postGeneratePlan = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const plan = await studyPlanService.generateStudyPlan(req.user.id, req.body as GenerateStudyPlanInput);
  res.status(201).json({ success: true, plan });
});

export const postRefinePlan = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const plan = await studyPlanService.refineStudyPlan(req.user.id, req.body as RefineStudyPlanInput);
  res.status(201).json({ success: true, plan });
});

export const getPlans = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const plans = await studyPlanService.listStudyPlans(req.user.id);
  res.status(200).json({ success: true, plans });
});

export const getLatestPlan = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const plan = await studyPlanService.getLatestStudyPlan(req.user.id);
  res.status(200).json({ success: true, plan });
});

export const getPlan = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const plan = await studyPlanService.getStudyPlanById(req.user.id, req.params.id);
  res.status(200).json({ success: true, plan });
});

export const removePlan = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  await studyPlanService.deleteStudyPlan(req.user.id, req.params.id);
  res.status(200).json({ success: true, message: "Study plan deleted" });
});