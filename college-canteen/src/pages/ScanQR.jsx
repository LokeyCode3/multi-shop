import React, { useState } from "react";
import QrReader from "react-qr-scanner";
import { db } from "../firebase";
import { addDoc, collection, Timestamp } from "firebase/firestore";

export default function ScanQR() {
  const [orderData, setOrderData] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // 🔍 Handle QR Scan
  const handleScan = (data) => {
    if (data) {
      try {
        const parsed = JSON.parse(data.text || data);
        console.log("📦 Decoded QR:", parsed);
        setOrderData(parsed);
      } catch (err) {
        console.error("❌ Invalid QR data:", err);
        setError("Invalid QR code. Please scan a valid order QR.");
      }
    }
  };

  const handleError = (err) => {
    console.error("⚠️ QR Scanner Error:", err);
    setError("Camera access issue or scanner error.");
  };

  // 💾 Mark order as received/prepared
  const markOrderAsCompleted = async () => {
    if (!orderData) return;
    setSaving(true);

    try {
      await addDoc(collection(db, "completedOrders"), {
        ...orderData,
        status: "completed",
        completedAt: Timestamp.now(),
      });
      alert("✅ Order marked as completed and saved in Firestore!");
      setOrderData(null);
    } catch (err) {
      console.error("❌ Error saving completed order:", err);
      alert("Failed to save completed order.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        textAlign: "center",
        padding: "2rem",
        background: "#f7f9fb",
        minHeight: "100vh",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      <h2>📷 Canteen QR Scanner</h2>
      <p style={{ color: "#555" }}>
        Scan the student's order QR to view details below.
      </p>

      {/* QR Scanner */}
      <div
        style={{
          width: "320px",
          height: "320px",
          margin: "1.5rem auto",
          border: "2px solid #007bff",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        <QrReader
  delay={300}
  onError={handleError}
  onScan={handleScan}
  style={{ width: "100%" }}
/>
      </div>

      {/* Error Message */}
      {error && (
        <p style={{ color: "red", fontWeight: "500" }}>
          ⚠️ {error}
        </p>
      )}

      {/* Decoded Order */}
      {orderData && (
        <div
          style={{
            background: "white",
            borderRadius: "12px",
            boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
            maxWidth: "500px",
            margin: "2rem auto",
            padding: "1.5rem",
            textAlign: "left",
          }}
        >
          <h3>🧾 Order Details</h3>
          <p>
            <b>Order ID:</b> {orderData.orderId}
          </p>
          <p>
            <b>Time:</b> {orderData.time}
          </p>
          <p>
            <b>Total:</b> ₹{orderData.total}
          </p>
          <h4>Items:</h4>
          <ul>
            {orderData.items.map((item, index) => (
              <li key={index}>
                {item.name} × {item.qty} — ₹{item.price}
              </li>
            ))}
          </ul>
          <button
            onClick={markOrderAsCompleted}
            disabled={saving}
            style={{
              background: saving ? "#ccc" : "#28a745",
              color: "white",
              border: "none",
              padding: "10px 16px",
              borderRadius: "6px",
              cursor: saving ? "not-allowed" : "pointer",
              marginTop: "1rem",
              width: "100%",
              fontWeight: "500",
            }}
          >
            {saving ? "Saving..." : "✅ Mark as Completed"}
          </button>
        </div>
      )}
    </div>
  );
}