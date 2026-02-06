import React from "react";
import { useNavigate } from "react-router-dom";

export default function CanteenRoleSelect() {
  const navigate = useNavigate();

  return (
    <div style={{
      textAlign: "center",
      marginTop: "10%",
      fontFamily: "Arial"
    }}>
      <h2 style={{ fontSize: "26px", fontWeight: "bold" }}>
        Canteen — Choose Role
      </h2>

      <button
        onClick={() => navigate("/student-login")}
        style={{
          background: "#4CAF50",
          color: "white",
          padding: "12px 22px",
          borderRadius: "8px",
          border: "none",
          cursor: "pointer",
          fontSize: "18px",
          margin: "20px"
        }}
      >
        🧑‍🎓 Student Login
      </button>

      <br />

      <button
        onClick={() => navigate("/admin-login")}
        style={{
          background: "#FF9800",
          color: "white",
          padding: "12px 22px",
          borderRadius: "8px",
          border: "none",
          cursor: "pointer",
          fontSize: "18px",
          marginTop: "20px"
        }}
      >
        👨‍🍳 Admin Login
      </button>
    </div>
  );
}
