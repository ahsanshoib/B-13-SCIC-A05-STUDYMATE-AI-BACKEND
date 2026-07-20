import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { toNodeHandler } from "better-auth/node";
import { auth } from "@config/auth";
import { env } from "@config/env";
import { notFoundHandler, errorHandler } from "@middlewares/error.middleware";
import apiRoutes from "./routes";

export const createApp = (): Application => {
  const app = express();
  app.set("trust proxy", 1);

  app.use(helmet());
  app.use(
    cors({
      origin: env.CLIENT_URL,
      credentials: true,
    })
  );
  app.use(compression());
  app.use(morgan(env.NODE_ENV === "development" ? "dev" : "combined"));

  const limiter = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use("/api", limiter);

  // Better Auth must be mounted BEFORE express.json() body parser
  app.all("/api/auth/*", toNodeHandler(auth));

  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.get("/health", (_req, res) => {
    res.status(200).json({ success: true, message: "StudyMate AI API is healthy" });
  });

  app.use("/api", apiRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
