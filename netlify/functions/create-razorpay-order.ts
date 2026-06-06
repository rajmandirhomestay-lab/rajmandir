import { Handler } from "@netlify/functions";
import Razorpay from "razorpay";

export const handler: Handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { amount, currency = "INR", receipt } = JSON.parse(event.body || "{}");

    if (!amount) {
      return { statusCode: 400, body: JSON.stringify({ error: "Amount is required" }) };
    }

    // Initialize Razorpay
    // The keys will be injected via Netlify Environment Variables securely
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || "",
      key_secret: process.env.RAZORPAY_KEY_SECRET || "",
    });

    const options = {
      amount: Math.round(amount * 100), // Razorpay expects amount in paise (smallest currency unit)
      currency,
      receipt: receipt || `receipt_${new Date().getTime()}`,
    };

    const order = await razorpay.orders.create(options);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    };
  } catch (error: any) {
    console.error("Razorpay Order Creation Error:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: error.message || "Something went wrong" }),
    };
  }
};
