import { Request, Response } from "express";
import { asyncHandler } from "@utils/asyncHandler";
import { ApiError } from "@utils/ApiError";
import * as studyPlanService from "./studyPlan.service";
import { GenerateStudyPlanInput, RefineStudyPlanInput } from "./studyPlan.validation";

export const postGeneratePlan = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const userId = req.user.uid || req.user.id; 
  
  const plan = await studyPlanService.generateStudyPlan(userId, req.body as GenerateStudyPlanInput);
  res.status(201).json({ success: true, plan });
});

export const postRefinePlan = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const userId = req.user.uid || req.user.id;

  const plan = await studyPlanService.refineStudyPlan(userId, req.body as RefineStudyPlanInput);
  res.status(201).json({ success: true, plan });
});

export const getPlans = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const userId = req.user.uid || req.user.id;

  const plans = await studyPlanService.listStudyPlans(userId);
  res.status(200).json({ success: true, plans });
});

export const getLatestPlan = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const userId = req.user.uid || req.user.id;

  const plan = await studyPlanService.getLatestStudyPlan(userId);
  res.status(200).json({ success: true, plan });
});

export const getPlan = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const userId = req.user.uid || req.user.id;

  const plan = await studyPlanService.getStudyPlanById(userId, req.params.id);
  res.status(200).json({ success: true, plan });
});

export const removePlan = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const userId = req.user.uid || req.user.id;

  await studyPlanService.deleteStudyPlan(userId, req.params.id);
  res.status(200).json({ success: true, message: "Study plan deleted" });
});