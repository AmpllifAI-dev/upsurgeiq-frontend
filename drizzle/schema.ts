import { date, decimal, int, json, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

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
  preferredLanguage: varchar("preferredLanguage", { length: 10 }).default("en-GB"),
  // White label branding
  whiteLabelEnabled: int("whiteLabelEnabled").default(0),
  whiteLabelLogoUrl: varchar("whiteLabelLogoUrl", { length: 500 }),
  whiteLabelPrimaryColor: varchar("whiteLabelPrimaryColor", { length: 7 }), // Hex color #RRGGBB
  whiteLabelSecondaryColor: varchar("whiteLabelSecondaryColor", { length: 7 }),
  whiteLabelCompanyName: varchar("whiteLabelCompanyName", { length: 255 }),
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

// Sports Teams (all sports - football, basketball, motorsport, rugby, etc.)
export const sportsTeams = mysqlTable("sports_teams", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("businessId").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  teamName: varchar("teamName", { length: 255 }).notNull(),
  sport: varchar("sport", { length: 100 }).notNull(), // football, basketball, motorsport, rugby, etc.
  league: varchar("league", { length: 255 }), // Premier League, NBA, F1, etc. (renamed from series)
  division: varchar("division", { length: 255 }), // Conference, tier, division
  location: varchar("location", { length: 255 }), // City, country
  founded: int("founded"), // Year founded
  stadium: varchar("stadium", { length: 255 }), // Home venue
  website: varchar("website", { length: 500 }),
  logo: varchar("logo", { length: 500 }), // URL to logo image
  primaryColor: varchar("primaryColor", { length: 50 }), // Hex color
  secondaryColor: varchar("secondaryColor", { length: 50 }), // Hex color
  description: text("description"),
  achievements: json("achievements"), // Array of {year, title}
  socialMedia: json("socialMedia"), // {twitter, instagram, facebook}
  schedule: text("schedule"), // Keep for backward compatibility
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
  distributionType: mysqlEnum("distributionType", ["ai_assisted", "manual"]).default("ai_assisted").notNull(),
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
  targetAudience: text("targetAudience"),
  status: mysqlEnum("status", ["draft", "planning", "active", "paused", "completed", "archived"]).default("draft").notNull(),
  platforms: varchar("platforms", { length: 255 }),
  budget: decimal("budget", { precision: 10, scale: 2 }),
  startDate: date("startDate"),
  endDate: date("endDate"),
  aiGeneratedStrategy: text("aiGeneratedStrategy"),
  keyMessages: text("keyMessages"),
  successMetrics: text("successMetrics"),
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
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  emailNotifications: int("emailNotifications").default(1).notNull(), // Boolean as int
  pressReleaseNotifications: int("pressReleaseNotifications").default(1).notNull(),
  campaignNotifications: int("campaignNotifications").default(1).notNull(),
  socialMediaNotifications: int("socialMediaNotifications").default(1).notNull(),
  weeklyDigest: int("weeklyDigest").default(1).notNull(),
  marketingEmails: int("marketingEmails").default(0).notNull(),
  
  // Usage limit notifications
  usageLimitAlertsEnabled: int("usageLimitAlertsEnabled").default(1).notNull(),
  usageLimitThreshold: int("usageLimitThreshold").default(80).notNull(), // Percentage (0-100)
  
  // Scheduled publish notifications
  scheduledPublishAlertsEnabled: int("scheduledPublishAlertsEnabled").default(1).notNull(),
  scheduledPublishAdvanceNotice: int("scheduledPublishAdvanceNotice").default(60).notNull(), // Minutes before publish
  
  // Campaign milestone notifications
  campaignMilestoneAlertsEnabled: int("campaignMilestoneAlertsEnabled").default(1).notNull(),
  
  // Weekly summary reports
  weeklySummaryEnabled: int("weeklySummaryEnabled").default(1).notNull(),
  weeklySummaryDay: mysqlEnum("weeklySummaryDay", ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]).default("monday").notNull(),
  
  // Monthly analytics reports
  monthlyAnalyticsEnabled: int("monthlyAnalyticsEnabled").default(1).notNull(),
  
  // Distribution success/failure notifications
  distributionAlertsEnabled: int("distributionAlertsEnabled").default(1).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NotificationPreferences = typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreferences = typeof notificationPreferences.$inferInsert;

// Email Templates
export const emailTemplates = mysqlTable("email_templates", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("businessId").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 500 }),
  headerHtml: text("headerHtml"), // Custom header HTML
  footerHtml: text("footerHtml"), // Custom footer HTML
  primaryColor: varchar("primaryColor", { length: 7 }).default("#008080"), // Hex color
  secondaryColor: varchar("secondaryColor", { length: 7 }).default("#7FFF00"), // Hex color
  logoUrl: varchar("logoUrl", { length: 500 }),
  isDefault: int("isDefault").default(0).notNull(), // Boolean as int
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type InsertEmailTemplate = typeof emailTemplates.$inferInsert;

// Press Release Templates
export const pressReleaseTemplates = mysqlTable("press_release_templates", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }), // e.g., "Product Launch", "Company News", "Event Announcement"
  description: text("description"),
  titleTemplate: varchar("titleTemplate", { length: 500 }),
  subtitleTemplate: varchar("subtitleTemplate", { length: 500 }),
  bodyTemplate: text("bodyTemplate"),
  isDefault: int("isDefault").default(1).notNull(), // Boolean as int
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PressReleaseTemplate = typeof pressReleaseTemplates.$inferSelect;
export type InsertPressReleaseTemplate = typeof pressReleaseTemplates.$inferInsert;

// Team Members
export const teamMembers = mysqlTable("team_members", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("businessId").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 50 }).notNull().default("viewer"), // admin, editor, viewer
  status: varchar("status", { length: 50 }).notNull().default("active"), // active, suspended
  invitedBy: int("invitedBy").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = typeof teamMembers.$inferInsert;

// Team Invitations
export const teamInvitations = mysqlTable("team_invitations", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("businessId").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  email: varchar("email", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default("viewer"),
  token: varchar("token", { length: 255 }).notNull().unique(),
  invitedBy: int("invitedBy").notNull().references(() => users.id),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, accepted, expired, revoked
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TeamInvitation = typeof teamInvitations.$inferSelect;
export type InsertTeamInvitation = typeof teamInvitations.$inferInsert;

// Saved Filters
export const savedFilters = mysqlTable("saved_filters", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  entityType: varchar("entityType", { length: 50 }).notNull(), // press_release, campaign, media_list
  filterData: json("filterData").notNull(), // JSON object with filter criteria
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SavedFilter = typeof savedFilters.$inferSelect;
export type InsertSavedFilter = typeof savedFilters.$inferInsert;

// Approval Requests
export const approvalRequests = mysqlTable("approval_requests", {
  id: int("id").autoincrement().primaryKey(),
  pressReleaseId: int("pressReleaseId").notNull().references(() => pressReleases.id, { onDelete: "cascade" }),
  requesterId: int("requesterId").notNull().references(() => users.id),
  approverId: int("approverId").references(() => users.id),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, approved, rejected
  requestMessage: text("requestMessage"),
  responseMessage: text("responseMessage"),
  requestedAt: timestamp("requestedAt").defaultNow().notNull(),
  respondedAt: timestamp("respondedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ApprovalRequest = typeof approvalRequests.$inferSelect;
export type InsertApprovalRequest = typeof approvalRequests.$inferInsert;

// Approval Comments
export const approvalComments = mysqlTable("approval_comments", {
  id: int("id").autoincrement().primaryKey(),
  approvalRequestId: int("approvalRequestId").notNull().references(() => approvalRequests.id, { onDelete: "cascade" }),
  userId: int("userId").notNull().references(() => users.id),
  comment: text("comment").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ApprovalComment = typeof approvalComments.$inferSelect;
export type InsertApprovalComment = typeof approvalComments.$inferInsert;

// Content Versions
export const contentVersions = mysqlTable("content_versions", {
  id: int("id").autoincrement().primaryKey(),
  pressReleaseId: int("pressReleaseId").notNull().references(() => pressReleases.id, { onDelete: "cascade" }),
  versionNumber: int("versionNumber").notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  subtitle: varchar("subtitle", { length: 500 }),
  content: text("content").notNull(),
  userId: int("userId").notNull().references(() => users.id),
  changeDescription: text("changeDescription"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ContentVersion = typeof contentVersions.$inferSelect;
export type InsertContentVersion = typeof contentVersions.$inferInsert;

// Webhook Configurations (for Make.com / Airtable integration)
export const webhookConfigs = mysqlTable("webhook_configs", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(), // e.g., "User Registration", "Onboarding Complete"
  eventType: mysqlEnum("eventType", ["user.registered", "user.onboarded", "social_media.post_created"]).notNull(),
  webhookUrl: varchar("webhookUrl", { length: 1000 }).notNull(), // Make.com webhook URL
  isActive: int("isActive").default(1).notNull(), // 1 = active, 0 = disabled
  retryAttempts: int("retryAttempts").default(3).notNull(), // Number of retry attempts
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WebhookConfig = typeof webhookConfigs.$inferSelect;
export type InsertWebhookConfig = typeof webhookConfigs.$inferInsert;

// Webhook Delivery Logs
export const webhookDeliveryLogs = mysqlTable("webhook_delivery_logs", {
  id: int("id").autoincrement().primaryKey(),
  webhookConfigId: int("webhookConfigId").notNull().references(() => webhookConfigs.id, { onDelete: "cascade" }),
  eventType: varchar("eventType", { length: 50 }).notNull(),
  payload: text("payload").notNull(), // JSON string of the webhook payload
  success: int("success").notNull(), // 1 = success, 0 = failure
  statusCode: int("statusCode"), // HTTP status code from webhook endpoint
  errorMessage: text("errorMessage"), // Error message if delivery failed
  attempts: int("attempts").default(1).notNull(), // Number of delivery attempts made
  deliveredAt: timestamp("deliveredAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WebhookDeliveryLog = typeof webhookDeliveryLogs.$inferSelect;
export type InsertWebhookDeliveryLog = typeof webhookDeliveryLogs.$inferInsert;

// ========================================
// JOURNALIST MEDIA LIST MANAGEMENT
// ========================================

// Media Outlets
export const mediaOutlets = mysqlTable("media_outlets", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  website: varchar("website", { length: 500 }),
  type: mysqlEnum("type", ["newspaper", "magazine", "online", "tv", "radio", "podcast", "blog"]).notNull(),
  reach: mysqlEnum("reach", ["local", "regional", "national", "international"]),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MediaOutlet = typeof mediaOutlets.$inferSelect;
export type InsertMediaOutlet = typeof mediaOutlets.$inferInsert;

// Journalist Beats/Topics
export const journalistBeats = mysqlTable("journalist_beats", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type JournalistBeat = typeof journalistBeats.$inferSelect;
export type InsertJournalistBeat = typeof journalistBeats.$inferInsert;

// Journalists
export const journalists = mysqlTable("journalists", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  firstName: varchar("firstName", { length: 100 }).notNull(),
  lastName: varchar("lastName", { length: 100 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  title: varchar("title", { length: 255 }), // e.g., "Senior Technology Reporter"
  mediaOutletId: int("mediaOutletId").references(() => mediaOutlets.id, { onDelete: "set null" }),
  twitter: varchar("twitter", { length: 100 }),
  linkedin: varchar("linkedin", { length: 255 }),
  website: varchar("website", { length: 500 }),
  bio: text("bio"),
  notes: text("notes"), // Internal notes about the journalist
  status: mysqlEnum("status", ["active", "inactive", "bounced"]).default("active").notNull(),
  lastContactedAt: timestamp("lastContactedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Journalist = typeof journalists.$inferSelect;
export type InsertJournalist = typeof journalists.$inferInsert;

// Junction table: Journalists to Beats (many-to-many)
export const journalistBeatRelations = mysqlTable("journalist_beat_relations", {
  id: int("id").autoincrement().primaryKey(),
  journalistId: int("journalistId").notNull().references(() => journalists.id, { onDelete: "cascade" }),
  beatId: int("beatId").notNull().references(() => journalistBeats.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Journalist Tags (for custom segmentation)
export const journalistTags = mysqlTable("journalist_tags", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  color: varchar("color", { length: 7 }).default("#3b82f6"), // Hex color code
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type JournalistTag = typeof journalistTags.$inferSelect;
export type InsertJournalistTag = typeof journalistTags.$inferInsert;

// Junction table: Journalists to Tags (many-to-many)
export const journalistTagRelations = mysqlTable("journalist_tag_relations", {
  id: int("id").autoincrement().primaryKey(),
  journalistId: int("journalistId").notNull().references(() => journalists.id, { onDelete: "cascade" }),
  tagId: int("tagId").notNull().references(() => journalistTags.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Outreach History
export const journalistOutreach = mysqlTable("journalist_outreach", {
  id: int("id").autoincrement().primaryKey(),
  journalistId: int("journalistId").notNull().references(() => journalists.id, { onDelete: "cascade" }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: mysqlEnum("type", ["email", "phone", "social", "meeting"]).notNull(),
  subject: varchar("subject", { length: 500 }),
  message: text("message"),
  status: mysqlEnum("status", ["sent", "opened", "replied", "bounced", "no_response"]).default("sent").notNull(),
  sentAt: timestamp("sentAt").notNull(),
  openedAt: timestamp("openedAt"),
  repliedAt: timestamp("repliedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type JournalistOutreach = typeof journalistOutreach.$inferSelect;
export type InsertJournalistOutreach = typeof journalistOutreach.$inferInsert;

// ========================================
// INTELLIGENT CAMPAIGN LAB - Campaign Milestones
// ========================================

export const campaignMilestones = mysqlTable("campaign_milestones", {
  id: int("id").autoincrement().primaryKey(),
  campaignId: int("campaignId").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  dueDate: timestamp("dueDate"),
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "blocked"]).default("pending").notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CampaignMilestone = typeof campaignMilestones.$inferSelect;
export type InsertCampaignMilestone = typeof campaignMilestones.$inferInsert;

// Campaign Deliverables
export const campaignDeliverables = mysqlTable("campaign_deliverables", {
  id: int("id").autoincrement().primaryKey(),
  campaignId: int("campaignId").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
  milestoneId: int("milestoneId").references(() => campaignMilestones.id, { onDelete: "set null" }),
  title: varchar("title", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["press_release", "social_post", "email", "blog_post", "video", "infographic", "other"]).notNull(),
  status: mysqlEnum("status", ["draft", "in_review", "approved", "published"]).default("draft").notNull(),
  contentId: int("contentId"), // References press_releases.id or social_media_posts.id
  dueDate: timestamp("dueDate"),
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CampaignDeliverable = typeof campaignDeliverables.$inferSelect;
export type InsertCampaignDeliverable = typeof campaignDeliverables.$inferInsert;

// Campaign Analytics
export const campaignAnalytics = mysqlTable("campaign_analytics", {
  id: int("id").autoincrement().primaryKey(),
  campaignId: int("campaignId").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
  date: timestamp("date").notNull(),
  impressions: int("impressions").default(0),
  clicks: int("clicks").default(0),
  engagements: int("engagements").default(0),
  conversions: int("conversions").default(0),
  spend: int("spend").default(0), // In cents
  reach: int("reach").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CampaignAnalytics = typeof campaignAnalytics.$inferSelect;
export type InsertCampaignAnalytics = typeof campaignAnalytics.$inferInsert;

// Campaign Templates
export const campaignTemplates = mysqlTable("campaign_templates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id, { onDelete: "cascade" }), // null for system templates
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }), // e.g., "Product Launch", "Brand Awareness", "Lead Generation"
  goal: text("goal"),
  targetAudience: text("targetAudience"),
  platforms: varchar("platforms", { length: 255 }),
  suggestedBudget: decimal("suggestedBudget", { precision: 10, scale: 2 }),
  suggestedDuration: int("suggestedDuration"), // in days
  strategy: text("strategy"),
  keyMessages: text("keyMessages"),
  successMetrics: text("successMetrics"),
  milestones: text("milestones"), // JSON array of milestone templates
  deliverables: text("deliverables"), // JSON array of deliverable templates
  isPublic: int("isPublic").default(0), // 0 = private, 1 = public (system templates)
  usageCount: int("usageCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CampaignTemplate = typeof campaignTemplates.$inferSelect;
export type InsertCampaignTemplate = typeof campaignTemplates.$inferInsert;

// Campaign Team Members (campaign-specific permissions)
export const campaignTeamMembers = mysqlTable("campaign_team_members", {
  id: int("id").autoincrement().primaryKey(),
  campaignId: int("campaignId").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: mysqlEnum("role", ["owner", "editor", "viewer"]).default("viewer").notNull(),
  addedBy: int("addedBy").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CampaignTeamMember = typeof campaignTeamMembers.$inferSelect;
export type InsertCampaignTeamMember = typeof campaignTeamMembers.$inferInsert;

// Campaign Activity Log
export const campaignActivityLog = mysqlTable("campaign_activity_log", {
  id: int("id").autoincrement().primaryKey(),
  campaignId: int("campaignId").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  action: varchar("action", { length: 100 }).notNull(), // e.g., "created_campaign", "updated_milestone", "added_deliverable"
  entityType: varchar("entityType", { length: 50 }), // e.g., "campaign", "milestone", "deliverable"
  entityId: int("entityId"), // ID of the affected entity
  changes: text("changes"), // JSON string of what changed
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CampaignActivityLog = typeof campaignActivityLog.$inferSelect;
export type InsertCampaignActivityLog = typeof campaignActivityLog.$inferInsert;

// Admin Credit Usage Tracking (Manus credit consumption monitoring)
export const creditUsage = mysqlTable("credit_usage", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  featureType: mysqlEnum("featureType", [
    "press_release_generation",
    "campaign_strategy_generation",
    "ai_chat",
    "image_generation",
    "voice_transcription",
    "content_analysis",
    "other"
  ]).notNull(),
  creditsUsed: decimal("creditsUsed", { precision: 10, scale: 4 }).notNull(), // Precise credit tracking
  tokensUsed: int("tokensUsed"), // For LLM calls, track token count
  metadata: json("metadata"), // Store additional context (model used, request details, etc.)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CreditUsage = typeof creditUsage.$inferSelect;
export type InsertCreditUsage = typeof creditUsage.$inferInsert;

// Cost Alert Thresholds (Admin-configured credit usage alerts)
export const creditAlertThresholds = mysqlTable("credit_alert_thresholds", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(), // e.g., "Daily Limit", "Monthly Budget"
  thresholdType: mysqlEnum("thresholdType", ["daily", "weekly", "monthly", "total"]).notNull(),
  thresholdValue: decimal("thresholdValue", { precision: 10, scale: 2 }).notNull(), // Credit limit
  isActive: int("isActive").default(1).notNull(), // 1 = active, 0 = disabled
  notifyEmails: text("notifyEmails").notNull(), // Comma-separated email addresses
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CreditAlertThreshold = typeof creditAlertThresholds.$inferSelect;
export type InsertCreditAlertThreshold = typeof creditAlertThresholds.$inferInsert;

// Cost Alert History (Track when alerts were triggered)
export const creditAlertHistory = mysqlTable("credit_alert_history", {
  id: int("id").autoincrement().primaryKey(),
  thresholdId: int("thresholdId").notNull().references(() => creditAlertThresholds.id, { onDelete: "cascade" }),
  triggeredAt: timestamp("triggeredAt").defaultNow().notNull(),
  creditsUsed: decimal("creditsUsed", { precision: 10, scale: 4 }).notNull(), // Credits at time of alert
  thresholdValue: decimal("thresholdValue", { precision: 10, scale: 2 }).notNull(), // Threshold that was breached
  emailSent: int("emailSent").default(0).notNull(), // 1 = sent, 0 = failed
  metadata: json("metadata"), // Additional context
});

export type CreditAlertHistory = typeof creditAlertHistory.$inferSelect;
export type InsertCreditAlertHistory = typeof creditAlertHistory.$inferInsert;

// ========================================

// Word Count Credits (Add-on purchases for extended press releases)
export const wordCountCredits = mysqlTable("word_count_credits", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  wordsRemaining: int("wordsRemaining").notNull().default(0), // Words available
  purchaseDate: timestamp("purchaseDate").defaultNow().notNull(),
  expiryDate: timestamp("expiryDate"), // Optional: credits expire after 12 months
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }), // Link to Stripe payment
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WordCountCredit = typeof wordCountCredits.$inferSelect;
export type InsertWordCountCredit = typeof wordCountCredits.$inferInsert;

// Image Credits (Add-on purchases for additional AI images)
export const imageCredits = mysqlTable("image_credits", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  creditsRemaining: int("creditsRemaining").notNull().default(0), // Images available
  purchaseDate: timestamp("purchaseDate").defaultNow().notNull(),
  expiryDate: timestamp("expiryDate"), // Optional: credits expire after 12 months
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }), // Link to Stripe payment
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ImageCredit = typeof imageCredits.$inferSelect;
export type InsertImageCredit = typeof imageCredits.$inferInsert;

// ========================================


// Website Research (AI-powered company analysis)
export const websiteResearch = mysqlTable("website_research", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  businessId: int("businessId").references(() => businesses.id, { onDelete: "cascade" }),
  url: varchar("url", { length: 500 }).notNull(),
  companyName: varchar("companyName", { length: 255 }),
  industry: varchar("industry", { length: 255 }),
  description: text("description"),
  products: json("products"), // Array of strings
  recentNews: json("recentNews"), // Array of strings
  keyPeople: json("keyPeople"), // Array of {name, role}
  contactInfo: json("contactInfo"), // {email, phone, address}
  socialMedia: json("socialMedia"), // {twitter, linkedin, facebook}
  competitors: json("competitors"), // Array of strings
  keyMessages: json("keyMessages"), // Array of strings
  brandTone: varchar("brandTone", { length: 255 }),
  targetAudience: text("targetAudience"),
  rawContent: text("rawContent"), // First 5000 chars of website
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WebsiteResearch = typeof websiteResearch.$inferSelect;
export type InsertWebsiteResearch = typeof websiteResearch.$inferInsert;

// Scheduled Press Releases
export const scheduledPressReleases = mysqlTable("scheduled_press_releases", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  businessId: int("businessId").references(() => businesses.id, { onDelete: "cascade" }),
  pressReleaseId: int("pressReleaseId").references(() => pressReleases.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 500 }).notNull(),
  content: text("content").notNull(),
  scheduledDate: timestamp("scheduledDate").notNull(),
  timezone: varchar("timezone", { length: 100 }).default("UTC"),
  status: mysqlEnum("status", ["pending", "sent", "failed", "canceled"]).default("pending"),
  distributionLists: json("distributionLists"), // Array of media list IDs
  socialMediaPosts: json("socialMediaPosts"), // Array of platform-specific posts
  sentAt: timestamp("sentAt"),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ScheduledPressRelease = typeof scheduledPressReleases.$inferSelect;
export type InsertScheduledPressRelease = typeof scheduledPressReleases.$inferInsert;

// ========================================

// Social Media Connections
export const socialConnections = mysqlTable("social_connections", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  platform: mysqlEnum("platform", ["facebook", "instagram", "linkedin", "x"]).notNull(),
  platformUserId: varchar("platformUserId", { length: 255 }).notNull(),
  platformUsername: varchar("platformUsername", { length: 255 }),
  accessToken: text("accessToken").notNull(),
  refreshToken: text("refreshToken"),
  tokenExpiresAt: timestamp("tokenExpiresAt"),
  profilePictureUrl: text("profilePictureUrl"),
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SocialConnection = typeof socialConnections.$inferSelect;
export type InsertSocialConnection = typeof socialConnections.$inferInsert;


// Business Dossier - Comprehensive client intelligence
export const businessDossiers = mysqlTable("business_dossiers", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Basic Company Info
  companyName: varchar("companyName", { length: 255 }),
  website: varchar("website", { length: 500 }),
  industry: varchar("industry", { length: 255 }),
  sicCode: varchar("sicCode", { length: 50 }),
  
  // Business Details (from website analysis)
  businessDescription: text("businessDescription"),
  services: text("services"), // JSON array of services
  targetAudience: text("targetAudience"),
  uniqueSellingPoints: text("uniqueSellingPoints"), // JSON array
  competitors: text("competitors"), // JSON array of competitor names/URLs
  
  // Brand & Messaging
  brandVoice: text("brandVoice"), // e.g., "professional", "casual", "technical"
  brandTone: text("brandTone"), // e.g., "friendly", "authoritative", "innovative"
  keyMessages: text("keyMessages"), // JSON array of key talking points
  
  // Team & Contacts
  employees: text("employees"), // JSON array of {name, role, bio}
  primaryContact: varchar("primaryContact", { length: 255 }),
  contactEmail: varchar("contactEmail", { length: 255 }),
  contactPhone: varchar("contactPhone", { length  : 50 }),
  
  // Social & Sports (for motorsport clients)
  sportsTeamAffiliation: varchar("sportsTeamAffiliation", { length: 255 }),
  
  // Website Analysis Metadata
  websiteAnalyzedAt: timestamp("websiteAnalyzedAt"),
  websiteAnalysisData: text("websiteAnalysisData"), // JSON of raw analysis
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BusinessDossier = typeof businessDossiers.$inferSelect;
export type InsertBusinessDossier = typeof businessDossiers.$inferInsert;

// AI Conversation History - Memory for AI assistant
export const aiConversations = mysqlTable("ai_conversations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  dossierId: int("dossierId").references(() => businessDossiers.id, { onDelete: "cascade" }),
  
  // Conversation Type
  conversationType: mysqlEnum("conversationType", ["chat", "phone_call", "email"]).notNull(),
  
  // Message Content
  role: mysqlEnum("role", ["user", "assistant", "system"]).notNull(),
  content: text("content").notNull(),
  
  // Phone Call Specific
  callDuration: int("callDuration"), // seconds
  transcriptUrl: varchar("transcriptUrl", { length: 500 }), // S3 URL to full transcript
  
  // Metadata
  metadata: text("metadata"), // JSON for additional context
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AIConversation = typeof aiConversations.$inferSelect;
export type InsertAIConversation = typeof aiConversations.$inferInsert;


// Important Dates - Calendar monitoring for proactive notifications
export const importantDates = mysqlTable("important_dates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  dossierId: int("dossierId").references(() => businessDossiers.id, { onDelete: "cascade" }),
  
  // Event Details
  eventType: mysqlEnum("eventType", [
    "sports_event",
    "earnings_date",
    "company_milestone",
    "industry_event",
    "product_launch",
    "custom"
  ]).notNull(),
  
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  eventDate: timestamp("eventDate").notNull(),
  
  // Event-Specific Data
  location: varchar("location", { length: 255 }),
  sportsTeamId: int("sportsTeamId").references(() => sportsTeams.id, { onDelete: "set null" }),
  
  // External Data
  externalId: varchar("externalId", { length: 255 }), // ID from external API (e.g., race ID, earnings ID)
  externalSource: varchar("externalSource", { length: 100 }), // API source name
  
  // Notification Settings
  notifyDaysBefore: int("notifyDaysBefore").default(3), // Days before event to send notification
  notifyAfterEvent: int("notifyAfterEvent").default(1), // 1 = yes, 0 = no
  
  // Status
  isActive: int("isActive").default(1).notNull(),
  lastNotifiedAt: timestamp("lastNotifiedAt"),
  postEventNotifiedAt: timestamp("postEventNotifiedAt"),
  
  // Event Outcome (for post-event notifications)
  eventOutcome: text("eventOutcome"), // JSON with results, placement, scores, etc.
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ImportantDate = typeof importantDates.$inferSelect;
export type InsertImportantDate = typeof importantDates.$inferInsert;

// Event Notifications - Track sent notifications
export const eventNotifications = mysqlTable("event_notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  importantDateId: int("importantDateId").notNull().references(() => importantDates.id, { onDelete: "cascade" }),
  
  // Notification Details
  notificationType: mysqlEnum("notificationType", ["pre_event", "post_event"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  
  // AI-Generated Draft
  suggestedDraft: text("suggestedDraft"), // AI-generated press release draft
  
  // User Action
  userAction: mysqlEnum("userAction", ["pending", "accepted", "dismissed"]).default("pending").notNull(),
  actionedAt: timestamp("actionedAt"),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EventNotification = typeof eventNotifications.$inferSelect;
export type InsertEventNotification = typeof eventNotifications.$inferInsert;

// Add-on Subscriptions - Track user add-on purchases (AI Chat, AI Call-in, etc.)
export const addonSubscriptions = mysqlTable("addon_subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Add-on Details
  addonType: mysqlEnum("addonType", ["aiChat", "aiCallIn", "intelligentCampaignLab"]).notNull(),
  status: mysqlEnum("status", ["active", "canceled", "past_due"]).notNull(),
  
  // Stripe Details
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }).unique(),
  stripePriceId: varchar("stripePriceId", { length: 255 }),
  
  // Billing Period
  currentPeriodStart: timestamp("currentPeriodStart"),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  cancelAtPeriodEnd: int("cancelAtPeriodEnd").default(0),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AddonSubscription = typeof addonSubscriptions.$inferSelect;
export type InsertAddonSubscription = typeof addonSubscriptions.$inferInsert;

// AI Credits Usage - Track monthly usage for AI Chat and AI Call-in
export const aiCreditsUsage = mysqlTable("ai_credits_usage", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  addonType: mysqlEnum("addonType", ["aiChat", "aiCallIn"]).notNull(),
  
  // Usage Period
  periodStart: timestamp("periodStart").notNull(),
  periodEnd: timestamp("periodEnd").notNull(),
  
  // Usage Tracking
  creditsTotal: int("creditsTotal").notNull(), // Total credits for the period (e.g., 32)
  creditsUsed: int("creditsUsed").default(0).notNull(), // Credits consumed
  creditsRemaining: int("creditsRemaining").notNull(), // Calculated: total - used
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AiCreditsUsage = typeof aiCreditsUsage.$inferSelect;
export type InsertAiCreditsUsage = typeof aiCreditsUsage.$inferInsert;

// AI Usage Log - Detailed log of each AI interaction
export const aiUsageLog = mysqlTable("ai_usage_log", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  addonType: mysqlEnum("addonType", ["aiChat", "aiCallIn"]).notNull(),
  
  // Usage Details
  action: varchar("action", { length: 100 }).notNull(), // e.g., "chat_message", "voice_call"
  creditsConsumed: int("creditsConsumed").default(1).notNull(),
  
  // Context
  metadata: text("metadata"), // JSON with additional context
  
  // Timestamp
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AiUsageLog = typeof aiUsageLog.$inferSelect;
export type InsertAiUsageLog = typeof aiUsageLog.$inferInsert;

