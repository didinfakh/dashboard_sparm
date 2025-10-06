// src/firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getDatabase } from "firebase/database";

// Konfigurasi Firebase kamu
const firebaseConfig = {
  apiKey: "AIzaSyDsM-j-nbNPMdTz1irbXOXD1b8bS_mjrPk",
  authDomain: "sparm-b9de0.firebaseapp.com",
  databaseURL: "https://sparm-b9de0-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "sparm-b9de0",
  storageBucket: "sparm-b9de0.appspot.com",
  messagingSenderId: "392722658131",
  appId: "1:392722658131:web:44007f4a16f124297fe7a6"
};

// Pastikan hanya inisialisasi sekali
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// Gunakan Realtime Database, bukan Firestore
export const db = getDatabase(app);
