import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";

export default function Canteen() {
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Safely get the phone from navigation state
  const { phone } = location.state || {};

  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // 🧾 Fetch menu from Firestore
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

    fetchMenu();
  }, []);

  // 🛒 Add to Cart
  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { ...item, qty: 1 }];
    });
    setTotal((t) => t + Number(item.price || 0));
  };

  // ❌ Remove from Cart
  const removeFromCart = (id, price) => {
    const item = cart.find((i) => i.id === id);
    if (!item) return;
    const qtyTotal = Number(price) * item.qty;
    setCart((prev) => prev.filter((i) => i.id !== id));
    setTotal((prev) => Math.max(prev - qtyTotal, 0));
  };

  // 💳 Proceed to Payment
  const handleCheckout = () => {
    if (cart.length === 0) {
      alert("🛒 Add items to cart before proceeding.");
      return;
    }

    navigate("/checkout", {
      state: { cart, total, phone },
    });
  };

  // 🏠 Logout and return to home
  const handleLogout = () => {
    navigate("/");
  };

  // ===================== UI =====================
  return (
    <div
      style={{
        textAlign: "center",
        marginTop: "4rem",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      {/* 🔙 Logout Button */}
      <button
        onClick={handleLogout}
        style={{
          background: "red",
          color: "white",
          border: "none",
          padding: "6px 12px",
          borderRadius: "6px",
          cursor: "pointer",
          position: "absolute",
          top: "20px",
          left: "20px",
        }}
      >
        ⬅ Logout
      </button>

      {/* 👋 Welcome Message */}
      <h2 style={{ marginBottom: "0.5rem" }}>🍴 College Canteen</h2>
      <p style={{ color: "#666" }}>
        Welcome, {phone ? `+91 ${phone}` : "Guest"}
      </p>

      {/* 🍛 Menu Section */}
      <h3 style={{ marginTop: "2rem" }}>Menu</h3>

      {loading ? (
        <p>⏳ Loading menu...</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "20px",
            padding: "20px",
          }}
        >
          {menu.map((item) => (
            <div
              key={item.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "10px",
                padding: "1rem",
                background: "#fff",
                boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
              }}
            >
              <h4>{item.name}</h4>
              <p>₹{item.price}</p>
              <button
                onClick={() => addToCart(item)}
                style={{
                  background: "#28a745",
                  color: "#fff",
                  padding: "8px 14px",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 🛒 Cart Section */}
      <div
        style={{
          marginTop: "2rem",
          background: "#f8f9fa",
          borderRadius: "12px",
          padding: "1.5rem",
          display: "inline-block",
          textAlign: "left",
        }}
      >
        <h3>🛒 Cart</h3>
        {cart.length === 0 ? (
          <p>No items added yet.</p>
        ) : (
          <>
            {cart.map((c) => (
              <p key={c.id}>
                {c.name} × {c.qty} — ₹{c.price * c.qty}
                <button
                  onClick={() => removeFromCart(c.id, c.price)}
                  style={{
                    background: "red",
                    color: "white",
                    border: "none",
                    padding: "3px 7px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    marginLeft: "10px",
                  }}
                >
                  ❌
                </button>
              </p>
            ))}
            <h4 style={{ marginTop: "1rem" }}>Total: ₹{total}</h4>
            <button
              onClick={handleCheckout}
              style={{
                background: "#007bff",
                color: "white",
                padding: "10px 20px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                width: "100%",
                fontWeight: "bold",
              }}
            >
              💳 Proceed to Pay
            </button>
          </>
        )}
      </div>
    </div>
  );
}