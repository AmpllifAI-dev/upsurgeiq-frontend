import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

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

// TODO: Add your tables here
// Media List Categories (Genre/Geography/Industry)
export const mediaListCategories = mysqlTable("media_list_categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["genre", "geography", "industry"]).notNull(),
  description: text("description"),
  isPopulated: boolean("is_populated").default(false).notNull(),
  generatedAt: timestamp("generated_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Journalist Contacts
export const journalistContacts = mysqlTable("journalist_contacts", {
  id: int("id").autoincrement().primaryKey(),
  mediaListId: int("media_list_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  publication: varchar("publication", { length: 255 }).notNull(),
  beat: varchar("beat", { length: 255 }),
  region: varchar("region", { length: 255 }),
  industry: varchar("industry", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  twitter: varchar("twitter", { length: 255 }),
  linkedin: varchar("linkedin", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Media List Generation Requests
export const mediaListGenerationRequests = mysqlTable("media_list_generation_requests", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  categoryId: int("category_id").notNull(),
  categoryName: varchar("category_name", { length: 255 }).notNull(),
  categoryType: mysqlEnum("category_type", ["genre", "geography", "industry"]).notNull(),
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending").notNull(),
  contactsGenerated: int("contacts_generated").default(0),
  errorMessage: text("error_message"),
  requestedAt: timestamp("requested_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

// Media List Credits
export const mediaListCredits = mysqlTable("media_list_credits", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().unique(),
  credits: int("credits").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Media List Credit Transactions
export const mediaListCreditTransactions = mysqlTable("media_list_credit_transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  amount: int("amount").notNull(),
  type: mysqlEnum("type", ["purchase", "deduction", "refund"]).notNull(),
  description: varchar("description", { length: 255 }),
  stripeSessionId: varchar("stripe_session_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Distribution Saves (Save for Later)
export const distributionSaves = mysqlTable("distribution_saves", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  pressReleaseId: int("press_release_id").notNull(),
  mediaListIds: text("media_list_ids").notNull(), // JSON array of list IDs
  scheduledFor: timestamp("scheduled_for"),
  reminderSent: boolean("reminder_sent").default(false).notNull(),
  completed: boolean("completed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export type MediaListCategory = typeof mediaListCategories.$inferSelect;
export type InsertMediaListCategory = typeof mediaListCategories.$inferInsert;

export type JournalistContact = typeof journalistContacts.$inferSelect;
export type InsertJournalistContact = typeof journalistContacts.$inferInsert;

export type MediaListGenerationRequest = typeof mediaListGenerationRequests.$inferSelect;
export type InsertMediaListGenerationRequest = typeof mediaListGenerationRequests.$inferInsert;

export type MediaListCredit = typeof mediaListCredits.$inferSelect;
export type InsertMediaListCredit = typeof mediaListCredits.$inferInsert;

export type MediaListCreditTransaction = typeof mediaListCreditTransactions.$inferSelect;
export type InsertMediaListCreditTransaction = typeof mediaListCreditTransactions.$inferInsert;

export type DistributionSave = typeof distributionSaves.$inferSelect;
export type InsertDistributionSave = typeof distributionSaves.$inferInsert;
