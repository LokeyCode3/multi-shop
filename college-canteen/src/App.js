import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";

export default function App() {
  const navigate = useNavigate();
  const [step, setStep] = useState("home");
  const [service, setService] = useState("");
  const [role, setRole] = useState("");
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🧾 Fetch canteen menu
  useEffect(() => {
    const fetchMenu = async () => {
      setLoading(true);
      try {
        const snapshot = await getDocs(collection(db, "menu"));
        const items = snapshot.docs.map((d) => ({
          id: d.id,
          name: d.data().name || "Unnamed Item",
          price: Number(d.data().price) || 0,
        }));
        setMenu(items);
      } catch (err) {
        console.error("❌ Firestore fetch error:", err);
        alert("⚠️ Could not load menu.");
      } finally {
        setLoading(false);
      }
    };

    if (service === "canteen" && role === "student") fetchMenu();
  }, [service, role]);

  // ========================= 🏠 STEP 1: Choose Service =========================
  if (step === "home") {
    return (
      <div style={container}>
        <h1>🎓 Welcome to College Services</h1>
        <p>Select a service to continue</p>
        <div style={flexRow}>
          <button style={btnBlue} onClick={() => { setService("canteen"); setStep("role"); }}>
            🍴 Canteen
          </button>
          <button style={btnYellow} onClick={() => { setService("xerox"); setStep("role"); }}>
            📄 Xerox
          </button>
        </div>
      </div>
    );
  }

  // ========================= 🧍 STEP 2: Choose Role =========================
  if (step === "role") {
    return (
      <div style={container}>
        <h2>{service === "canteen" ? "🍴 Canteen" : "📄 Xerox"} Service</h2>
        <p>Continue as:</p>
        <div style={flexRow}>
          <button
            style={btnGreen}
            onClick={() => {
              setRole("student");
              navigate("/login", { state: { service } });
            }}
          >
            🎓 Student
          </button>
          <button
            style={btnGray}
            onClick={() => alert("🧾 Admin panel coming soon!")}
          >
            🧾 Admin
          </button>
        </div>
        <button style={btnRedSmall} onClick={() => setStep("home")}>
          ⬅ Back
        </button>
      </div>
    );
  }

  // ========================= 🍴 STEP 3: Student Canteen View (after login) =========================
  if (service === "canteen" && role === "student") {
    return (
      <div style={container}>
        <h2>🍽️ College Canteen Menu</h2>
        {loading ? (
          <p>⏳ Loading menu...</p>
        ) : (
          <div style={menuGrid}>
            {menu.map((item) => (
              <div key={item.id} style={menuCard}>
                <h3>{item.name}</h3>
                <p>₹{item.price}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
}

// ========================= 💅 Styles =========================
const container = {
  textAlign: "center",
  marginTop: "8rem",
  padding: "1rem",
  fontFamily: "sans-serif",
};

const flexRow = {
  display: "flex",
  justifyContent: "center",
  gap: "1.5rem",
  marginTop: "1rem",
};

const menuGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "1rem",
  marginTop: "1.5rem",
};

const menuCard = {
  border: "1px solid #ccc",
  borderRadius: "10px",
  padding: "1rem",
  background: "#fff",
  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
};

const btnBlue = {
  background: "#007bff",
  color: "#fff",
  padding: "10px 20px",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};

const btnYellow = {
  background: "#ffc107",
  color: "#000",
  padding: "10px 20px",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};

const btnGreen = {
  background: "#28a745",
  color: "#fff",
  padding: "10px 20px",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};

const btnGray = {
  background: "#6c757d",
  color: "#fff",
  padding: "10px 20px",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};

const btnRedSmall = {
  background: "red",
  color: "white",
  border: "none",
  padding: "6px 12px",
  borderRadius: "6px",
  cursor: "pointer",
  marginTop: "2rem",
};