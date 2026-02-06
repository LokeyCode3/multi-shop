import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart = [], total = 0, phone = "" } = location.state || {};
  const [loading, setLoading] = useState(false);

  // ✅ Redirect home if cart is empty
  useEffect(() => {
    if (!cart || cart.length === 0) {
      navigate("/");
    }
  }, [cart, navigate]);

  // ✅ Handle Stripe Payment
  const handlePayment = async () => {
    if (cart.length === 0) {
      alert("🛒 Your cart is empty!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:4242/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart,
          success_url: "http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}",
          cancel_url: "http://localhost:3000/cancel",
        }),
      });

      if (!res.ok) {
        throw new Error("⚠️ Failed to connect to backend.");
      }

      const data = await res.json();

      if (data?.url) {
        // ✅ Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        alert("❌ Could not start payment session. Check backend logs.");
      }
    } catch (err) {
      console.error("Stripe session error:", err);
      alert("⚠️ Unable to start payment session. Check your Stripe backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        textAlign: "center",
        marginTop: "5rem",
        fontFamily: "Poppins, sans-serif",
        padding: "20px",
      }}
    >
      <h2>💳 Checkout</h2>
      <p>📱 Phone: {phone ? `+91 ${phone}` : "Guest"}</p>

      <div
        style={{
          marginTop: "2rem",
          border: "1px solid #eee",
          borderRadius: "10px",
          padding: "20px",
          display: "inline-block",
          textAlign: "left",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <h3 style={{ textAlign: "center" }}>🧾 Order Summary</h3>
        {cart.length > 0 ? (
          cart.map((item) => (
            <p key={item.id}>
              {item.name} × {item.qty} — <strong>₹{item.price * item.qty}</strong>
            </p>
          ))
        ) : (
          <p>No items in cart.</p>
        )}
        <hr />
        <h3 style={{ textAlign: "center" }}>Total: ₹{total}</h3>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <button
          onClick={handlePayment}
          disabled={loading}
          style={{
            background: loading ? "#ccc" : "#007bff",
            color: "white",
            padding: "12px 20px",
            border: "none",
            borderRadius: "8px",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: "bold",
            marginTop: "1.5rem",
            width: "220px",
            transition: "0.3s ease",
          }}
        >
          {loading ? "Processing..." : "💰 Pay Now (UPI / Card)"}
        </button>

        <p style={{ marginTop: "15px", color: "gray", fontSize: "13px" }}>
          🔒 Secure payments handled by Stripe
        </p>
      </div>
    </div>
  );
}