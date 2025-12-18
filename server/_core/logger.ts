/**
 * Structured Logging System for upsurgeIQ
 * 
 * Provides consistent logging with timestamps, context, and severity levels.
 * Logs are stored in the database for admin review and debugging.
 */

import { getDb } from "../db";
import { errorLogs } from "../../drizzle/schema";

export type LogLevel = "info" | "warn" | "error" | "debug";

export interface LogContext {
  userId?: number;
  requestId?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: Error;
  timestamp: Date;
}

/**
 * Core logging function that writes to both console and database
 */
async function log(entry: LogEntry): Promise<void> {
  const { level, message, context, error, timestamp } = entry;

  // Format for console output
  const timeStr = timestamp.toISOString();
  const contextStr = context ? ` [${JSON.stringify(context)}]` : "";
  const errorStr = error ? `\n${error.stack || error.message}` : "";
  
  const logMessage = `[${timeStr}] [${level.toUpperCase()}] ${message}${contextStr}${errorStr}`;

  // Console output with appropriate method
  switch (level) {
    case "error":
      console.error(logMessage);
      break;
    case "warn":
      console.warn(logMessage);
      break;
    case "debug":
      if (process.env.NODE_ENV === "development") {
        console.debug(logMessage);
      }
      break;
    default:
      console.log(logMessage);
  }

  // Store in database (async, don't block)
  storeLogInDatabase(entry).catch((err) => {
    console.error("[Logger] Failed to store log in database:", err);
  });
}

/**
 * Store log entry in database for admin review
 */
async function storeLogInDatabase(entry: LogEntry): Promise<void> {
  try {
    const db = await getDb();
    if (!db) return;

    await db.insert(errorLogs).values({
      level: entry.level,
      message: entry.message,
      userId: entry.context?.userId,
      component: entry.context?.component,
      action: entry.context?.action,
      errorStack: entry.error?.stack,
      metadata: entry.context?.metadata ? JSON.stringify(entry.context.metadata) : null,
      createdAt: entry.timestamp,
    });
  } catch (err) {
    // Don't throw - logging should never crash the app
    console.error("[Logger] Database storage failed:", err);
  }
}

/**
 * Logger class with convenience methods
 */
export class Logger {
  private component: string;

  constructor(component: string) {
    this.component = component;
  }

  private createEntry(
    level: LogLevel,
    message: string,
    context?: Partial<LogContext>,
    error?: Error
  ): LogEntry {
    return {
      level,
      message,
      context: {
        component: this.component,
        ...context,
      },
      error,
      timestamp: new Date(),
    };
  }

  info(message: string, context?: Partial<LogContext>): void {
    log(this.createEntry("info", message, context));
  }

  warn(message: string, context?: Partial<LogContext>): void {
    log(this.createEntry("warn", message, context));
  }

  error(message: string, error?: Error, context?: Partial<LogContext>): void {
    log(this.createEntry("error", message, context, error));
  }

  debug(message: string, context?: Partial<LogContext>): void {
    log(this.createEntry("debug", message, context));
  }
}

/**
 * Create a logger instance for a specific component
 */
export function createLogger(component: string): Logger {
  return new Logger(component);
}

/**
 * Global logger for general use
 */
export const logger = new Logger("System");
