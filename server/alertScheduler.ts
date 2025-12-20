import cron, { ScheduledTask } from "node-cron";
import { checkCreditAlerts } from "./costAlertChecker";

let scheduledTask: ScheduledTask | null = null;

/**
 * Initialize the credit alert scheduler
 * Runs checkCreditAlerts() every hour at the top of the hour
 */
export function initializeAlertScheduler() {
  // Prevent multiple schedulers from running
  if (scheduledTask) {
    console.log("[AlertScheduler] Scheduler already running");
    return;
  }

  // Run every hour at minute 0 (e.g., 1:00, 2:00, 3:00, etc.)
  scheduledTask = cron.schedule("0 * * * *", async () => {
    const timestamp = new Date().toISOString();
    console.log(`[AlertScheduler] Running scheduled credit alert check at ${timestamp}`);
    
    try {
      await checkCreditAlerts();
      console.log(`[AlertScheduler] Credit alert check completed successfully at ${timestamp}`);
    } catch (error) {
      console.error(`[AlertScheduler] Error during scheduled alert check:`, error);
    }
  });

  console.log("[AlertScheduler] Credit alert scheduler initialized - running every hour");
  
  // Also run an initial check on startup (after a 30 second delay to allow system to stabilize)
  setTimeout(async () => {
    console.log("[AlertScheduler] Running initial credit alert check");
    try {
      await checkCreditAlerts();
      console.log("[AlertScheduler] Initial credit alert check completed");
    } catch (error) {
      console.error("[AlertScheduler] Error during initial alert check:", error);
    }
  }, 30000); // 30 seconds
}

/**
 * Stop the alert scheduler
 * Useful for graceful shutdown or testing
 */
export function stopAlertScheduler() {
  if (scheduledTask) {
    scheduledTask.stop();
    scheduledTask = null;
    console.log("[AlertScheduler] Credit alert scheduler stopped");
  }
}

/**
 * Get scheduler status
 */
export function getSchedulerStatus() {
  return {
    isRunning: scheduledTask !== null,
    schedule: "Every hour at minute 0",
  };
}
