// src/services/notificationService.js
import nodemailer from "nodemailer";
import twilio from "twilio";
import Watchlist from "../models/Watchlist.js";
import Fund from "../models/Fund.js";
import { fetchNavWithStats } from "./mfService.js";

// --------------------- EMAIL SETUP ---------------------
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

// Send Email
async function sendEmail(subject, htmlContent) {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: process.env.USER_EMAIL,
    subject,
    html: htmlContent,
  });
  console.log("📧 Email sent");
}

// --------------------- WHATSAPP SETUP ---------------------
async function sendWhatsApp(message) {
  try {
    const client = twilio(
      process.env.TWILIO_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    const response = await client.messages.create({
      from: "whatsapp:+14155238886", // Twilio Sandbox WhatsApp number
      to: process.env.USER_WHATSAPP, // must include whatsapp: prefix
      body: message,
    });

    console.log("WhatsApp sent:", response.sid);
  } catch (err) {
    console.error("WhatsApp failed:", err);
  }
}

// --------------------- HELPER ---------------------
function formatChange(value) {
  if (!value) return "-";
  const num = parseFloat(value);
  return num > 0 ? `📈 +${num}` : num < 0 ? `📉 ${num}` : `${num}`;
}

// --------------------- MAIN DAILY NAV REPORT ---------------------
export async function sendDailyNavReport() {
  const watchlist = await Watchlist.find();
  if (!watchlist.length) {
    console.log("⚠️ No funds in watchlist");
    return;
  }

  const tableRows = [];
  const cardRows = [];
  let whatsappReport = `📊 *Daily NAV Report* - ${new Date().toLocaleDateString(
    "en-IN"
  )}\n\n`;

  for (const fund of watchlist) {
    const navData = await fetchNavWithStats(fund.schemeCode);
    if (!navData) continue;

    // Save today's NAV in DB
    await Fund.create({
      schemeCode: fund.schemeCode,
      schemeName: navData.schemeName,
      nav: navData.nav,
      date: new Date().toISOString().split("T")[0],
    });

    // ---------------- EMAIL HTML ----------------
    tableRows.push(`
      <tr>
        <td>${navData.schemeName}</td>
        <td>₹${navData.nav}</td>
        <td>₹${navData.prevNav ?? "-"}</td>
        <td>${formatChange(navData.dailyChange)} (${formatChange(
      navData.dailyChangePct
    )}%)</td>
        <td>${navData["1W"] ?? "-"}%</td>
        <td>${navData["1M"] ?? "-"}%</td>
        <td>${navData["3M"] ?? "-"}%</td>
        <td>${navData["6M"] ?? "-"}%</td>
        <td>${navData["1Y"] ?? "-"}%</td>
      </tr>
    `);

    cardRows.push(`
      <div style="border:1px solid #ddd; border-radius:8px; padding:15px; margin-bottom:12px; background:#f9f9f9; box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        <strong style="color:#2980b9; font-size:16px;">${
          navData.schemeName
        }</strong>
        <div style="margin-top:5px; font-size:14px; line-height:1.4;">
          Today NAV: ₹${navData.nav}<br/>
          Prev Day: ₹${navData.prevNav ?? "-"}<br/>
          Daily Change: ${formatChange(navData.dailyChange)} (${formatChange(
      navData.dailyChangePct
    )}%)<br/>
          1W: ${navData["1W"] ?? "-"}%, 1M: ${navData["1M"] ?? "-"}%, 3M: ${
      navData["3M"] ?? "-"
    }%<br/>
          6M: ${navData["6M"] ?? "-"}%, 1Y: ${navData["1Y"] ?? "-"}%
        </div>
      </div>
    `);

    // ---------------- WHATSAPP TEXT ----------------
    const dailyChangeText =
      navData.dailyChange > 0
        ? `📈 +${navData.dailyChange} (+${navData.dailyChangePct}%)`
        : navData.dailyChange < 0
        ? `📉 ${navData.dailyChange} (${navData.dailyChangePct}%)`
        : `${navData.dailyChange} (${navData.dailyChangePct}%)`;

    whatsappReport += `*${navData.schemeName}*\n`;
    whatsappReport += `Today NAV: ₹${navData.nav}\n`;
    whatsappReport += `Prev Day: ₹${navData.prevNav ?? "-"}\n`;
    whatsappReport += `Daily Change: ${dailyChangeText}\n`;
    whatsappReport += `1W: ${navData["1W"] ?? "-"}%, 1M: ${
      navData["1M"] ?? "-"
    }%, 3M: ${navData["3M"] ?? "-"}%\n`;
    whatsappReport += `6M: ${navData["6M"] ?? "-"}%, 1Y: ${
      navData["1Y"] ?? "-"
    }%\n\n`;
  }

  if (tableRows.length > 0) {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style type="text/css">
    body { margin:0; padding:0; font-family: Arial, sans-serif; background:#f8f9fa; }

    @media only screen and (max-width: 600px) {
      .desktop-table { display: none !important; }
      .mobile-cards { display: block !important; }
      .stat-col { width: 100% !important; } /* Mobile fix */
    }
    @media only screen and (min-width: 601px) {
      .desktop-table { display: table !important; }
      .mobile-cards { display: none !important; }
    }
  </style>
</head>
<body>
  <div style="max-width:700px; margin:auto; border:1px solid #e0e0e0; border-radius:8px; overflow:hidden; background:#fff;">

    <!-- Banner Image -->
    <div style="background:#f0f8ff; text-align:center; padding:0;">
      <img src="cid:bannerImg" alt="Mutual Funds" style="width:100%; max-width:700px; height:auto; display:block;" />
    </div>

    <!-- Stats Summary (Updated Mobile-Safe Version) -->
    <div style="background:white; margin:16px; border-radius:12px; padding:16px; box-shadow:0 2px 8px rgba(0,0,0,0.1);">

      <div style="display:flex; flex-wrap:wrap; text-align:center;">

        <!-- Total Funds -->
        <div class="stat-col" style="width:33.33%; padding:10px 0;">
          <div style="font-size:12px; color:#7f8c8d;">Total Funds</div>
          <div style="font-size:18px; font-weight:700; color:#2980b9;">
            ${cardRows.length}
          </div>
        </div>

        <!-- Last Updated -->
        <div class="stat-col" style="width:33.33%; padding:10px 0;">
          <div style="font-size:12px; color:#7f8c8d;">Last Updated</div>
          <div style="font-size:18px; font-weight:700; color:#27ae60;">
            ${new Date().toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>

        <!-- Status -->
        <div class="stat-col" style="width:33.33%; padding:10px 0;">
          <div style="font-size:12px; color:#7f8c8d;">Status</div>
          <div style="font-size:18px; font-weight:700; color:#e67e22;">Active</div>
        </div>

      </div>

    </div>

    <!-- Motivation Quote -->
    <div style="background:#eaf7ea; padding:15px; text-align:center; font-style:italic; font-size:16px; color:#2d6a4f;">
      "Don’t wait to invest in mutual funds. Invest and wait—the magic is in compounding. 💡"
    </div>

    <!-- Desktop Table -->
    <div style="padding:20px; overflow-x:auto;" class="desktop-table">
      <h2 style="color:#34495e; text-align:center; margin-bottom:15px;">📊 Daily NAV Report</h2>

      <table border="1" cellspacing="0" cellpadding="8" width="100%" style="border-collapse:collapse; font-size:14px; text-align:center; border-radius:6px; overflow:hidden;">
        <thead>
          <tr style="background:#2980b9; color:#fff;">
            <th>Fund Name</th>
            <th>Today NAV</th>
            <th>Prev Day</th>
            <th>Daily Change</th>
            <th>1W</th>
            <th>1M</th>
            <th>3M</th>
            <th>6M</th>
            <th>1Y</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows.join("")}
        </tbody>
      </table>
    </div>

    <!-- Mobile Cards -->
    <div style="padding:20px;" class="mobile-cards">
      ${cardRows.join("")}
    </div>

    <!-- Footer -->
    <div style="background:#f8f9fa; text-align:center; padding:15px; font-size:12px; color:#777;">
      Sent with ❤️ by Your Investment Tracker<br/>
      <a href="#" style="color:#2980b9; text-decoration:none;">Unsubscribe</a>
    </div>

  </div>
</body>
</html>
`;

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.USER_EMAIL,
      subject: `Daily NAV Update - ${new Date().toLocaleDateString("en-IN")}`,
      html,
      attachments: [
        {
          filename: "mf.jpeg",
          path: "./src/assets/mf.jpeg",
          cid: "bannerImg",
        },
      ],
    });

    // Send WhatsApp
    await sendWhatsApp(whatsappReport);

    console.log("✅ Notifications sent (Email + WhatsApp)");
  }
}

export { sendEmail, sendWhatsApp };
