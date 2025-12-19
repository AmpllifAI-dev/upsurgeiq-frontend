import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  subscriptions,
  businesses,
  Subscription,
  InsertSubscription,
  Business,
  InsertBusiness,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Subscription helpers
export async function getUserSubscription(userId: number): Promise<Subscription | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createSubscription(subscription: InsertSubscription): Promise<Subscription> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(subscriptions).values(subscription);
  const insertedId = Number(result[0].insertId);

  const created = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.id, insertedId))
    .limit(1);

  if (created.length === 0) throw new Error("Failed to create subscription");
  return created[0]!;
}

export async function updateSubscription(
  subscriptionId: number,
  updates: Partial<InsertSubscription>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(subscriptions).set(updates).where(eq(subscriptions.id, subscriptionId));
}

// Business helpers
export async function getUserBusiness(userId: number): Promise<Business | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(businesses)
    .where(eq(businesses.userId, userId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createBusiness(business: InsertBusiness): Promise<Business> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(businesses).values(business);
  const insertedId = Number(result[0].insertId);

  const created = await db
    .select()
    .from(businesses)
    .where(eq(businesses.id, insertedId))
    .limit(1);

  if (created.length === 0) throw new Error("Failed to create business");
  return created[0]!;
}

export async function updateBusiness(
  businessId: number,
  updates: Partial<InsertBusiness>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(businesses).set(updates).where(eq(businesses.id, businessId));
}

export async function getBusinessById(businessId: number): Promise<Business | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(businesses)
    .where(eq(businesses.id, businessId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Notification Preferences
export async function getNotificationPreferences(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const { notificationPreferences } = await import("../drizzle/schema");
  const result = await db
    .select()
    .from(notificationPreferences)
    .where(eq(notificationPreferences.userId, userId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function upsertNotificationPreferences(
  userId: number,
  preferences: {
    emailNotifications?: boolean;
    pressReleaseNotifications?: boolean;
    campaignNotifications?: boolean;
    socialMediaNotifications?: boolean;
    weeklyDigest?: boolean;
    marketingEmails?: boolean;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { notificationPreferences } = await import("../drizzle/schema");

  // Convert boolean to int (MySQL doesn't have boolean type)
  const values = {
    userId,
    emailNotifications: preferences.emailNotifications !== undefined ? (preferences.emailNotifications ? 1 : 0) : undefined,
    pressReleaseNotifications: preferences.pressReleaseNotifications !== undefined ? (preferences.pressReleaseNotifications ? 1 : 0) : undefined,
    campaignNotifications: preferences.campaignNotifications !== undefined ? (preferences.campaignNotifications ? 1 : 0) : undefined,
    socialMediaNotifications: preferences.socialMediaNotifications !== undefined ? (preferences.socialMediaNotifications ? 1 : 0) : undefined,
    weeklyDigest: preferences.weeklyDigest !== undefined ? (preferences.weeklyDigest ? 1 : 0) : undefined,
    marketingEmails: preferences.marketingEmails !== undefined ? (preferences.marketingEmails ? 1 : 0) : undefined,
  };

  // Remove undefined values
  const cleanedValues = Object.fromEntries(
    Object.entries(values).filter(([_, v]) => v !== undefined)
  );

  // Check if preferences exist
  const existing = await getNotificationPreferences(userId);

  if (existing) {
    // Update existing preferences
    await db
      .update(notificationPreferences)
      .set(cleanedValues)
      .where(eq(notificationPreferences.userId, userId));
  } else {
    // Create new preferences with defaults
    await db.insert(notificationPreferences).values({
      userId,
      emailNotifications: cleanedValues.emailNotifications ?? 1,
      pressReleaseNotifications: cleanedValues.pressReleaseNotifications ?? 1,
      campaignNotifications: cleanedValues.campaignNotifications ?? 1,
      socialMediaNotifications: cleanedValues.socialMediaNotifications ?? 1,
      weeklyDigest: cleanedValues.weeklyDigest ?? 1,
      marketingEmails: cleanedValues.marketingEmails ?? 0,
    });
  }

  return await getNotificationPreferences(userId);
}


// Email Templates
export async function getEmailTemplates(businessId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { emailTemplates } = await import("../drizzle/schema");
  return await db
    .select()
    .from(emailTemplates)
    .where(eq(emailTemplates.businessId, businessId));
}

export async function getEmailTemplateById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { emailTemplates } = await import("../drizzle/schema");
  const results = await db
    .select()
    .from(emailTemplates)
    .where(eq(emailTemplates.id, id))
    .limit(1);

  return results[0] || null;
}

export async function createEmailTemplate(data: {
  businessId: number;
  name: string;
  subject?: string;
  headerHtml?: string;
  footerHtml?: string;
  primaryColor?: string;
  secondaryColor?: string;
  logoUrl?: string;
  isDefault?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { emailTemplates } = await import("../drizzle/schema");
  
  const result = await db.insert(emailTemplates).values(data);
  const insertId = (result as any).insertId;
  return await getEmailTemplateById(Number(insertId));
}

export async function updateEmailTemplate(
  id: number,
  data: {
    name?: string;
    subject?: string;
    headerHtml?: string;
    footerHtml?: string;
    primaryColor?: string;
    secondaryColor?: string;
    logoUrl?: string;
    isDefault?: number;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { emailTemplates } = await import("../drizzle/schema");
  
  await db
    .update(emailTemplates)
    .set(data)
    .where(eq(emailTemplates.id, id));

  return await getEmailTemplateById(id);
}

export async function deleteEmailTemplate(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { emailTemplates } = await import("../drizzle/schema");
  
  await db
    .delete(emailTemplates)
    .where(eq(emailTemplates.id, id));

  return true;
}

export async function getDefaultEmailTemplate(businessId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { emailTemplates } = await import("../drizzle/schema");
  
  const { and } = await import("drizzle-orm");
  
  const results = await db
    .select()
    .from(emailTemplates)
    .where(
      and(
        eq(emailTemplates.businessId, businessId),
        eq(emailTemplates.isDefault, 1)
      )
    )
    .limit(1);

  return results[0] || null;
}


// Team Members
export async function getTeamMembersByBusinessId(businessId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { teamMembers, users } = await import("../drizzle/schema");
  
  const results = await db
    .select({
      id: teamMembers.id,
      businessId: teamMembers.businessId,
      userId: teamMembers.userId,
      role: teamMembers.role,
      status: teamMembers.status,
      createdAt: teamMembers.createdAt,
      userName: users.name,
      userEmail: users.email,
    })
    .from(teamMembers)
    .leftJoin(users, eq(teamMembers.userId, users.id))
    .where(eq(teamMembers.businessId, businessId));

  return results;
}

export async function getTeamMemberByUserAndBusiness(userId: number, businessId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { teamMembers } = await import("../drizzle/schema");
  const { and } = await import("drizzle-orm");
  
  const results = await db
    .select()
    .from(teamMembers)
    .where(
      and(
        eq(teamMembers.userId, userId),
        eq(teamMembers.businessId, businessId)
      )
    )
    .limit(1);

  return results[0] || null;
}

export async function createTeamMember(data: {
  businessId: number;
  userId: number;
  role: string;
  invitedBy?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { teamMembers } = await import("../drizzle/schema");
  
  const result = await db.insert(teamMembers).values(data);
  return result;
}

export async function updateTeamMemberRole(id: number, role: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { teamMembers } = await import("../drizzle/schema");
  
  await db
    .update(teamMembers)
    .set({ role })
    .where(eq(teamMembers.id, id));

  return true;
}

export async function deleteTeamMember(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { teamMembers } = await import("../drizzle/schema");
  
  await db
    .delete(teamMembers)
    .where(eq(teamMembers.id, id));

  return true;
}

// Team Invitations
export async function getTeamInvitationsByBusinessId(businessId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { teamInvitations } = await import("../drizzle/schema");
  
  const results = await db
    .select()
    .from(teamInvitations)
    .where(eq(teamInvitations.businessId, businessId));

  return results;
}

export async function getTeamInvitationByToken(token: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { teamInvitations } = await import("../drizzle/schema");
  
  const results = await db
    .select()
    .from(teamInvitations)
    .where(eq(teamInvitations.token, token))
    .limit(1);

  return results[0] || null;
}

export async function createTeamInvitation(data: {
  businessId: number;
  email: string;
  role: string;
  token: string;
  invitedBy: number;
  expiresAt: Date;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { teamInvitations } = await import("../drizzle/schema");
  
  const result = await db.insert(teamInvitations).values(data);
  return result;
}

export async function updateTeamInvitationStatus(id: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { teamInvitations } = await import("../drizzle/schema");
  
  await db
    .update(teamInvitations)
    .set({ status })
    .where(eq(teamInvitations.id, id));

  return true;
}

// Saved Filters
export async function getSavedFiltersByUserId(userId: number, entityType?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { savedFilters } = await import("../drizzle/schema");
  const { and } = await import("drizzle-orm");
  
  const conditions = [eq(savedFilters.userId, userId)];
  if (entityType) {
    conditions.push(eq(savedFilters.entityType, entityType));
  }
  
  const results = await db
    .select()
    .from(savedFilters)
    .where(and(...conditions));

  return results;
}

export async function createSavedFilter(data: {
  userId: number;
  name: string;
  entityType: string;
  filterData: any;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { savedFilters } = await import("../drizzle/schema");
  
  const result = await db.insert(savedFilters).values(data);
  return result;
}

export async function deleteSavedFilter(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { savedFilters } = await import("../drizzle/schema");
  
  await db
    .delete(savedFilters)
    .where(eq(savedFilters.id, id));

  return true;
}

// Approval Requests
export async function createApprovalRequest(data: {
  pressReleaseId: number;
  requesterId: number;
  requestMessage?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { approvalRequests } = await import("../drizzle/schema");
  
  const result = await db.insert(approvalRequests).values(data);
  return result;
}

export async function getApprovalRequestsByPressRelease(pressReleaseId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { approvalRequests } = await import("../drizzle/schema");
  
  return await db
    .select()
    .from(approvalRequests)
    .where(eq(approvalRequests.pressReleaseId, pressReleaseId))
    .orderBy(desc(approvalRequests.createdAt));
}

export async function getPendingApprovalRequests(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { approvalRequests } = await import("../drizzle/schema");
  
  return await db
    .select()
    .from(approvalRequests)
    .where(eq(approvalRequests.status, "pending"))
    .orderBy(desc(approvalRequests.createdAt));
}

export async function updateApprovalRequest(id: number, data: {
  status: string;
  approverId: number;
  responseMessage?: string;
  respondedAt: Date;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { approvalRequests } = await import("../drizzle/schema");
  
  await db
    .update(approvalRequests)
    .set(data)
    .where(eq(approvalRequests.id, id));

  return true;
}

// Approval Comments
export async function createApprovalComment(data: {
  approvalRequestId: number;
  userId: number;
  comment: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { approvalComments } = await import("../drizzle/schema");
  
  const result = await db.insert(approvalComments).values(data);
  return result;
}

export async function getApprovalComments(approvalRequestId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { approvalComments } = await import("../drizzle/schema");
  
  return await db
    .select()
    .from(approvalComments)
    .where(eq(approvalComments.approvalRequestId, approvalRequestId))
    .orderBy(approvalComments.createdAt);
}

// Content Versions
export async function createContentVersion(data: {
  pressReleaseId: number;
  versionNumber: number;
  title: string;
  subtitle?: string;
  content: string;
  userId: number;
  changeDescription?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { contentVersions } = await import("../drizzle/schema");
  
  const result = await db.insert(contentVersions).values(data);
  return result;
}

export async function getContentVersions(pressReleaseId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { contentVersions } = await import("../drizzle/schema");
  
  return await db
    .select()
    .from(contentVersions)
    .where(eq(contentVersions.pressReleaseId, pressReleaseId))
    .orderBy(desc(contentVersions.versionNumber));
}

export async function getContentVersion(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { contentVersions } = await import("../drizzle/schema");
  
  const versions = await db
    .select()
    .from(contentVersions)
    .where(eq(contentVersions.id, id))
    .limit(1);

  return versions[0] || null;
}
