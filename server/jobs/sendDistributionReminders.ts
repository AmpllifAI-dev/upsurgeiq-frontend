import cron from "node-cron";
import { checkAndSendReminders, cleanupOldSaves } from "../distributionSaveForLater";

/**
 * Scheduled job to send distribution reminders
 * Runs every hour to check for distributions that need reminders
 */
export function startDistributionReminderJob() {
  // Run every hour
  cron.schedule("0 * * * *", async () => {
    console.log("[Job] Checking for distribution reminders...");
    try {
      await checkAndSendReminders();
      console.log("[Job] Distribution reminders checked successfully");
    } catch (error) {
      console.error("[Job] Error sending distribution reminders:", error);
    }
  });

  // Cleanup old saves daily at 3 AM
  cron.schedule("0 3 * * *", async () => {
    console.log("[Job] Cleaning up old distribution saves...");
    try {
      await cleanupOldSaves();
      console.log("[Job] Old distribution saves cleaned up successfully");
    } catch (error) {
      console.error("[Job] Error cleaning up old saves:", error);
    }
  });

  console.log("[Job] Distribution reminder job started");
}
