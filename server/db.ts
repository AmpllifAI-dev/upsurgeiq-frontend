import { eq } from "drizzle-orm";
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
