// src/models/Watchlist.js
import mongoose from "mongoose";

const watchlistSchema = new mongoose.Schema({
  schemeCode: { type: String, unique: true },
  schemeName: String,
});

export default mongoose.model("Watchlist", watchlistSchema);
