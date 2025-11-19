import twilio from "twilio";
import dotenv from "dotenv";
dotenv.config();

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

await client.messages.create({
  body: "✅ SMS setup successful!",
  from: process.env.TWILIO_NUMBER,
  to: process.env.USER_PHONE,
});

console.log("SMS sent!");
