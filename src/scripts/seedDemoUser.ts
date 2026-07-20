import { connectDB, disconnectDB } from "@config/db";
import { auth } from "@config/auth";

const DEMO_EMAIL = "demo@studymate.ai";
const DEMO_PASSWORD = "StudyMateDemo123!";
const DEMO_NAME = "Demo Student";

const run = async () => {
  await connectDB();

  try {
    await auth.api.signUpEmail({
      body: {
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
        name: DEMO_NAME,
      },
    });
    console.log(`Demo user created: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message.toLowerCase().includes("already exists") || message.toLowerCase().includes("duplicate")) {
      console.log("ℹ️  Demo user already exists — nothing to do.");
    } else {
      console.error("Failed to create demo user:", message);
    }
  } finally {
    await disconnectDB();
    process.exit(0);
  }
};

run();