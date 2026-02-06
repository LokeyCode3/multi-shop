import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "./firebase";
import { collection, addDoc, getDocs, Timestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { QRCodeCanvas } from "qrcode.react";
import jsQR from "jsqr";

export default function Success() {
  const navigate = useNavigate();
  const qrRef = useRef();

  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadedQR, setUploadedQR] = useState(null);
  const [token, setToken] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [statusMessage, setStatusMessage] = useState("🔍 Verifying payment...");

  const sessionId = new URLSearchParams(window.location.search).get("session_id");

  // ✅ Step 1: Verify payment with backend
  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setStatusMessage("⚠️ Invalid payment session ID.");
        setVerifying(false);
        return;
      }

      try {
        const res = await fetch(`http://localhost:4242/verify-payment/${sessionId}`);
        const data = await res.json();

        if (data.success) {
          setVerified(true);
          setStatusMessage("✅ Payment verified successfully!");
          const tokenNum = "T" + Math.floor(1000 + Math.random() * 9000);
          setToken(tokenNum);
          setShowQR(true);

          // Save a reference order in Firestore
          await addDoc(collection(db, "orders"), {
            sessionId,
            token: tokenNum,
            status: "Payment Verified (Pending Upload)",
            createdAt: Timestamp.now(),
          });
        } else {
          setStatusMessage("❌ Payment could not be verified. Contact admin.");
        }
      } catch (err) {
        console.error("Verification error:", err);
        setStatusMessage("⚠️ Unable to reach verification server.");
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [sessionId]);

  // ✅ Download QR Code
  const handleDownloadQR = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;

    const pngUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = pngUrl;
    link.download = `CanteenToken_${token}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ✅ Upload Screenshot + Validate QR (safe + responsive)
  const handleScreenshotUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setStatusMessage("📤 Uploading and validating QR...");

    try {
      // 🖼️ Safe image decode
      const img = new Image();
      const objectURL = URL.createObjectURL(file);

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = objectURL;
      });

      // 🧠 Decode QR using a hidden canvas
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Failed to get canvas context");

      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(objectURL);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const qrCode = jsQR(imageData.data, canvas.width, canvas.height, { inversionAttempts: "dontInvert" });

      if (!qrCode || !qrCode.data) {
        setStatusMessage("❌ No valid QR code found in the image.");
        setUploading(false);
        return;
      }

      const qrContent = qrCode.data.trim().toLowerCase();
      console.log("🧩 Decoded QR:", qrContent);

      // 🔍 Check Firestore for duplicate QR
      const existingOrders = await getDocs(collection(db, "orders"));
      const alreadyUsed = existingOrders.docs.some(
        (doc) => doc.data().qrContent === qrContent
      );

      if (alreadyUsed) {
        setStatusMessage("🚫 This QR/payment proof has already been used!");
        setUploading(false);
        return;
      }

      // ✅ Upload to Firebase Storage
      const storage = getStorage();
      const fileRef = ref(storage, `uploads/${Date.now()}-${file.name}`);
      await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(fileRef);
      setUploadedQR(downloadURL);

      // ✅ Save validated order in Firestore
      await addDoc(collection(db, "orders"), {
        paymentScreenshot: downloadURL,
        qrContent,
        createdAt: Timestamp.now(),
        token,
        status: "Payment Verified & QR Uploaded",
      });

      setStatusMessage(`🎉 QR validated successfully! Token: ${token}`);
    } catch (err) {
      console.error("QR validation error:", err);
      setStatusMessage("❌ Failed to validate or upload QR. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // 🕒 Loading
  if (verifying)
    return <h2 style={statusStyle}>{statusMessage}</h2>;

  // ❌ Payment not verified
  if (!verified)
    return (
      <div style={container}>
        <h2 style={{ color: "red" }}>❌ Payment Not Verified!</h2>
        <p>{statusMessage}</p>
        <button onClick={() => navigate("/")} style={btnRed}>⬅ Back to Home</button>
      </div>
    );

  // ✅ Main UI
  return (
    <div style={container}>
      <h2 style={{ color: "#28a745" }}>✅ Payment Verified!</h2>
      <p>{statusMessage}</p>

      {showQR && (
        <div ref={qrRef} style={{ marginTop: "2rem" }}>
          <h3>🎟️ Your Payment QR Code</h3>
          <QRCodeCanvas
            value={`PaymentProof:${sessionId}_${token}`}
            size={200}
            includeMargin={true}
          />
          <p style={{ fontSize: "13px", color: "gray" }}>
            Download and keep this QR safe — you'll need it to confirm your order.
          </p>
          <button onClick={handleDownloadQR} style={btnBlue}>⬇ Download QR</button>
        </div>
      )}

      <div style={{ marginTop: "2rem" }}>
        <h4>📤 Upload QR (to confirm order)</h4>
        <input
          type="file"
          accept="image/*"
          onChange={handleScreenshotUpload}
          disabled={uploading}
        />
        {uploading && (
          <div>
            <p>⏳ Uploading & scanning...</p>
            <div
              style={{
                margin: "10px auto",
                border: "3px solid #ccc",
                borderTop: "3px solid #007bff",
                borderRadius: "50%",
                width: "30px",
                height: "30px",
                animation: "spin 1s linear infinite",
              }}
            ></div>
            <style>
              {`@keyframes spin {0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}`}
            </style>
          </div>
        )}

        {uploadedQR && (
          <div style={{ marginTop: "15px" }}>
            <h4>🖼️ Uploaded QR Preview:</h4>
            <img
              src={uploadedQR}
              alt="Uploaded QR"
              style={{ width: "180px", borderRadius: "10px", marginTop: "10px" }}
            />
          </div>
        )}
      </div>

      <button onClick={() => navigate("/")} style={btnRed}>
        ⬅ Back to Home
      </button>
    </div>
  );
}

// 💅 Styles
const container = {
  textAlign: "center",
  marginTop: "5rem",
  fontFamily: "Poppins, sans-serif",
};

const statusStyle = {
  textAlign: "center",
  marginTop: "5rem",
  fontFamily: "Poppins, sans-serif",
  color: "#333",
};

const btnBlue = {
  background: "#007bff",
  color: "white",
  padding: "10px 20px",
  border: "none",
  borderRadius: "8px",
  marginTop: "10px",
  cursor: "pointer",
};

const btnRed = {
  background: "red",
  color: "white",
  padding: "10px 20px",
  border: "none",
  borderRadius: "8px",
  marginTop: "20px",
  cursor: "pointer",
};