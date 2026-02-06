import React, { useState } from "react";
import { db } from "./firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import QrScanner from "react-qr-scanner"; // 👈 Install this package
import "./index.css";

export default function AdminVerify() {
  const [scannedToken, setScannedToken] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showScanner, setShowScanner] = useState(false);

  // 📡 Verify scanned QR code token with Firestore
  const verifyToken = async (tokenValue) => {
    try {
      const q = query(collection(db, "orders"), where("token", "==", tokenValue));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setResult(null);
        setError("❌ Invalid or fake QR code. Not found in records!");
      } else {
        const orderData = snapshot.docs[0].data();
        setResult(orderData);
        setError("");
      }
    } catch (err) {
      console.error("Verification Error:", err);
      setError("⚠️ Error verifying token. Try again.");
    }
  };

  // 📷 Handle QR Code scan result
  const handleScan = (data) => {
    if (data?.text) {
      const tokenValue = data.text.replace("Token: ", "").trim();
      setScannedToken(tokenValue);
      setShowScanner(false);
      verifyToken(tokenValue);
    }
  };

  const handleError = (err) => {
    console.error("QR Scan Error:", err);
    setError("⚠️ Camera access error or QR not detected.");
  };

  return (
    <div style={{ textAlign: "center", marginTop: "5rem", fontFamily: "Poppins, sans-serif" }}>
      <h2>🔍 Admin Token Verification</h2>
      <p>Scan the student’s payment QR or manually enter the token number.</p>

      {/* 🔘 Manual Token Entry */}
      <div style={{ marginTop: "20px" }}>
        <input
          type="text"
          placeholder="Enter Token Number (e.g. T1234)"
          value={scannedToken}
          onChange={(e) => setScannedToken(e.target.value)}
          style={{
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            width: "200px",
          }}
        />
        <button
          onClick={() => verifyToken(scannedToken)}
          style={{
            background: "#007bff",
            color: "white",
            padding: "8px 15px",
            border: "none",
            borderRadius: "6px",
            marginLeft: "10px",
            cursor: "pointer",
          }}
        >
          ✅ Verify
        </button>
      </div>

      {/* 📷 QR Scanner */}
      {!showScanner ? (
        <button
          onClick={() => setShowScanner(true)}
          style={{
            marginTop: "20px",
            background: "#28a745",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          📸 Scan QR Code
        </button>
      ) : (
        <div style={{ marginTop: "20px" }}>
          <QrScanner
            delay={300}
            onError={handleError}
            onScan={handleScan}
            style={{ width: "250px", height: "250px", margin: "auto" }}
          />
          <p style={{ color: "gray" }}>Align QR within the frame</p>
          <button
            onClick={() => setShowScanner(false)}
            style={{
              background: "red",
              color: "white",
              padding: "6px 15px",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              marginTop: "10px",
            }}
          >
            ✖ Close Scanner
          </button>
        </div>
      )}

      {/* 🧾 Result Display */}
      {error && <p style={{ color: "red", marginTop: "20px" }}>{error}</p>}

      {result && (
        <div
          style={{
            marginTop: "30px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "20px",
            display: "inline-block",
            background: "#f9f9f9",
          }}
        >
          <h3>🎟️ Token: {result.token}</h3>
          <p>📱 Payment Status: {result.status}</p>
          <p>💰 Total: ₹{result.total || "N/A"}</p>
          <p>📅 Date: {result.createdAt?.toDate().toLocaleString()}</p>
          {result.paymentScreenshot && (
            <img
              src={result.paymentScreenshot}
              alt="Payment Proof"
              style={{ width: "200px", marginTop: "10px", borderRadius: "8px" }}
            />
          )}
          <p style={{ color: "#28a745", fontWeight: "bold" }}>✅ Verified — Deliver order</p>
        </div>
      )}
    </div>
  );
}