import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Subscription Plans
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  plan: mysqlEnum("plan", ["starter", "pro", "scale"]).notNull(),
  status: mysqlEnum("status", ["active", "canceled", "past_due", "trialing"]).notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  currentPeriodStart: timestamp("currentPeriodStart"),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  cancelAtPeriodEnd: int("cancelAtPeriodEnd").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

// Business Profiles
export const businesses = mysqlTable("businesses", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  website: varchar("website", { length: 500 }),
  sicCode: varchar("sicCode", { length: 10 }),
  sicSection: varchar("sicSection", { length: 100 }),
  sicDivision: varchar("sicDivision", { length: 100 }),
  sicGroup: varchar("sicGroup", { length: 100 }),
  brandVoiceTone: mysqlEnum("brandVoiceTone", ["formal", "friendly", "inspirational", "witty", "educational"]),
  brandVoiceStyle: mysqlEnum("brandVoiceStyle", ["concise", "detailed", "story_driven", "data_driven"]),
  targetAudience: text("targetAudience"),
  dossier: text("dossier"),
  aiImageStyle: varchar("aiImageStyle", { length: 100 }),
  aiImageMood: varchar("aiImageMood", { length: 100 }),
  aiImageColorPalette: varchar("aiImageColorPalette", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Business = typeof businesses.$inferSelect;
export type InsertBusiness = typeof businesses.$inferInsert;

// Social Media Accounts
export const socialMediaAccounts = mysqlTable("social_media_accounts", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("businessId").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  platform: mysqlEnum("platform", ["facebook", "instagram", "linkedin", "x"]).notNull(),
  accountId: varchar("accountId", { length: 255 }),
  accountName: varchar("accountName", { length: 255 }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  tokenExpiry: timestamp("tokenExpiry"),
  customTone: mysqlEnum("customTone", ["formal", "friendly", "inspirational", "witty", "educational"]),
  isConnected: int("isConnected").default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SocialMediaAccount = typeof socialMediaAccounts.$inferSelect;
export type InsertSocialMediaAccount = typeof socialMediaAccounts.$inferInsert;

// Sports Teams (for motorsport clients)
export const sportsTeams = mysqlTable("sports_teams", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("businessId").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  teamName: varchar("teamName", { length: 255 }).notNull(),
  series: varchar("series", { length: 255 }).notNull(),
  schedule: text("schedule"),
  lastScheduleUpdate: timestamp("lastScheduleUpdate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SportsTeam = typeof sportsTeams.$inferSelect;
export type InsertSportsTeam = typeof sportsTeams.$inferInsert;

// Press Releases
export const pressReleases = mysqlTable("press_releases", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("businessId").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  userId: int("userId").notNull().references(() => users.id),
  title: varchar("title", { length: 500 }).notNull(),
  subtitle: varchar("subtitle", { length: 500 }),
  body: text("body").notNull(),
  status: mysqlEnum("status", ["draft", "scheduled", "published", "archived"]).default("draft").notNull(),
  scheduledFor: timestamp("scheduledFor"),
  publishedAt: timestamp("publishedAt"),
  imageUrl: varchar("imageUrl", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PressRelease = typeof pressReleases.$inferSelect;
export type InsertPressRelease = typeof pressReleases.$inferInsert;

// Social Media Posts
export const socialMediaPosts = mysqlTable("social_media_posts", {
  id: int("id").autoincrement().primaryKey(),
  pressReleaseId: int("pressReleaseId").references(() => pressReleases.id, { onDelete: "cascade" }),
  businessId: int("businessId").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  platform: mysqlEnum("platform", ["facebook", "instagram", "linkedin", "x"]).notNull(),
  content: text("content").notNull(),
  imageUrl: varchar("imageUrl", { length: 500 }),
  status: mysqlEnum("status", ["draft", "scheduled", "published", "failed"]).default("draft").notNull(),
  scheduledFor: timestamp("scheduledFor"),
  publishedAt: timestamp("publishedAt"),
  platformPostId: varchar("platformPostId", { length: 255 }),
  engagementLikes: int("engagementLikes").default(0),
  engagementComments: int("engagementComments").default(0),
  engagementShares: int("engagementShares").default(0),
  engagementReach: int("engagementReach").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SocialMediaPost = typeof socialMediaPosts.$inferSelect;
export type InsertSocialMediaPost = typeof socialMediaPosts.$inferInsert;

// Media Lists
export const mediaLists = mysqlTable("media_lists", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("businessId").references(() => businesses.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  type: mysqlEnum("type", ["default", "custom", "purchased"]).default("custom").notNull(),
  industry: varchar("industry", { length: 100 }),
  region: varchar("region", { length: 100 }),
  geography: varchar("geography", { length: 100 }),
  isPublic: int("isPublic").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MediaList = typeof mediaLists.$inferSelect;
export type InsertMediaList = typeof mediaLists.$inferInsert;

// Media List Contacts
export const mediaListContacts = mysqlTable("media_list_contacts", {
  id: int("id").autoincrement().primaryKey(),
  mediaListId: int("mediaListId").notNull().references(() => mediaLists.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  publication: varchar("publication", { length: 255 }),
  role: varchar("role", { length: 100 }),
  phone: varchar("phone", { length: 50 }),
  isVerified: int("isVerified").default(0),
  hasOptedOut: int("hasOptedOut").default(0),
  lastContactedAt: timestamp("lastContactedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MediaListContact = typeof mediaListContacts.$inferSelect;
export type InsertMediaListContact = typeof mediaListContacts.$inferInsert;

// Press Release Distributions
export const pressReleaseDistributions = mysqlTable("press_release_distributions", {
  id: int("id").autoincrement().primaryKey(),
  pressReleaseId: int("pressReleaseId").notNull().references(() => pressReleases.id, { onDelete: "cascade" }),
  mediaListId: int("mediaListId").notNull().references(() => mediaLists.id),
  status: mysqlEnum("status", ["pending", "sending", "sent", "failed"]).default("pending").notNull(),
  sentAt: timestamp("sentAt"),
  recipientCount: int("recipientCount").default(0),
  openCount: int("openCount").default(0),
  clickCount: int("clickCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PressReleaseDistribution = typeof pressReleaseDistributions.$inferSelect;
export type InsertPressReleaseDistribution = typeof pressReleaseDistributions.$inferInsert;

// Preset Prompts
export const presetPrompts = mysqlTable("preset_prompts", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  promptText: text("promptText").notNull(),
  isPublic: int("isPublic").default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PresetPrompt = typeof presetPrompts.$inferSelect;
export type InsertPresetPrompt = typeof presetPrompts.$inferInsert;

// Campaigns (for Intelligent Campaign Lab)
export const campaigns = mysqlTable("campaigns", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("businessId").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  userId: int("userId").notNull().references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  goal: text("goal"),
  status: mysqlEnum("status", ["draft", "active", "paused", "completed"]).default("draft").notNull(),
  platforms: varchar("platforms", { length: 255 }),
  budget: int("budget"),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = typeof campaigns.$inferInsert;

// Campaign Variants
export const campaignVariants = mysqlTable("campaign_variants", {
  id: int("id").autoincrement().primaryKey(),
  campaignId: int("campaignId").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  psychologicalAngle: varchar("psychologicalAngle", { length: 255 }),
  adCopy: text("adCopy"),
  imageUrl: varchar("imageUrl", { length: 500 }),
  status: mysqlEnum("status", ["testing", "winning", "losing", "archived"]).default("testing").notNull(),
  impressions: int("impressions").default(0),
  clicks: int("clicks").default(0),
  conversions: int("conversions").default(0),
  cost: int("cost").default(0),
  ctr: varchar("ctr", { length: 10 }),
  conversionRate: varchar("conversionRate", { length: 10 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CampaignVariant = typeof campaignVariants.$inferSelect;
export type InsertCampaignVariant = typeof campaignVariants.$inferInsert;

// Partners (for White-Label Program)
export const partners = mysqlTable("partners", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  organizationName: varchar("organizationName", { length: 255 }).notNull(),
  organizationType: varchar("organizationType", { length: 100 }),
  brandingLogoUrl: varchar("brandingLogoUrl", { length: 500 }),
  brandingPrimaryColor: varchar("brandingPrimaryColor", { length: 7 }),
  brandingSecondaryColor: varchar("brandingSecondaryColor", { length: 7 }),
  customDomain: varchar("customDomain", { length: 255 }),
  commissionRate: int("commissionRate").default(20),
  status: mysqlEnum("status", ["active", "inactive", "pending"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Partner = typeof partners.$inferSelect;
export type InsertPartner = typeof partners.$inferInsert;

// Partner Referrals
export const partnerReferrals = mysqlTable("partner_referrals", {
  id: int("id").autoincrement().primaryKey(),
  partnerId: int("partnerId").notNull().references(() => partners.id, { onDelete: "cascade" }),
  referredUserId: int("referredUserId").notNull().references(() => users.id),
  subscriptionId: int("subscriptionId").references(() => subscriptions.id),
  status: mysqlEnum("status", ["pending", "active", "canceled"]).default("pending").notNull(),
  totalCommissionEarned: int("totalCommissionEarned").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PartnerReferral = typeof partnerReferrals.$inferSelect;
export type InsertPartnerReferral = typeof partnerReferrals.$inferInsert;

// AI Chat History
export const aiChatHistory = mysqlTable("ai_chat_history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  businessId: int("businessId").references(() => businesses.id, { onDelete: "cascade" }),
  sessionId: varchar("sessionId", { length: 255 }).notNull(),
  role: mysqlEnum("role", ["user", "assistant", "system"]).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AiChatHistory = typeof aiChatHistory.$inferSelect;
export type InsertAiChatHistory = typeof aiChatHistory.$inferInsert;
// Error Logs (for monitoring and debugging)
export const errorLogs = mysqlTable("error_logs", {
  id: int("id").autoincrement().primaryKey(),
  level: mysqlEnum("level", ["info", "warn", "error", "debug"]).notNull(),
  message: text("message").notNull(),
  userId: int("userId").references(() => users.id, { onDelete: "set null" }),
  component: varchar("component", { length: 100 }),
  action: varchar("action", { length: 100 }),
  errorStack: text("errorStack"),
  metadata: text("metadata"), // JSON string
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ErrorLog = typeof errorLogs.$inferSelect;
export type InsertErrorLog = typeof errorLogs.$inferInsert;

// Payments (One-time purchases like media list distribution)
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }).notNull().unique(),
  stripeChargeId: varchar("stripeChargeId", { length: 255 }),
  amount: int("amount").notNull(), // Amount in cents
  currency: varchar("currency", { length: 3 }).default("gbp").notNull(),
  status: mysqlEnum("status", ["pending", "succeeded", "failed", "canceled", "refunded"]).notNull(),
  paymentType: mysqlEnum("paymentType", ["media_list_purchase", "other"]).notNull(),
  metadata: text("metadata"), // JSON string for additional data (e.g., which media list, press release ID)
  refundedAmount: int("refundedAmount").default(0),
  refundedAt: timestamp("refundedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

// Press Release Distributions (Email tracking)
export const distributions = mysqlTable("distributions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  pressReleaseId: int("pressReleaseId").notNull().references(() => pressReleases.id, { onDelete: "cascade" }),
  mediaListId: int("mediaListId").notNull().references(() => mediaLists.id, { onDelete: "cascade" }),
  trackingId: varchar("trackingId", { length: 64 }).notNull().unique(), // UUID for tracking
  recipientEmail: varchar("recipientEmail", { length: 320 }).notNull(),
  recipientName: varchar("recipientName", { length: 255 }),
  status: mysqlEnum("status", ["pending", "sending", "sent", "failed", "bounced"]).notNull().default("pending"),
  sentAt: timestamp("sentAt"),
  openedAt: timestamp("openedAt"),
  clickedAt: timestamp("clickedAt"),
  openCount: int("openCount").default(0).notNull(),
  clickCount: int("clickCount").default(0).notNull(),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Distribution = typeof distributions.$inferSelect;
export type InsertDistribution = typeof distributions.$inferInsert;

// Social Media Accounts (OAuth connections)
export const socialAccounts = mysqlTable("social_accounts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  businessId: int("businessId").references(() => businesses.id, { onDelete: "cascade" }),
  platform: mysqlEnum("platform", ["facebook", "instagram", "linkedin", "x"]).notNull(),
  accountId: varchar("accountId", { length: 255 }).notNull(), // Platform-specific account ID
  accountName: varchar("accountName", { length: 255 }),
  accessToken: text("accessToken").notNull(), // Encrypted in production
  refreshToken: text("refreshToken"),
  tokenExpiresAt: timestamp("tokenExpiresAt"),
  status: mysqlEnum("status", ["active", "expired", "revoked", "error"]).notNull().default("active"),
  lastSyncedAt: timestamp("lastSyncedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SocialAccount = typeof socialAccounts.$inferSelect;
export type InsertSocialAccount = typeof socialAccounts.$inferInsert;

// Activity Logs (Audit trail)
export const activityLogs = mysqlTable("activity_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  action: varchar("action", { length: 100 }).notNull(), // e.g., "press_release.created", "campaign.updated"
  entityType: varchar("entityType", { length: 50 }), // e.g., "press_release", "campaign"
  entityId: int("entityId"),
  description: text("description"),
  metadata: text("metadata"), // JSON string for additional context
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = typeof activityLogs.$inferInsert;

// Usage Tracking (Tier limits enforcement)
export const usageTracking = mysqlTable("usage_tracking", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  period: varchar("period", { length: 7 }).notNull(), // YYYY-MM format
  pressReleasesCreated: int("pressReleasesCreated").default(0).notNull(),
  socialPostsCreated: int("socialPostsCreated").default(0).notNull(),
  campaignsCreated: int("campaignsCreated").default(0).notNull(),
  distributionsSent: int("distributionsSent").default(0).notNull(),
  aiImagesGenerated: int("aiImagesGenerated").default(0).notNull(),
  aiChatMessages: int("aiChatMessages").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UsageTracking = typeof usageTracking.$inferSelect;
export type InsertUsageTracking = typeof usageTracking.$inferInsert;

// Notification Preferences
export const notificationPreferences = mysqlTable("notification_preferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  emailNotifications: int("emailNotifications").default(1).notNull(), // Boolean as int
  pressReleaseNotifications: int("pressReleaseNotifications").default(1).notNull(),
  campaignNotifications: int("campaignNotifications").default(1).notNull(),
  socialMediaNotifications: int("socialMediaNotifications").default(1).notNull(),
  weeklyDigest: int("weeklyDigest").default(1).notNull(),
  marketingEmails: int("marketingEmails").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NotificationPreferences = typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreferences = typeof notificationPreferences.$inferInsert;
