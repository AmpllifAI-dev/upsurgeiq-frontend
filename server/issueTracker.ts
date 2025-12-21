import { getDb } from "./db";
import { eq, and, desc } from "drizzle-orm";

// Import schema
const getTechIssuesTable = async () => {
  const schema = await import("../drizzle/schema");
  return schema.techIssues;
};

// Create issue
export async function createIssue(data: {
  userId: number;
  title: string;
  description: string;
  type: "bug" | "feature_request" | "improvement" | "question";
  priority?: "low" | "medium" | "high" | "critical";
  category?: string;
  pageUrl?: string;
  browserInfo?: string;
  reproSteps?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  screenshotUrl?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const techIssues = await getTechIssuesTable();

  const [issue] = await db.insert(techIssues).values({
    userId: data.userId,
    issueType: data.type,
    priority: data.priority || "medium",
    title: data.title,
    description: data.description,
    stepsToReproduce: data.reproSteps,
    expectedBehavior: data.expectedBehavior,
    actualBehavior: data.actualBehavior,
    pageUrl: data.pageUrl,
    browserInfo: data.browserInfo,
    screenshotUrls: data.screenshotUrl,
    status: "new",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return issue;
}

// Get issues with filters
export async function getIssues(filters?: {
  userId?: number;
  status?: string;
  type?: string;
  priority?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const techIssues = await getTechIssuesTable();

  let query = db.select().from(techIssues);
  
  const conditions = [];
  if (filters?.userId) conditions.push(eq(techIssues.userId, filters.userId));
  if (filters?.status) conditions.push(eq(techIssues.status, filters.status as any));
  if (filters?.type) conditions.push(eq(techIssues.issueType, filters.type as any));
  if (filters?.priority) conditions.push(eq(techIssues.priority, filters.priority as any));

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  const issues = await query.orderBy(desc(techIssues.createdAt));
  return issues;
}

// Get issue by ID
export async function getIssueById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const techIssues = await getTechIssuesTable();

  const [issue] = await db.select().from(techIssues).where(eq(techIssues.id, id));
  return issue;
}

// Update issue status
export async function updateIssueStatus(
  id: number,
  status: "new" | "acknowledged" | "in_progress" | "resolved" | "closed" | "wont_fix",
  resolvedBy?: number,
  resolutionNotes?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const techIssues = await getTechIssuesTable();
  
  const updates: any = {
    status,
    updatedAt: new Date(),
  };
  
  if (status === "resolved" || status === "closed") {
    updates.resolvedAt = new Date();
    if (resolutionNotes) updates.resolutionNotes = resolutionNotes;
  }
  
  await db.update(techIssues).set(updates).where(eq(techIssues.id, id));
  
  return await getIssueById(id);
}

// Get issue statistics
export async function getIssueStats() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const techIssues = await getTechIssuesTable();
  
  const allIssues = await db.select().from(techIssues);
  
  return {
    total: allIssues.length,
    open: allIssues.filter((i: any) => i.status === "new" || i.status === "acknowledged").length,
    inProgress: allIssues.filter((i: any) => i.status === "in_progress").length,
    resolved: allIssues.filter((i: any) => i.status === "resolved").length,
    closed: allIssues.filter((i: any) => i.status === "closed").length,
    byType: {
      bug: allIssues.filter((i: any) => i.issueType === "bug").length,
      feature_request: allIssues.filter((i: any) => i.issueType === "feature_request").length,
      improvement: allIssues.filter((i: any) => i.issueType === "improvement").length,
      question: allIssues.filter((i: any) => i.issueType === "question").length,
    },
    byPriority: {
      low: allIssues.filter((i: any) => i.priority === "low").length,
      medium: allIssues.filter((i: any) => i.priority === "medium").length,
      high: allIssues.filter((i: any) => i.priority === "high").length,
      critical: allIssues.filter((i: any) => i.priority === "critical").length,
    },
  };
}
