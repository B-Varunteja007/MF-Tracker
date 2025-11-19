// src/services/scheduler.js
import cron from "node-cron";
import { sendDailyNavReport } from "./notificationService.js";

export function startScheduler() {
  // 9:30 AM IST => 4:00 UTC
  cron.schedule("0 4 * * *", async () => {
    console.log("⏳ Running scheduled notifications: 9:30 AM IST");
    await sendDailyNavReport();
  });

  // 9:30 PM IST => 16:00 UTC
  cron.schedule("0 16 * * *", async () => {
    console.log("⏳ Running scheduled notifications: 9:30 PM IST");
    await sendDailyNavReport();
  });

  console.log("Scheduler started for notifications at 9:30 AM & 9:30 PM IST");
}
