import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// 🌟 Import all main pages
import App from "./App";
import StudentLogin from "./StudentLogin";
import Canteen from "./Canteen";
import Checkout from "./Checkout";
import Success from "./Success";
import Cancel from "./Cancel";
import AdminVerify from "./AdminVerify"; // 🔐 For QR verification (optional next step)
import "./index.css";

// 🚫 Suppress Firebase & Stripe "Timeout" warnings in dev mode
window.addEventListener("error", (e) => {
  if (e.message && e.message.includes("Timeout")) {
    e.preventDefault();
    console.warn("⚠️ Timeout suppressed (safe in dev mode)");
  }
});

// 🧠 Root App Rendering
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* 🏠 Main Home Page */}
        <Route path="/" element={<App />} />

        {/* 👨‍🎓 Student Login via OTP */}
        <Route path="/login" element={<StudentLogin />} />

        {/* 🍴 Canteen Menu + Cart */}
        <Route path="/canteen" element={<Canteen />} />

        {/* 💳 Stripe Checkout Page */}
        <Route path="/checkout" element={<Checkout />} />

        {/* ✅ Payment Success (QR Upload + Token) */}
        <Route path="/success" element={<Success />} />

        {/* ❌ Payment Cancelled Page */}
        <Route path="/cancel" element={<Cancel />} />

        {/* 🧾 Admin QR Verification Page */}
        <Route path="/admin" element={<AdminVerify />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);