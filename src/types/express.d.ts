import type { auth } from "@config/auth";

type Session = Awaited<ReturnType<typeof auth.api.getSession>>;

declare global {
  namespace Express {
    interface Request {
      user: NonNullable<Session>["user"] | null;
      session: NonNullable<Session>["session"] | null;
    }
  }
}

export {};
