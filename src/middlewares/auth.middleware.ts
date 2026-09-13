import { NextFunction, Request, Response } from "express";
import { getAuth } from "firebase-admin/auth";
import { firebaseAdmin } from "@config/firebaseAdmin";
import { ApiError } from "@utils/ApiError";
import { asyncHandler } from "@utils/asyncHandler";

export const attachSession = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split("Bearer ")[1];

      try {
        const decodedToken = await getAuth(firebaseAdmin).verifyIdToken(token);
        
        req.user = {
          ...decodedToken,
          id: decodedToken.uid,
          uid: decodedToken.uid,
          name: decodedToken.name || decodedToken.email?.split("@")[0] || "User",
        };
      } catch {
        req.user = undefined as any;
      }
    } else {
      req.user = undefined as any;
    }

    next();
  }
);

export const requireAuth = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw ApiError.unauthorized("Authentication token is missing");
    }

    const token = authHeader.split("Bearer ")[1];

    try {
      const decodedToken = await getAuth(firebaseAdmin).verifyIdToken(token);
      
      req.user = {
        ...decodedToken,
        id: decodedToken.uid,
        uid: decodedToken.uid,
        name: decodedToken.name || decodedToken.email?.split("@")[0] || "User",
      };
      
      next();
    } catch {
      throw ApiError.unauthorized("Invalid or expired authentication token");
    }
  }
);