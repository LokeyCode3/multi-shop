import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocsFromServer,
  addDoc,
  Timestamp,
  updateDoc,
  doc,
  query,
} from "firebase/firestore";
import { QRCodeCanvas } from "qrcode.react";

export default function StudentDashboard() {
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [orderQR, setOrderQR] = useState(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  // 🧹 Normalize Firestore data once
  const fixFirestoreMenu = async () => {
    try {
      console.log("🛠️ Starting Firestore menu normalization...");
      const menuRef = collection(db, "menu");
      const snapshot = await getDocsFromServer(query(menuRef));

      for (const d of snapshot.docs) {
        const data = d.data();
        const docRef = doc(db, "menu", d.id);

        const cleanName =
          data.name || data.itemName || data.Item || data.title || d.id;
        const cleanPrice =
          typeof data.price === "number"
            ? data.price
            : parseFloat(
                String(data.price || data.Price || data.cost || 0).replace(/[^\d.]/g, "")
              ) || 0;
        const cleanAvailable =
          typeof data.available === "number"
            ? data.available
            : parseInt(String(data.available || data.stock || 10)) || 10;

        await updateDoc(docRef, {
          name: cleanName,
          price: cleanPrice,
          available: cleanAvailable,
        });

        console.log(
          `✅ Fixed ${d.id}: { name: '${cleanName}', price: ${cleanPrice}, available: ${cleanAvailable} }`
        );
      }

      console.log("🎉 Firestore menu successfully normalized!");
    } catch (err) {
      console.error("❌ Error fixing Firestore menu:", err);
    }
  };

  // 🔄 Fetch menu — always from server (no cache)
  const fetchMenu = async () => {
    console.log("📡 Fetching Firestore menu data (live from server)...");
    setLoading(true);
    setError("");

    try {
      const q = query(collection(db, "menu"));
      const querySnapshot = await getDocsFromServer(q); // 🚀 Always fresh data
      console.log("🔥 RAW Firestore snapshot data:");
      querySnapshot.docs.forEach((doc) =>
        console.log(doc.id, "=>", doc.data())
      );

      const items = querySnapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        const rawPrice = data.price ?? data.Price ?? data.cost ?? 0;
        const safePrice =
          typeof rawPrice === "number"
            ? rawPrice
            : parseFloat(String(rawPrice).replace(/[^\d.]/g, "")) || 0;

        const rawAvailable = data.available ?? data.stock ?? 10;
        const safeAvailable =
          typeof rawAvailable === "number"
            ? rawAvailable
            : parseInt(String(rawAvailable).replace(/[^\d]/g, "")) || 10;

        const safeName =
          data.name ||
          data.itemName ||
          data.Item ||
          data.title ||
          `Unnamed-${docSnap.id}`;

        return {
          id: docSnap.id,
          name: safeName,
          price: safePrice,
          available: safeAvailable,
        };
      });

      console.log("📋 Loaded and normalized Firestore menu:", items);

      if (items.length === 0) setError("No menu items found in Firestore 😞");
      const sorted = [...items].sort((a, b) => a.name.localeCompare(b.name));
      setMenu(sorted);
    } catch (error) {
      console.error("❌ Firestore fetch error:", error);
      setError("⚠️ Could not load menu. Check Firestore rules or network.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch menu once on mount
  useEffect(() => {
    fetchMenu();
  }, []);

  // 🔧 Optional Firestore cleanup once (uncomment to fix all docs permanently)
  // useEffect(() => {
  //   fixFirestoreMenu();
  // }, []);

  // 🛒 Add item to cart
  const addToCart = (item) => {
    if (item.available <= 0) {
      alert("⚠️ This item is out of stock!");
      return;
    }
    const price = Number(item.price) || 0;
    setCart((prevCart) => {
      const existing = prevCart.find((c) => c.id === item.id);
      if (existing) {
        return prevCart.map((c) =>
          c.id === item.id ? { ...c, qty: c.qty + 1 } : c
        );
      }
      return [...prevCart, { ...item, qty: 1 }];
    });
    setTotal((prev) => prev + price);
  };

  // ❌ Remove item
  const removeFromCart = (id, price) => {
    const item = cart.find((c) => c.id === id);
    if (!item) return;
    const priceNum = Number(price) || 0;
    const qtyTotal = priceNum * item.qty;
    setCart((prev) => prev.filter((c) => c.id !== id));
    setTotal((prev) => Math.max(prev - qtyTotal, 0));
  };

  // 💳 Checkout
  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert("🛒 Your cart is empty!");
      return;
    }
    setProcessing(true);
    const orderData = {
      items: cart.map((item) => ({
        name: item.name,
        price: item.price,
        qty: item.qty,
      })),
      total,
      orderId: Math.random().toString(36).substr(2, 9).toUpperCase(),
      time: new Date().toLocaleString(),
      createdAt: Timestamp.now(),
    };
    try {
      await addDoc(collection(db, "orders"), orderData);
      setOrderQR(orderData);
      setCart([]);
      setTotal(0);
      alert("✅ Order placed successfully! QR code generated below.");
    } catch (error) {
      console.error("❌ Error saving order:", error);
      alert("❌ Failed to save order in Firestore.");
    } finally {
      setProcessing(false);
    }
  };

  // 🕓 Loading UI
  if (loading)
    return (
      <div style={{ textAlign: "center", marginTop: "6rem", fontFamily: "Poppins, sans-serif" }}>
        <h3>⏳ Loading menu from canteen...</h3>
      </div>
    );

  // ⚠️ Error UI
  if (error)
    return (
      <div style={{ textAlign: "center", marginTop: "5rem", fontFamily: "Poppins, sans-serif" }}>
        <h2>⚠️ {error}</h2>
        <button
          onClick={fetchMenu}
          style={{
            marginTop: "20px",
            background: "#007bff",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          🔄 Retry Fetch
        </button>
      </div>
    );

  // ✅ Main UI
  return (
    <div style={{ padding: "2rem", textAlign: "center", fontFamily: "Poppins, sans-serif", background: "#f4f6fb", minHeight: "100vh" }}>
      <h2 style={{ color: "#222", marginBottom: "1.5rem" }}>🍴 College Canteen Menu</h2>

      <button
        onClick={fetchMenu}
        style={{
          background: "#ffc107",
          color: "black",
          padding: "8px 14px",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontWeight: "500",
          marginBottom: "1rem",
        }}
      >
        🔄 Refresh Menu
      </button>

      {/* Menu Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "3rem" }}>
        {menu.map((item) => (
          <div
            key={item.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "12px",
              padding: "1rem",
              background: "white",
              boxShadow: "0px 3px 10px rgba(0,0,0,0.08)",
              transition: "transform 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <h3 style={{ color: "#007bff" }}>{item.name}</h3>
            <p>₹{item.price > 0 ? item.price.toFixed(0) : "N/A"}</p>
            {item.available <= 0 ? (
              <p style={{ color: "red", fontWeight: "bold" }}>Out of Stock</p>
            ) : (
              <button
                onClick={() => addToCart(item)}
                style={{
                  background: "#28a745",
                  color: "white",
                  border: "none",
                  padding: "10px 16px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  width: "100%",
                  fontWeight: "500",
                }}
              >
                Add to Cart
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Cart Section */}
      <div style={{ background: "white", borderRadius: "12px", padding: "1.5rem", maxWidth: "600px", marginInline: "auto", boxShadow: "0px 3px 10px rgba(0,0,0,0.08)" }}>
        <h3>🛒 Your Cart</h3>
        {cart.length === 0 ? (
          <p style={{ color: "#666" }}>No items in your cart yet</p>
        ) : (
          <>
            {cart.map((c) => (
              <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "10px 0" }}>
                <span>
                  {c.name} × {c.qty} — ₹{(c.price * c.qty).toFixed(0)}
                </span>
                <button
                  onClick={() => removeFromCart(c.id, c.price)}
                  style={{ background: "red", color: "white", border: "none", borderRadius: "4px", padding: "4px 10px", cursor: "pointer" }}
                >
                  ❌
                </button>
              </div>
            ))}
            <h4>Total: ₹{total.toFixed(0)}</h4>
            <button
              onClick={handleCheckout}
              disabled={processing}
              style={{
                background: processing ? "#ccc" : "#007bff",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "8px",
                cursor: processing ? "not-allowed" : "pointer",
                marginTop: "10px",
                fontWeight: "500",
              }}
            >
              {processing ? "Processing..." : "Proceed to Pay"}
            </button>
          </>
        )}
      </div>

      {/* QR Section */}
      {orderQR && (
        <div style={{ marginTop: "3rem", background: "white", padding: "2rem", borderRadius: "12px", maxWidth: "400px", marginInline: "auto", boxShadow: "0px 4px 10px rgba(0,0,0,0.1)" }}>
          <h3>🎟️ Your Order QR Code</h3>
          <QRCodeCanvas value={JSON.stringify(orderQR)} size={200} includeMargin={true} />
          <div style={{ marginTop: "1rem", textAlign: "left" }}>
            <p><b>Order ID:</b> {orderQR.orderId}</p>
            <p><b>Total:</b> ₹{orderQR.total.toFixed(0)}</p>
            <p><b>Time:</b> {orderQR.time}</p>
          </div>
        </div>
      )}
    </div>
  );
}