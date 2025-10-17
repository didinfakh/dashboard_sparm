import React, { useEffect, useState } from "react";

// Icons
import { IoChatbubblesOutline } from "react-icons/io5";
import { BsLightningChargeFill } from "react-icons/bs"; // <-- Ikon baru
import { FaMoneyBillWave } from "react-icons/fa";       // <-- Ikon baru

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
// === SUB-KOMPONEN KARTU STATISTIK (TELAH DIDISAIN ULANG) ==========================
// =================================================================================

const PowerCard = ({ ptot, maxPower = 500 }) => { // Tambahkan prop maxPower
  // Menghitung persentase untuk progress bar, pastikan tidak lebih dari 100%
  const percentage = Math.min((ptot / maxPower) * 100, 100);

  return (
    <div className="p-4 rounded-xl shadow-md h-40 flex flex-col justify-between text-black bg-white">
      <div>
        <div className="text-sm font-medium text-gray-500">Power Total</div>
        <div className="text-3xl font-bold mt-1">{`${ptot || 0} Kw`}</div>
      </div>
      <div className="w-full">
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
          <div 
            className="bg-blue-600 h-2.5 rounded-full" 
            style={{ width: `${percentage}%`, transition: 'width 0.5s ease-in-out' }}
          ></div>
        </div>
        <div className="text-xs text-right text-gray-400">{`Capacity: ${maxPower} Kw`}</div>
      </div>
    </div>
  );
};

const PredictionCard = ({ summary }) => {
  const predictedKwh = summary?.predicted_total_kwh || 0;
  const predictedCost = summary?.predicted_total_cost || 0;

  return (
    <div className="p-4 rounded-xl shadow-md h-40 flex flex-col justify-around bg-[#ffd53f] text-black">
      {/* Bagian Prediksi Kwh */}
      <div className="flex items-center gap-3">
        <BsLightningChargeFill size={24} className="text-yellow-900 opacity-70" />
        <div>
          <div className="text-xs font-medium text-gray-800 opacity-90">Prediction per Month</div>
          <div className="font-bold text-lg">
            {`${Math.round(predictedKwh * 100) / 100} Kwh`}
          </div>
        </div>
      </div>
      
      {/* Garis pemisah */}
      <hr className="border-t border-gray-900/20 my-1" />

      {/* Bagian Prediksi Biaya */}
      <div className="flex items-center gap-3">
        <FaMoneyBillWave size={24} className="text-yellow-900 opacity-70" />
        <div>
          <div className="text-xs font-medium text-gray-800 opacity-90">Estimated Cost</div>
          <div className="font-bold text-lg">
            {`Rp. ${predictedCost.toLocaleString("id-ID")}`}
          </div>
        </div>
      </div>
    </div>
  );
};


// =================================================================================
// === KOMPONEN UTAMA DASHBOARD (Struktur Sama) ====================================
// =================================================================================

const Dashboard2 = () => {
  const [monthSummary, setMonthSummary] = useState(null);
  const [ptot, setPtot] = useState(0);

  // ... (useEffect hooks tidak ada perubahan)
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
        if (data?.Ptot) {
          setPtot(data.Ptot);
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
              
              <div className="col-span-1 lg:col-span-4 bg-white p-6 rounded-lg shadow-xl">
                <h2 className="text-xl font-semibold mb-4 text-black">Record Prediction</h2>
                <KwhForecastChart />
              </div>

              <div className="col-span-1 flex flex-col gap-6">
                {/* PENTING: Sesuaikan nilai maxPower di sini */}
                <PowerCard ptot={ptot} maxPower={500} /> 
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