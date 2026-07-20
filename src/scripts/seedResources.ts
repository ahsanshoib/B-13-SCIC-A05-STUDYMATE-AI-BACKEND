import { connectDB, disconnectDB } from "@config/db";
import mongoose from "mongoose";
import { ResourceModel } from "@models/Resource";

const DEMO_EMAIL = "demo@studymate.ai";

const RESOURCES = [
  {
    title: "Organic Chemistry: Reaction Mechanisms Explained",
    shortDescription:
      "A clear walkthrough of SN1, SN2, E1, and E2 mechanisms with electron-pushing diagrams.",
    fullDescription:
      "This guide breaks down the four core substitution and elimination mechanisms tested in most intro organic chemistry courses. Each mechanism is explained step by step with electron-pushing arrows, followed by a comparison table showing when each pathway is favored based on substrate, nucleophile strength, and solvent. Includes 12 practice problems with worked solutions.",
    subject: "Chemistry",
    difficulty: "intermediate",
    estimatedStudyTimeMinutes: 90,
    tags: ["organic-chemistry", "reaction-mechanisms", "sn1", "sn2"],
  },
  {
    title: "Linear Algebra: Eigenvalues and Eigenvectors",
    shortDescription:
      "From the characteristic equation to diagonalization, with worked examples for 2x2 and 3x3 matrices.",
    fullDescription:
      "Covers how to find eigenvalues via the characteristic polynomial, compute eigenvectors for each eigenvalue, and use them to diagonalize a matrix. Includes a geometric interpretation section showing what eigenvectors represent as directions unchanged by a transformation, plus a worked example connecting eigenvalues to Markov chain steady states.",
    subject: "Mathematics",
    difficulty: "intermediate",
    estimatedStudyTimeMinutes: 75,
    tags: ["linear-algebra", "eigenvalues", "matrices"],
  },
  {
    title: "Physics Unit 4: Rotational Motion and Torque",
    shortDescription:
      "Moment of inertia, torque, angular momentum, and their conservation laws.",
    fullDescription:
      "Reviews the rotational analogs of Newton's laws: torque as the rotational equivalent of force, moment of inertia as the rotational equivalent of mass, and angular momentum conservation. Includes derivations for common shapes (disk, rod, sphere) and five practice problems involving rolling without slipping.",
    subject: "Physics",
    difficulty: "advanced",
    estimatedStudyTimeMinutes: 120,
    tags: ["rotational-motion", "torque", "angular-momentum"],
  },
  {
    title: "Data Structures: Big-O Notation Cheat Sheet",
    shortDescription:
      "Time and space complexity for common operations across arrays, linked lists, trees, and hash maps.",
    fullDescription:
      "A reference guide comparing the time complexity of insert, delete, search, and access operations across the most commonly tested data structures. Includes a decision framework for choosing the right structure based on the operations your algorithm needs most, plus common Big-O mistakes students make in technical interviews.",
    subject: "Computer Science",
    difficulty: "beginner",
    estimatedStudyTimeMinutes: 45,
    tags: ["data-structures", "big-o", "algorithms"],
  },
  {
    title: "Microeconomics: Supply, Demand, and Market Equilibrium",
    shortDescription:
      "How shifts in supply and demand curves affect price and quantity, with real-world examples.",
    fullDescription:
      "Explains the difference between a movement along a curve and a shift of the curve itself, using price ceilings, price floors, and tax incidence as worked examples. Covers consumer and producer surplus, deadweight loss, and elasticity, with graphs for each scenario.",
    subject: "Economics",
    difficulty: "beginner",
    estimatedStudyTimeMinutes: 60,
    tags: ["microeconomics", "supply-demand", "market-equilibrium"],
  },
  {
    title: "Descriptive Statistics: Mean, Median, Mode, and Standard Deviation",
    shortDescription:
      "Foundational measures of central tendency and spread, with when to use each one.",
    fullDescription:
      "Covers how to calculate and interpret mean, median, and mode, along with variance and standard deviation as measures of spread. Includes a section on when median is more appropriate than mean (skewed distributions, outliers) and a walkthrough of the empirical rule for normal distributions.",
    subject: "Statistics",
    difficulty: "beginner",
    estimatedStudyTimeMinutes: 50,
    tags: ["statistics", "mean", "standard-deviation"],
  },
  {
    title: "Cell Biology: Mitosis vs Meiosis",
    shortDescription:
      "Phase-by-phase comparison of mitosis and meiosis, including why meiosis produces genetic variation.",
    fullDescription:
      "Walks through prophase, metaphase, anaphase, and telophase for both mitosis and meiosis I/II, with diagrams showing chromosome behavior at each stage. Explains crossing over and independent assortment as the two sources of genetic variation unique to meiosis, and why this matters for sexual reproduction.",
    subject: "Biology",
    difficulty: "intermediate",
    estimatedStudyTimeMinutes: 70,
    tags: ["cell-biology", "mitosis", "meiosis", "genetics"],
  },
  {
    title: "The Cold War: Causes and Key Turning Points",
    shortDescription:
      "From the Yalta Conference to the fall of the Berlin Wall, the events that shaped 45 years of tension.",
    fullDescription:
      "A timeline-based overview covering the ideological origins of the Cold War, the Truman Doctrine and containment policy, the Cuban Missile Crisis as the closest point to direct conflict, and the eventual thaw under Gorbachev's reforms. Built for essay-based exam prep with suggested thesis angles for common prompt types.",
    subject: "History",
    difficulty: "intermediate",
    estimatedStudyTimeMinutes: 80,
    tags: ["cold-war", "20th-century", "world-history"],
  },
  {
    title: "Cognitive Psychology: Memory Models",
    shortDescription:
      "The multi-store model, working memory, and why some information moves to long-term storage.",
    fullDescription:
      "Explains Atkinson and Shiffrin's multi-store model of memory (sensory, short-term, long-term) and Baddeley's working memory model as a refinement of the short-term store. Covers encoding, storage, and retrieval, plus common causes of forgetting: decay, interference, and retrieval failure.",
    subject: "Psychology",
    difficulty: "beginner",
    estimatedStudyTimeMinutes: 55,
    tags: ["cognitive-psychology", "memory", "working-memory"],
  },
  {
    title: "Financial Accounting: Reading a Balance Sheet",
    shortDescription:
      "Assets, liabilities, and equity — how the accounting equation ties a balance sheet together.",
    fullDescription:
      "Breaks down the three sections of a balance sheet and shows how the fundamental accounting equation (Assets = Liabilities + Equity) must always balance. Includes a worked example building a balance sheet from a list of transactions, and common ratios (current ratio, debt-to-equity) analysts calculate from it.",
    subject: "Accounting",
    difficulty: "beginner",
    estimatedStudyTimeMinutes: 65,
    tags: ["accounting", "balance-sheet", "financial-statements"],
  },
  {
    title: "Circuit Analysis: Kirchhoff's Laws in Practice",
    shortDescription:
      "Applying KVL and KCL to solve multi-loop resistor circuits step by step.",
    fullDescription:
      "Covers Kirchhoff's Voltage Law and Current Law with a systematic method for setting up and solving simultaneous equations in multi-loop circuits. Includes three fully worked examples of increasing complexity, from a single loop to a three-branch circuit with two independent sources.",
    subject: "Electrical Engineering",
    difficulty: "advanced",
    estimatedStudyTimeMinutes: 95,
    tags: ["circuit-analysis", "kirchhoffs-laws", "electrical-engineering"],
  },
  {
    title: "Essay Writing: Building a Thesis-Driven Argument",
    shortDescription:
      "How to move from a broad prompt to a specific, arguable thesis and structure body paragraphs around it.",
    fullDescription:
      "A practical framework for turning an essay prompt into a clear thesis statement, then structuring each body paragraph around a single claim that supports it. Includes examples of weak vs strong thesis statements and a checklist for making sure every paragraph ties back to the central argument.",
    subject: "English Literature",
    difficulty: "beginner",
    estimatedStudyTimeMinutes: 40,
    tags: ["essay-writing", "thesis", "academic-writing"],
  },
];

const run = async () => {
  await connectDB();

  try {
    const db = mongoose.connection.db;
    if (!db) throw new Error("No active MongoDB connection");

    const demoUser = await db.collection("user").findOne({ email: DEMO_EMAIL });

    if (!demoUser) {
      console.error("❌ Demo user not found. Run `npm run seed:demo` first, then re-run this script.");
      process.exit(1);
    }

    const ownerId = String((demoUser as { id?: string })?.id ?? demoUser._id);
    const ownerName = (demoUser as { name?: string })?.name ?? "Demo Student";

    // Idempotent: clear out any previously seeded resources for this user first.
    await ResourceModel.deleteMany({ ownerId });

    await ResourceModel.insertMany(
      RESOURCES.map((r) => ({ ...r, ownerId, ownerName }))
    );

    console.log(`✅ Seeded ${RESOURCES.length} resources for ${ownerName} (${DEMO_EMAIL})`);
  } catch (error) {
    console.error("❌ Failed to seed resources:", error);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
};

run();
