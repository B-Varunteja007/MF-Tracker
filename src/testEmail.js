// src/testEmail.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const sendTestEmail = async () => {
  try {
    // Configure transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.USER_EMAIL,
      subject: "✅ MF Tracker Test Email",
      text: "This is a test email from MF NAV Tracker. Everything is working!",
    });

    console.log("✅ Test email sent successfully!");
  } catch (err) {
    console.error("❌ Error sending test email:", err.message);
  }
};

sendTestEmail();
