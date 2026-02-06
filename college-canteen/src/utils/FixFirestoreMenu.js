import { db } from "../firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

// 🧹 One-time Firestore menu field normalizer
export async function fixFirestoreMenu() {
  try {
    console.log("🛠️ Starting Firestore menu fix...");

    const menuRef = collection(db, "menu");
    const snapshot = await getDocs(menuRef);

    if (snapshot.empty) {
      console.warn("⚠️ No documents found in 'menu' collection!");
      return;
    }

    for (const d of snapshot.docs) {
      const data = d.data();
      const docRef = doc(db, "menu", d.id);

      // Normalize fields
      const cleanName =
        data.name || data.itemName || data.Item || data.title || d.id;
      const cleanPrice =
        typeof data.price === "number"
          ? data.price
          : parseFloat(String(data.price || data.Price || data.cost || 0).replace(/[^\d.]/g, "")) || 0;
      const cleanAvailable =
        typeof data.available === "number"
          ? data.available
          : parseInt(String(data.available || data.stock || 10)) || 10;

      // Update Firestore
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
}