import { Handler } from "@netlify/functions";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      booking_id,
      amount
    } = JSON.parse(event.body || "{}");

    const secret = process.env.RAZORPAY_KEY_SECRET || "";

    // Verify signature
    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return { statusCode: 400, body: JSON.stringify({ error: "Invalid payment signature" }) };
    }

    // Initialize Supabase admin client
    const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ""; // Fallback for local testing, but should use service_role
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Save payment record
    const { error: paymentError } = await supabase
      .from("payments")
      .insert({
        booking_id,
        razorpay_order_id,
        razorpay_payment_id,
        amount,
        status: "captured"
      });

    if (paymentError) throw paymentError;

    // Update booking status
    const { error: bookingError } = await supabase
      .from("bookings")
      .update({
        payment_status: "paid",
        booking_status: "confirmed",
        razorpay_order_id,
        razorpay_payment_id
      })
      .eq("id", booking_id);

    if (bookingError) throw bookingError;

    // Trigger emails here in the future

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: true }),
    };

  } catch (error: any) {
    console.error("Razorpay Verification Error:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: error.message || "Verification failed" }),
    };
  }
};
