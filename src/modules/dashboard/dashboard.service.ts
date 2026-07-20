import { ResourceModel } from "@models/Resource";
import { StudyPlanModel } from "@models/StudyPlan";
import { DocumentModel } from "@models/Document";
import { AiUsageModel } from "@models/AiUsage";
import { ConversationModel } from "@models/Conversation";

const DAYS_OF_ACTIVITY = 14;

export interface DashboardSummary {
  stats: {
    resourcesAdded: number;
    studyPlansGenerated: number;
    documentsAnalyzed: number;
    chatMessagesSent: number;
  };
  aiActivityByDay: { date: string; count: number }[];
  aiUsageByFeature: { feature: string; count: number }[];
  resourcesBySubject: { subject: string; count: number }[];
  latestStudyPlan: {
    _id: string;
    targetGrade: string;
    examDate: Date;
    version: number;
  } | null;
  recentDocuments: { _id: string; fileName: string; createdAt: Date }[];
}

export const getDashboardSummary = async (userId: string): Promise<DashboardSummary> => {
  const since = new Date();
  since.setDate(since.getDate() - DAYS_OF_ACTIVITY);

  const [
    resourcesAdded,
    studyPlansGenerated,
    documentsAnalyzed,
    conversations,
    activityAgg,
    featureAgg,
    subjectAgg,
    latestStudyPlan,
    recentDocuments,
  ] = await Promise.all([
    ResourceModel.countDocuments({ ownerId: userId }),
    StudyPlanModel.countDocuments({ userId }),
    DocumentModel.countDocuments({ userId }),
    ConversationModel.find({ userId }).select("messages").lean(),
    AiUsageModel.aggregate([
      { $match: { userId, createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    AiUsageModel.aggregate([
      { $match: { userId } },
      { $group: { _id: "$feature", count: { $sum: 1 } } },
    ]),
    ResourceModel.aggregate([
      { $match: { ownerId: userId } },
      { $group: { _id: "$subject", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]),
    StudyPlanModel.findOne({ userId }).sort({ createdAt: -1 }).select("targetGrade examDate version").lean(),
    DocumentModel.find({ userId }).sort({ createdAt: -1 }).limit(5).select("fileName createdAt").lean(),
  ]);

  const chatMessagesSent = conversations.reduce(
    (sum, c) => sum + c.messages.filter((m) => m.role === "user").length,
    0
  );

  const activityMap = new Map(activityAgg.map((a) => [a._id, a.count]));
  const aiActivityByDay: { date: string; count: number }[] = [];
  for (let i = DAYS_OF_ACTIVITY - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    aiActivityByDay.push({ date: key, count: activityMap.get(key) ?? 0 });
  }

  const featureLabels: Record<string, string> = {
    study_plan: "Study Planner",
    document_intelligence: "Document Intelligence",
    chat: "Chat Assistant",
  };

  return {
    stats: {
      resourcesAdded,
      studyPlansGenerated,
      documentsAnalyzed,
      chatMessagesSent,
    },
    aiActivityByDay,
    aiUsageByFeature: featureAgg.map((f) => ({
      feature: featureLabels[f._id] ?? f._id,
      count: f.count,
    })),
    resourcesBySubject: subjectAgg.map((s) => ({ subject: s._id, count: s.count })),
    latestStudyPlan: latestStudyPlan
      ? {
          _id: String(latestStudyPlan._id),
          targetGrade: latestStudyPlan.targetGrade,
          examDate: latestStudyPlan.examDate,
          version: latestStudyPlan.version,
        }
      : null,
    recentDocuments: recentDocuments.map((d) => ({
      _id: String(d._id),
      fileName: d.fileName,
      createdAt: d.createdAt,
    })),
  };
};