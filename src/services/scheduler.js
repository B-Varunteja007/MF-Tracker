// // src/services/scheduler.js
// import cron from "node-cron";
// import { sendDailyNavReport } from "./notificationService.js";

// export function startScheduler() {
//   // 9:30 AM IST => 4:00 UTC
//   cron.schedule("0 4 * * *", async () => {
//     console.log("⏳ Running scheduled notifications: 9:30 AM IST");
//     await sendDailyNavReport();
//   });

//   // 9:30 PM IST => 16:00 UTC
//   cron.schedule("0 16 * * *", async () => {
//     console.log("⏳ Running scheduled notifications: 9:30 PM IST");
//     await sendDailyNavReport();
//   });

//   console.log("Scheduler started for notifications at 9:30 AM & 9:30 PM IST");
// }


// src/services/scheduler.js
import cron from "node-cron";
import { sendDailyNavReport } from "./notificationService.js";

export function startScheduler() {
  console.log("Scheduler initialized. Server time:", new Date().toString());

  // 11:15 AM IST
  cron.schedule("15 11 * * *", async () => {
    console.log("🔥 Cron triggered: 11:15 AM IST at", new Date().toString());
    try {
      await sendDailyNavReport();
      console.log("✅ 11:15 AM report sent successfully.");
    } catch (err) {
      console.error("❌ Error in 11:15 AM schedule:", err);
    }
  });

  // 11:15 PM IST
  cron.schedule("15 23 * * *", async () => {
    console.log("🔥 Cron triggered: 11:15 PM IST at", new Date().toString());
    try {
      await sendDailyNavReport();
      console.log("✅ 11:15 PM report sent successfully.");
    } catch (err) {
      console.error("❌ Error in 11:15 PM schedule:", err);
    }
  });

  console.log("📅 Scheduler active: Notifications will be sent at 11:15 AM & 11:15 PM IST daily.");
}
