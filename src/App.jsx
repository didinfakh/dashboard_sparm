// src/App.jsx

import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
// ✅ 1. Import 'useEffect'
import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import Dashboard1 from "./Dashboard1";
import Dashboard2 from "./Dashboard2";
import KwhForecastChart from "./KwhForecastChart";
// import ElectricalPanel3D from "./components/";

function Home() {
  return (
    <div>
      <h2>Home Page</h2>
      <p>Welcome to the Home page!</p>
    </div>
  );
}

function About() {
  return (
    <div>
      <h2>About Page</h2>
      <p>This is the About page.</p>
    </div>
  );
}

function App() {
  const [count, setCount] = useState(0);

  // ✅ 2. Tambahkan kode listener 'useEffect' di sini
  useEffect(() => {
    // Fungsi yang akan dieksekusi saat menerima pesan
    const handleMessage = (event) => {
      
      // ⚠️ PENTING: Ganti URL ini dengan URL dashboard WISE
      // tempat Anda menanamkan iframe ini.
      if (event.origin !== "https://URL-DASHBOARD-INDUK-ANDA.com") {
        console.warn("Pesan diterima dari origin yang tidak dikenal:", event.origin);
        return;
      }

      const data = event.data;
      
      // Periksa apakah perintahnya benar
      if (data && data.command === 'set-zoom') {
        // Terapkan zoom ke seluruh halaman
        document.body.style.zoom = data.level;
      }
    };

    // Mulai mendengarkan pesan
    window.addEventListener('message', handleMessage);

    // Bersihkan listener saat komponen dilepas
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []); // Array dependensi kosong berarti ini hanya berjalan sekali saat App dimuat


  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard2 />} />
        <Route path="/dashboard2" element={<Dashboard1 />} />
        <Route path="/kwh-forecast" element={<KwhForecastChart />} />
        {/* <Route path="/3d" element={<ElectricalPanel3D />} /> */}
      </Routes>
    </Router>
  );
}

export default App;