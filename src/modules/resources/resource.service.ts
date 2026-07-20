import { FilterQuery } from "mongoose";
import { ResourceModel, ResourceDocument } from "@models/Resource";
import { ApiError } from "@utils/ApiError";
import { CreateResourceInput, ListResourcesQuery, UpdateResourceInput } from "./resource.validation";

const SORT_MAP: Record<string, Record<string, 1 | -1>> = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  title_asc: { title: 1 },
  title_desc: { title: -1 },
  time_asc: { estimatedStudyTimeMinutes: 1 },
  time_desc: { estimatedStudyTimeMinutes: -1 },
};

export const listResources = async (query: ListResourcesQuery) => {
  const { search, subject, difficulty, sort, page, limit } = query;

  const filter: FilterQuery<ResourceDocument> = {};
  if (subject) filter.subject = subject;
  if (difficulty) filter.difficulty = difficulty;
  if (search) filter.$text = { $search: search };

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    ResourceModel.find(filter)
      .sort(SORT_MAP[sort] ?? SORT_MAP.newest)
      .skip(skip)
      .limit(limit)
      .lean(),
    ResourceModel.countDocuments(filter),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
};

export const listMyResources = async (ownerId: string) => {
  return ResourceModel.find({ ownerId }).sort({ createdAt: -1 }).lean();
};

export const getResourceById = async (id: string) => {
  const resource = await ResourceModel.findById(id).lean();
  if (!resource) throw ApiError.notFound("Resource not found");
  return resource;
};

export const getRelatedResources = async (id: string) => {
  const resource = await ResourceModel.findById(id).lean();
  if (!resource) throw ApiError.notFound("Resource not found");

  return ResourceModel.find({
    _id: { $ne: resource._id },
    subject: resource.subject,
  })
    .sort({ createdAt: -1 })
    .limit(4)
    .lean();
};

export const createResource = async (
  data: CreateResourceInput,
  owner: { id: string; name: string }
) => {
  return ResourceModel.create({
    ...data,
    imageUrl: data.imageUrl || undefined,
    ownerId: owner.id,
    ownerName: owner.name,
  });
};

export const updateResource = async (
  id: string,
  data: UpdateResourceInput,
  ownerId: string
) => {
  const resource = await ResourceModel.findById(id);
  if (!resource) throw ApiError.notFound("Resource not found");
  if (resource.ownerId !== ownerId) throw ApiError.forbidden("You don't own this resource");

  Object.assign(resource, data);
  await resource.save();
  return resource;
};

export const deleteResource = async (id: string, ownerId: string) => {
  const resource = await ResourceModel.findById(id);
  if (!resource) throw ApiError.notFound("Resource not found");
  if (resource.ownerId !== ownerId) throw ApiError.forbidden("You don't own this resource");

  await resource.deleteOne();
};