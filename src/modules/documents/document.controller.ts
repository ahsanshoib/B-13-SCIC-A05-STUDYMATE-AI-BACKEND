import { Request, Response } from "express";
import { asyncHandler } from "@utils/asyncHandler";
import { ApiError } from "@utils/ApiError";
import * as documentService from "./document.service";

export const postAnalyzeDocument = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  if (!req.file) throw ApiError.badRequest("No file uploaded");

  const doc = await documentService.analyzeDocument(req.user.id, {
    buffer: req.file.buffer,
    mimetype: req.file.mimetype,
    originalname: req.file.originalname,
  });

  res.status(201).json({ success: true, document: doc });
});

export const getDocuments = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const documents = await documentService.listDocuments(req.user.id);
  res.status(200).json({ success: true, documents });
});

export const getDocument = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const document = await documentService.getDocumentById(req.user.id, req.params.id);
  res.status(200).json({ success: true, document });
});

export const removeDocument = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  await documentService.deleteDocument(req.user.id, req.params.id);
  res.status(200).json({ success: true, message: "Document deleted" });
});