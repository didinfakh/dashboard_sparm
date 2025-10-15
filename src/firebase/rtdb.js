// src/firebase/rtdb.js
// === Realtime Database Config & Auth ===
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database"; // Tambahkan import ref & onValue
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";

// 🔧 Konfigurasi Firebase RTDB
const firebaseConfigRTDB = {
  apiKey: "AIzaSyCwOjCx_FHmZdlIiW_3rLYx93-rvTFgzC4",
  databaseURL: "https://monitoring123-b4e41-default-rtdb.asia-southeast1.firebasedatabase.app/",
};

// Inisialisasi app untuk RTDB (gunakan nama unik agar tidak bentrok)
const rtdbApp = initializeApp(firebaseConfigRTDB, "rtdbApp");

// Buat instance database dan auth
const dbRTDB = getDatabase(rtdbApp);
const authRTDB = getAuth(rtdbApp);

// Fungsi login anonim ke RTDB
const loginRTDB = async () => {
  try {
    const userCredential = await signInAnonymously(authRTDB);
    console.log("✅ Login anonim RTDB berhasil:", userCredential.user.uid);
  } catch (err) {
    console.error("❌ Gagal login anonim RTDB:", err.message);
  }
};

// Opsional: pantau status login
onAuthStateChanged(authRTDB, (user) => {
  if (user) console.log("📡 RTDB user aktif:", user.uid);
  else console.log("📡 Tidak ada user RTDB aktif.");
});

// Export semua yang kita butuhkan
export { dbRTDB, authRTDB, loginRTDB, ref, onValue };
