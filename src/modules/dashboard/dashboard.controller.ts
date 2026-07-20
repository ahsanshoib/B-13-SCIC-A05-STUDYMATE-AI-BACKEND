import { Request, Response } from "express";
import { asyncHandler } from "@utils/asyncHandler";
import { ApiError } from "@utils/ApiError";
import { getDashboardSummary } from "./dashboard.service";

export const getSummary = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const summary = await getDashboardSummary(req.user.id);
  res.status(200).json({ success: true, ...summary });
});