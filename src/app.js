// src/app.js
import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import fundsRouter from "./routes/funds.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import { startScheduler } from "./services/scheduler.js";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());

// Allow requests from frontend
app.use(
  cors({
    origin: "http://localhost:5173", // frontend URL
  })
);

// DB Connection
connectDB();

// Routes
app.use("/api/funds", fundsRouter);
app.use("/api/notifications", notificationRoutes);

app.get("/", (req, res) => res.send("🚀 MF NAV Tracker API running"));

// Start Scheduler
startScheduler();

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
