// Dashboard2.jsx (ATAU NAMA FILE ASLI ANDA)

import React, { useEffect, useState } from "react";

// Icons
import { IoChatbubblesOutline } from "react-icons/io5";
import { BsLightningChargeFill } from "react-icons/bs";
import { FaMoneyBillWave } from "react-icons/fa";

// Firebase
import { db2, dbDatabase } from "./Firebase";
import { onValue, ref } from "firebase/database";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";

// Charting
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title } from "chart.js";
import KwhForecastChart from "./KwhForecastChart";

// Child Components
import ProjectStats from "./components/ProjectStats ";
import SchneiderPanel from "./components/SchneiderPanel";

// Registrasi ChartJS
ChartJS.register( ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title );

// =================================================================================
// === SUB-KOMPONEN KARTU STATISTIK ================================================
// =================================================================================

// ✅ PERUBAHAN DI SINI: PowerCard diubah menjadi EnergyCard (menampilkan Edel)
const EnergyCard = ({ edel }) => {
  return (
    <div className="py-5 px-4 rounded-xl shadow-md h-30 flex flex-col justify-center bg-white text-gray-800"> {/* ✅ Tinggi & padding disesuaikan, warna latar belakang */}
      <div className="flex items-center gap-4"> {/* ✅ gap ditingkatkan */}
        <BsLightningChargeFill size={28} className="text-blue-600 opacity-80" /> {/* ✅ Ukuran ikon disesuaikan */}
        <div>
          <div className="text-base font-semibold text-gray-600 mb-1">Energy Delivered</div> {/* ✅ Ukuran & font-weight teks judul */}
          <div className="font-bold text-xl"> {/* ✅ Ukuran font nilai edel */}
            {`${edel || 0} kWh`}
          </div>
        </div>
      </div>
    </div>
  );
};

const PredictionCard = ({ summary }) => {
  const predictedKwh = summary?.predicted_total_kwh || 0;
  const predictedCost = summary?.predicted_total_cost || 0;

  return (
    <div className="p-4 rounded-xl shadow-md h-50 flex flex-col justify-around bg-[#ffd53f] text-black">
      {/* Bagian Prediksi Kwh */}
      <div className="flex items-center gap-3">
        <BsLightningChargeFill size={24} className="text-yellow-900 opacity-70" />
        <div>
          <div className="text-sm font-medium text-gray-800 opacity-90">Prediction per Month</div>
          <div className="font-bold text-lg">
            {/* ✅ Dibulatkan menjadi 1 angka di belakang koma */}
            {`${predictedKwh.toFixed(1)} kWh`}
          </div>
        </div>
      </div>
      
      {/* Garis pemisah */}
      <hr className="border-t border-gray-900/20 my-1" />

      {/* Bagian Prediksi Biaya */}
      <div className="flex items-center gap-2 md:gap-3"> {/* Gap lebih kecil di mobile */}
  
        {/* Ukuran ikon responsif: 20px di mobile, 24px di desktop */}
        <FaMoneyBillWave size={20} md:size={24} className="text-yellow-900 opacity-70" />
        
        <div>
          {/* Ukuran font responsif */}
          <div className="text-xs md:text-sm font-medium text-gray-800 opacity-90">Estimated Cost</div>
          
          {/* Ukuran font responsif */}
          <div className="font-bold text-base md:text-lg">
            {`Rp. ${Math.round(predictedCost).toLocaleString("id-ID")}`}
          </div>
        </div>
      </div>
    </div>
  );
};


// =================================================================================
// === KOMPONEN UTAMA DASHBOARD ===================================================
// =================================================================================

const Dashboard2 = () => {
  const [monthSummary, setMonthSummary] = useState(null);
  // ✅ PERUBAHAN DI SINI: State diubah dari ptot ke edel
  const [edel, setEdel] = useState(0);

  // useEffect untuk Firestore (tidak ada perubahan)
  useEffect(() => {
    const getFirestoreData = async () => {
      try {
        const q = query(
          collection(dbDatabase, "monthly_forecast_summary"),
          orderBy("created_at", "desc"),
          limit(1)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const lastData = snapshot.docs.map((doc) => doc.data());
          setMonthSummary(lastData[0]);
        }
      } catch (error) {
        console.error("Gagal ambil data Firestore:", error);
      }
    };
    getFirestoreData();
  }, []);

  // ✅ PERUBAHAN DI SINI: Mengambil data 'Edel' bukan 'Ptot'
  useEffect(() => {
    const panelRef = ref(db2, "sensor_data");
    const unsubscribe = onValue(
      panelRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data?.Edel) {
          // ✅ Format data Edel di sini (dibagi 100, 1 desimal)
          setEdel((data.Edel / 100).toFixed(1));
        }
      },
      (error) => {
        console.error("Error membaca data sensor:", error);
      }
    );
    return () => unsubscribe();
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      <div className="p-6">
        <main className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* --- KOLOM 1: Panel 3D --- */}
          <div className="lg:col-span-1 relative flex h-full bottom-0 mb-0">
            <SchneiderPanel />
          </div>

          {/* --- KOLOM 2: Konten Utama (Statistik & Grafik) --- */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            
            <div className="bg-gray-200 p-4 rounded-2xl">
              {/* ProjectStats sekarang menampilkan Ptot, bukan Edel */}
              <ProjectStats /> 
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 w-full">
              
              <div className="col-span-1 lg:col-span-4 bg-white p-6 rounded-lg shadow-xl w-[100%]">
                <h2 className="text-xl font-semibold mb-4 text-black">Record Prediction</h2>
                <KwhForecastChart />
              </div>

              <div className="col-span-1 flex flex-col gap-6 ">
                {/* ✅ PERUBAHAN DI SINI: Merender EnergyCard dengan data edel */}
                <EnergyCard edel={edel} /> 
                <PredictionCard summary={monthSummary} />
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard2;