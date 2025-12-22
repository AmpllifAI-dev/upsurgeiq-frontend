import { checkAllUsersUsageThresholds } from "../usageNotifications";

/**
 * Daily job to check usage thresholds for all users
 * This runs once per day to notify the owner when users approach their limits
 */
export async function runUsageNotificationsJob() {
  console.log("[UsageNotificationsJob] Starting daily usage check");
  
  try {
    await checkAllUsersUsageThresholds();
    console.log("[UsageNotificationsJob] Completed successfully");
  } catch (error) {
    console.error("[UsageNotificationsJob] Error:", error);
  }
}

// Schedule to run daily at 9 AM
const SCHEDULE_HOUR = 9;
const SCHEDULE_MINUTE = 0;

function scheduleNextRun() {
  const now = new Date();
  const next = new Date();
  
  next.setHours(SCHEDULE_HOUR, SCHEDULE_MINUTE, 0, 0);
  
  // If the scheduled time has already passed today, schedule for tomorrow
  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }
  
  const msUntilNext = next.getTime() - now.getTime();
  
  console.log(`[UsageNotificationsJob] Next run scheduled for ${next.toISOString()}`);
  
  setTimeout(() => {
    runUsageNotificationsJob();
    scheduleNextRun(); // Schedule the next run after this one completes
  }, msUntilNext);
}

// Start the scheduler
scheduleNextRun();
