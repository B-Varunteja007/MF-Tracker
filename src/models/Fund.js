// src/models/Fund.js
import mongoose from "mongoose";

const fundSchema = new mongoose.Schema({
  schemeCode: String,
  schemeName: String,
  date: String,
  nav: String
});

export default mongoose.model("Fund", fundSchema);
