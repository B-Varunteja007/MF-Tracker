// src/services/mfService.js
import axios from "axios";

/**
 * Helper: calculate % change between latest NAV and NAV N days ago
 * @param {Array} navData - array of { date, nav } sorted latest first
 * @param {number} daysAgo - number of days back
 * @returns {number|null} - percentage change
 */
function calculatePctChange(navData, daysAgo) {
  if (!navData || navData.length <= daysAgo) return null;
  const latest = parseFloat(navData[0].nav);
  const past = parseFloat(navData[daysAgo].nav);
  if (isNaN(latest) || isNaN(past) || past === 0) return null;
  return parseFloat(((latest - past) / past * 100).toFixed(2));
}

/**
 * Fetch NAV with stats: prev NAV, daily change, 1W/1M/3M/6M/1Y % changes
 * @param {string|number} schemeCode
 */
export async function fetchNavWithStats(schemeCode) {
  try {
    const url = `https://api.mfapi.in/mf/${schemeCode}`;
    const { data } = await axios.get(url);

    if (!data?.data?.length) return null;

    const navData = data.data; // latest first
    const latest = navData[0];
    const prev = navData[1] || null;

    // Daily change
    let dailyChange = null;
    let dailyChangePct = null;
    if (prev) {
      dailyChange = parseFloat((parseFloat(latest.nav) - parseFloat(prev.nav)).toFixed(2));
      dailyChangePct = parseFloat(
        (((parseFloat(latest.nav) - parseFloat(prev.nav)) / parseFloat(prev.nav)) * 100).toFixed(2)
      );
    }

    return {
      schemeCode,
      schemeName: data.meta.scheme_name,
      schemeCategory: data.meta.scheme_category,
      nav: parseFloat(latest.nav),
      prevNav: prev ? parseFloat(prev.nav) : null,
      dailyChange,
      dailyChangePct,
      "1W": calculatePctChange(navData, 7),
      "1M": calculatePctChange(navData, 30),
      "3M": calculatePctChange(navData, 90),
      "6M": calculatePctChange(navData, 180),
      "1Y": calculatePctChange(navData, 365),
    };
  } catch (err) {
    console.error(`Error fetching NAV stats for ${schemeCode}:`, err.message);
    return null;
  }
}

/**
 * Search mutual funds by name
 * @param {string} query
 */
export async function searchFunds(query) {
  try {
    const url = `https://api.mfapi.in/mf/search?q=${query}`;
    const { data } = await axios.get(url);
    return data;
  } catch (err) {
    console.error("Error searching funds:", err.message);
    return [];
  }
}

/**
 * Fetch full NAV history for a fund
 * @param {string|number} schemeCode
 */
export async function getFundHistory(schemeCode) {
  try {
    const url = `https://api.mfapi.in/mf/${schemeCode}`;
    const { data } = await axios.get(url);
    return data.data.map(entry => ({
      date: entry.date,
      nav: parseFloat(entry.nav)
    }));
  } catch (err) {
    console.error(`Error fetching history for ${schemeCode}:`, err.message);
    return [];
  }
}
