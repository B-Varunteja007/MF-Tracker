// src/routes/funds.js
import express from "express";
import Watchlist from "../models/Watchlist.js";
import { fetchNavWithStats, searchFunds, getFundHistory } from "../services/mfService.js";

const router = express.Router();

// Search funds
router.get("/search", async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: "Query required" });
  const results = await searchFunds(q);
  res.json(results);
});

// Add to watchlist
router.post("/watchlist", async (req, res) => {
  const { schemeCode, schemeName } = req.body;
  if (!schemeCode || !schemeName) return res.status(400).json({ error: "Missing data" });
  try {
    const fund = await Watchlist.create({ schemeCode, schemeName });
    res.json(fund);
  } catch (err) {
    res.status(500).json({ error: "Could not add to watchlist" });
  }
});

// Get watchlist with latest NAV stats
router.get("/watchlist", async (req, res) => {
  try {
    const funds = await Watchlist.find();
    const statsPromises = funds.map(f => fetchNavWithStats(f.schemeCode));
    const stats = await Promise.all(statsPromises);
    res.json(stats.filter(Boolean));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch watchlist stats" });
  }
});

// Remove fund
router.delete("/watchlist/:schemeCode", async (req, res) => {
  const { schemeCode } = req.params;
  try {
    await Watchlist.findOneAndDelete({ schemeCode });
    const funds = await Watchlist.find();
    const statsPromises = funds.map(f => fetchNavWithStats(f.schemeCode));
    const stats = await Promise.all(statsPromises);
    res.status(200).json(stats.filter(Boolean));
  } catch (err) {
    res.status(500).json({ error: "Failed to remove fund" });
  }
});

export default router;
