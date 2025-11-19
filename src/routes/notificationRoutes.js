// src/routes/notificationRoutes.js
import express from "express";
import { sendDailyNavReport } from "../services/notificationService.js";

const router = express.Router();

// POST /api/notifications/send-now
router.post("/send-now", async (req, res) => {
  try {
    await sendDailyNavReport();
    res.status(200).json({ message: "Notifications sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send notifications", error: err.message });
  }
});

export default router;
