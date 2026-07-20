import { NextFunction, Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "@config/auth";
import { ApiError } from "@utils/ApiError";
import { asyncHandler } from "@utils/asyncHandler";

export const attachSession = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
    req.user = session?.user ?? null;
    req.session = session?.session ?? null;
    next();
  }
);

export const requireAuth = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
      req.user = session?.user ?? null;
      req.session = session?.session ?? null;
    }

    if (!req.user) {
      throw ApiError.unauthorized("You must be logged in to perform this action");
    }

    next();
  }
);