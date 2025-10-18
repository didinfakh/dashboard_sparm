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

const EnergyCard = ({ edel }) => {
  return (
    <div className="py-5 px-4 rounded-xl shadow-md h-30 flex flex-col justify-center bg-white text-gray-800">
      <div className="flex items-center gap-4">
        <BsLightningChargeFill size={28} className="text-blue-600 opacity-80" />
        <div>
          <div className="text-base font-semibold text-gray-600 mb-1">Energy Delivered</div>
          <div className="font-bold text-xl">
            {/* ✅ PERUBAHAN DI SINI: Format angka di dalam komponen ini */}
            {/* Math.round() untuk menghilangkan desimal, toLocaleString() untuk pemisah ribuan */}
            {`${Math.round(edel || 0).toLocaleString("id-ID")} kWh`}
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
            {`${predictedKwh.toFixed(1)} kWh`}
          </div>
        </div>
      </div>
      
      {/* Garis pemisah */}
      <hr className="border-t border-gray-900/20 my-1" />

      {/* Bagian Prediksi Biaya */}
      <div className="flex items-center gap-2 md:gap-3">
        <FaMoneyBillWave size={20} md:size={24} className="text-yellow-900 opacity-70" />
        <div>
          <div className="text-xs md:text-sm font-medium text-gray-800 opacity-90">Estimated Cost</div>
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

  useEffect(() => {
    const panelRef = ref(db2, "sensor_data");
    const unsubscribe = onValue(
      panelRef,
      (snapshot) => {
        const data = snapshot.val();
        // ✅ PERUBAHAN DI SINI: Mengambil nilai 'Edel' asli tanpa format
        if (data && typeof data.Edel !== 'undefined') {
          setEdel(data.Edel);
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
              <ProjectStats /> 
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 w-full">
              
              <div className="col-span-1 lg:col-span-4 bg-white p-6 rounded-lg shadow-xl w-[100%]">
                <h2 className="text-xl font-semibold mb-4 text-black">Record Prediction</h2>
                <KwhForecastChart />
              </div>

              <div className="col-span-1 flex flex-col gap-6 ">
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