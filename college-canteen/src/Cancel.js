import React from "react";
import { useNavigate } from "react-router-dom";

export default function Cancel() {
  const navigate = useNavigate();
  return (
    <div style={{ textAlign: "center", marginTop: "5rem" }}>
      <h2>❌ Payment Cancelled</h2>
      <p>Your payment was not completed. Please try again.</p>
      <button
        onClick={() => navigate("/canteen")}
        style={{
          background: "#007bff",
          color: "white",
          padding: "10px 20px",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          marginTop: "1rem",
        }}
      >
        🔁 Try Again
      </button>
    </div>
  );
}