import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";
import { env } from "./env";

// Better Auth's mongodbAdapter needs a connected native `mongodb` driver
// Db instance (separate from the mongoose connection used elsewhere in the
// app). We connect eagerly here; connectDB() in db.ts still owns the
// mongoose connection used by all Mongoose models.
const client = new MongoClient(env.MONGODB_URI);
void client.connect();

// Fall back to "studymate-ai" if the connection string doesn't specify a
// database name (e.g. a bare Atlas SRV URI) — client.db() with no argument
// throws in that case instead of picking a sane default.
const db = client.db(env.MONGODB_URI.split("/").pop()?.split("?")[0] || "studymate-ai");

export const auth = betterAuth({
  database: mongodbAdapter(db),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: [env.CLIENT_URL],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    autoSignIn: true,
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },

    accout: { 
      skipStateCookieCheck: true,
      
    }
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh once per day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "student",
        input: false,
      },
      studyGoal: {
        type: "string",
        required: false,
      },
    },
  },
  advanced: {
    crossSubDomainCookies: { enabled: false },
    useSecureCookies: env.NODE_ENV === "production",
    defaultCookieAttributes: {
      sameSite: env.NODE_ENV === "production" ? "none" : "lax",
      secure: env.NODE_ENV === "production",
    },
  },
});

export type Auth = typeof auth;
