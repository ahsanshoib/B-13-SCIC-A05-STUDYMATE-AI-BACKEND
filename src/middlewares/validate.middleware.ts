import { NextFunction, Request, Response } from "express";
import { AnyZodObject, ZodError } from "zod";
import { ApiError } from "@utils/ApiError";

type Target = "body" | "query" | "params";

export const validate =
  (schema: AnyZodObject, target: Target = "body") =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req[target]);
      (req[target] as unknown) = parsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.flatten().fieldErrors;
        return next(ApiError.badRequest("Validation failed", details));
      }
      next(error);
    }
  };