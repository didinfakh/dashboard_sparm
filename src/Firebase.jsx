// src/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";

// Konfigurasi Firebase kamu
const firebaseConfig = {
  apiKey: "AIzaSyDsM-j-nbNPMdTz1irbXOXD1b8bS_mjrPk",
  authDomain: "sparm-b9de0.firebaseapp.com",
  databaseURL:
    "https://sparm-b9de0-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "sparm-b9de0",
  storageBucket: "sparm-b9de0.appspot.com",
  messagingSenderId: "392722658131",
  appId: "1:392722658131:web:44007f4a16f124297fe7a6",
};

const firebaseConfig2 = {
  apiKey: "AIzaSyCwOjCx_FHmZdlIiW_3rLYx93-rvTFgzC4",
  authDomain: "monitoring123-b4e41.firebaseapp.com",
  databaseURL:
    "https://monitoring123-b4e41-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "monitoring123-b4e41",
  storageBucket: "monitoring123-b4e41.firebasestorage.app",
  messagingSenderId: "1054527536237",
  appId: "1:1054527536237:web:6771beda5d43d1e7afd364",
  measurementId: "G-H8CFJVTK1Z",
};
// Pastikan hanya inisialisasi sekali
const app = getApps().find((app) => app.name === "[DEFAULT]")
  ? getApp()
  : initializeApp(firebaseConfig);
const app2 = getApps().find((app) => app.name === "secondary")
  ? getApp("secondary")
  : initializeApp(firebaseConfig2, "secondary");

// Gunakan Realtime Database, bukan Firestore
export const db = getDatabase(app);
export const dbDatabase = getFirestore(app);
export const db2 = getDatabase(app2);
