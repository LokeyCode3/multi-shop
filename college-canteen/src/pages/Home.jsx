import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", marginTop: "10%" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "bold" }}>Campus Services</h1>

      <button 
        onClick={() => navigate("/canteen")}
        style={{
          background:"#28a745", color:"white", padding:"12px 20px",
          margin:"20px", borderRadius:"8px", border:"none", cursor:"pointer"
        }}
      >
        🍽️ Canteen
      </button>

      <button 
        style={{
          background:"#007bff", color:"white", padding:"12px 20px",
          borderRadius:"8px", border:"none", cursor:"pointer"
        }}
      >
        📄 Xerox (Coming Soon)
      </button>
    </div>
  );
}
