// src/firebase/firestore.js
// === Firestore Config & Auth ===
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";

// 🔧 Konfigurasi Firebase Firestore
const firebaseConfigFirestore = {
  apiKey: "AIzaSyDsM-j-nbNPMdTz1irbXOXD1b8bS_mjrPk",
  authDomain: "sparm-b9de0.firebaseapp.com",
  projectId: "sparm-b9de0",
};

// Inisialisasi Firestore app (tanpa nama kedua, karena ini bisa jadi default app)
const firestoreApp = initializeApp(firebaseConfigFirestore, "firestoreApp");


// Buat instance Firestore & Auth
const firestore = getFirestore(firestoreApp);
const authFirestore = getAuth(firestoreApp);

// Fungsi login dengan email dan password
const loginFirestore = async () => {
  const email = "esp32@test.com";
  const password = "12345678";

  try {
    const userCredential = await signInWithEmailAndPassword(authFirestore, email, password);
    console.log("✅ Login Firestore berhasil:", userCredential.user.email);
  } catch (err) {
    console.error("❌ Gagal login Firestore:", err.message);
  }
};

// Pantau status login
onAuthStateChanged(authFirestore, (user) => {
  if (user) console.log("📘 Firestore user aktif:", user.email);
  else console.log("📘 Tidak ada user Firestore aktif.");
});

// Export semua yang kita butuhkan
export { firestore, authFirestore, loginFirestore };