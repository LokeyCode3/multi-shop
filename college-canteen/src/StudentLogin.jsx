import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "./firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

export default function StudentLogin() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();

  // ✅ Safe reCAPTCHA initialization
  const setupRecaptcha = () => {
    // Check if container exists
    let recaptchaDiv = document.getElementById("recaptcha-container");
    if (!recaptchaDiv) {
      recaptchaDiv = document.createElement("div");
      recaptchaDiv.id = "recaptcha-container";
      recaptchaDiv.style.display = "none";
      document.body.appendChild(recaptchaDiv);
    }

    // If already initialized, clear it safely
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (e) {
        console.warn("⚠️ Could not clear old reCAPTCHA:", e);
      }
      delete window.recaptchaVerifier;
    }

    // Create a new one
    console.log("🟢 Initializing Firebase reCAPTCHA...");
    try {
      window.recaptchaVerifier = new RecaptchaVerifier(
        "recaptcha-container",
        {
          size: "invisible",
          callback: (response) => console.log("✅ reCAPTCHA verified:", response),
          "expired-callback": () => {
            alert("⚠️ reCAPTCHA expired. Please try again.");
            if (window.recaptchaVerifier) {
              try {
                window.recaptchaVerifier.clear();
              } catch {}
              delete window.recaptchaVerifier;
            }
          },
        },
        auth
      );
    } catch (err) {
      console.error("❌ reCAPTCHA init error:", err);
    }
  };

  // 🧹 Cleanup on unmount
  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        console.log("🧹 Cleaning up Firebase reCAPTCHA...");
        try {
          window.recaptchaVerifier.clear();
        } catch {}
        delete window.recaptchaVerifier;
      }
    };
  }, []);

  // ✅ Send OTP
  const sendOTP = async () => {
    if (!phone || phone.length !== 10) {
      alert("📱 Please enter a valid 10-digit phone number");
      return;
    }

    try {
      setSending(true);
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;

      console.log("📤 Sending OTP to +91" + phone);
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        `+91${phone}`,
        appVerifier
      );
      window.confirmationResult = confirmationResult;
      setOtpSent(true);
      alert("✅ OTP sent successfully! Please check your phone.");
    } catch (error) {
      console.error("❌ OTP sending error:", error);
      if (error.code === "auth/too-many-requests") {
        alert("⚠️ Too many requests. Try again later.");
      } else if (error.code === "auth/invalid-app-credential") {
        alert("⚠️ Invalid Firebase reCAPTCHA setup. Check firebase.js.");
      } else {
        alert("❌ Failed to send OTP. Verify Firebase setup & domain.");
      }
    } finally {
      setSending(false);
    }
  };

  // ✅ Verify OTP and navigate
  const verifyOTP = async () => {
    if (!otp) {
      alert("Please enter the OTP you received.");
      return;
    }

    setLoading(true);
    try {
      const result = await window.confirmationResult.confirm(otp);
      console.log("✅ User verified:", result.user);

      alert("🎉 Login successful!");
      navigate("/canteen", { state: { phone } });
    } catch (error) {
      console.error("❌ OTP verification error:", error);
      if (error.code === "auth/invalid-verification-code") {
        alert("❌ Invalid OTP. Try again.");
      } else {
        alert("⚠️ Verification failed. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // =================== UI ===================
  return (
    <div
      style={{
        textAlign: "center",
        marginTop: "10%",
        background: "#f8f9fa",
        padding: "30px",
        borderRadius: "10px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        maxWidth: "400px",
        marginLeft: "auto",
        marginRight: "auto",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      <h2>📲 Student Login</h2>
      <p style={{ color: "gray", fontSize: "14px" }}>
        Enter your phone number to receive an OTP
      </p>

      {loading ? (
        <div style={{ marginTop: "20px" }}>
          <div
            style={{
              border: "4px solid #ccc",
              borderTop: "4px solid #007bff",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              margin: "20px auto",
              animation: "spin 1s linear infinite",
            }}
          ></div>
          <p>Verifying OTP...</p>
          <style>
            {`@keyframes spin {0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}`}
          </style>
        </div>
      ) : !otpSent ? (
        <>
          <input
            type="tel"
            placeholder="Enter 10-digit Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{
              padding: "10px",
              width: "90%",
              borderRadius: "6px",
              border: "1px solid #ccc",
              margin: "10px 0",
            }}
          />
          <button
            onClick={sendOTP}
            disabled={sending}
            style={{
              background: sending ? "#ccc" : "#28a745",
              color: "white",
              padding: "10px 20px",
              border: "none",
              borderRadius: "6px",
              cursor: sending ? "not-allowed" : "pointer",
              width: "100%",
              fontWeight: "bold",
            }}
          >
            {sending ? "Sending OTP..." : "Send OTP"}
          </button>
        </>
      ) : (
        <>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            style={{
              padding: "10px",
              width: "90%",
              borderRadius: "6px",
              border: "1px solid #ccc",
              margin: "10px 0",
            }}
          />
          <button
            onClick={verifyOTP}
            style={{
              background: "#007bff",
              color: "white",
              padding: "10px 20px",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              width: "100%",
              fontWeight: "bold",
            }}
          >
            Verify OTP
          </button>
          <p
            style={{
              color: "#007bff",
              cursor: "pointer",
              fontSize: "13px",
              marginTop: "10px",
            }}
            onClick={sendOTP}
          >
            🔁 Resend OTP
          </p>
        </>
      )}

      {/* Hidden reCAPTCHA container */}
      <div id="recaptcha-container" style={{ display: "none" }}></div>
    </div>
  );
}