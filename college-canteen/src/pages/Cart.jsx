import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Cart() {
  const location = useLocation();
  const navigate = useNavigate();

  const cart = location.state?.cart || [];

  const total = cart.reduce((acc, item) => acc + item.price, 0);

  return (
    <div style={{ padding: "20px" }}>
      <h2>🛒 Your Cart</h2>

      {cart.length === 0 ? (
        <p>No items in cart ❌</p>
      ) : (
        cart.map((item, idx) => (
          <div
            key={idx}
            style={{ padding: "10px 0", borderBottom: "1px solid #ddd" }}
          >
            {item.name} — ₹{item.price}
          </div>
        ))
      )}

      <h3>Total: ₹{total}</h3>

      <button
        onClick={() => navigate("/pay", { state: { cart, total } })}
        style={{
          background: "#28a745",
          color: "white",
          padding: "10px 20px",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        ✅ Proceed to Pay
      </button>
    </div>
  );
}
