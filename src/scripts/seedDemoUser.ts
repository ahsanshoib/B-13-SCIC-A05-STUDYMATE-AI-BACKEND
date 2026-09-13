import { connectDB, disconnectDB } from "@config/db";
import { getAuth } from "firebase-admin/auth";
import { firebaseAdmin } from "@config/firebaseAdmin";

const DEMO_EMAIL = "demo@studymate.ai";
const DEMO_PASSWORD = "StudyMateDemo123!";
const DEMO_NAME = "Demo Student";

const run = async () => {
  await connectDB();

  const auth = getAuth(firebaseAdmin);

  try {
    
    try {
      await auth.getUserByEmail(DEMO_EMAIL);
      console.log("ℹ️  Demo user already exists — nothing to do.");
    } catch (notFoundError) {
      
      await auth.createUser({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
        displayName: DEMO_NAME,
      });
      console.log(`✅ Demo user created: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Failed to process demo user:", message);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
};

run();