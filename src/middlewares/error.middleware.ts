import { NextFunction, Request, Response } from "express";
import { ApiError } from "@utils/ApiError";
import { env } from "@config/env";

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

export const errorHandler = (
  err: Error | ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = 500;
  let message = "Something went wrong";
  let details: unknown;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
  } else if (err.name === "ValidationError") {
    statusCode = 400;
    message = err.message;
  } else if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid identifier format";
  } else if ((err as { code?: number }).code === 11000) {
    statusCode = 409;
    message = "Duplicate value for a unique field";
  } else if (err.name === "MulterError") {
    statusCode = 400;
    message =
      (err as { code?: string }).code === "LIMIT_FILE_SIZE"
        ? "File is too large"
        : err.message;
  }

  if (env.NODE_ENV !== "production") {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(details ? { details } : {}),
    ...(env.NODE_ENV !== "production" ? { stack: err.stack } : {}),
  });
};