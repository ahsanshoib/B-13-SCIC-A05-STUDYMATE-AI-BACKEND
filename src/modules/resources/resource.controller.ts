import { Request, Response } from "express";
import { asyncHandler } from "@utils/asyncHandler";
import { ApiError } from "@utils/ApiError";
import * as resourceService from "./resource.service";
import { ListResourcesQuery, CreateResourceInput, UpdateResourceInput } from "./resource.validation";

export const getResources = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as ListResourcesQuery;
  const result = await resourceService.listResources(query);
  res.status(200).json({ success: true, ...result });
});

export const getMyResources = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const userId = req.user.uid || req.user.id;
  const items = await resourceService.listMyResources(userId);
  res.status(200).json({ success: true, items });
});

export const getResource = asyncHandler(async (req: Request, res: Response) => {
  const resource = await resourceService.getResourceById(req.params.id);
  res.status(200).json({ success: true, resource });
});

export const getRelated = asyncHandler(async (req: Request, res: Response) => {
  const items = await resourceService.getRelatedResources(req.params.id);
  res.status(200).json({ success: true, items });
});

export const postResource = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user && !req.body.ownerId) {
    throw ApiError.unauthorized("Authentication required");
  }

  // req.user   req.body   ID  
  const userId = req.user?.uid || req.user?.id || req.body.ownerId;
  const userName = req.user?.name || req.user?.displayName || req.user?.email || "Anonymous";

  const data = req.body as CreateResourceInput;

  //  Explicitly combine validated data with ownerId
  const resourceData = {
    ...data,
    ownerId: userId,
  };

  const resource = await resourceService.createResource(resourceData, {
    id: userId,
    name: userName,
  });

  res.status(201).json({ success: true, resource });
});

export const patchResource = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const userId = req.user.uid || req.user.id;

  const data = req.body as UpdateResourceInput;
  const resource = await resourceService.updateResource(req.params.id, data, userId);
  res.status(200).json({ success: true, resource });
});

export const removeResource = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const userId = req.user.uid || req.user.id;

  await resourceService.deleteResource(req.params.id, userId);
  res.status(200).json({ success: true, message: "Resource deleted" });
});