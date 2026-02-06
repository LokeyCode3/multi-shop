// ✅ server.js (CommonJS)
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const Stripe = require("stripe");

// ✅ Load environment variables
dotenv.config();

const app = express();
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

// ✅ Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ Utility to auto-detect if key is test or live
const isLiveKey = process.env.STRIPE_SECRET_KEY?.startsWith("sk_live_");

// ✅ Create Checkout Session
app.post("/create-checkout-session", async (req, res) => {
  try {
    const { cart } = req.body;

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ error: "Invalid cart data" });
    }

    const line_items = cart.map((item) => ({
      price_data: {
        currency: "inr",
        product_data: { name: item.name },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.qty || 1,
    }));

    // ✅ Use UPI only if running with a live key
    const paymentMethods = isLiveKey ? ["card", "upi"] : ["card"];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: paymentMethods,
      line_items,
      mode: "payment",
      success_url: "http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "http://localhost:3000/cancel",
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("❌ Stripe Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Verify Payment Route
app.get("/verify-payment/:session_id", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.session_id);
    res.json({ success: session.payment_status === "paid" });
  } catch (err) {
    console.error("❌ Verification error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = 4242;
app.listen(PORT, () =>
  console.log(`🚀 Stripe backend running at http://localhost:${PORT} (${isLiveKey ? "LIVE MODE ✅" : "TEST MODE ⚙️"})`)
);