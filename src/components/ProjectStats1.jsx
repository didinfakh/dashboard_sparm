import React, { useEffect, useState } from "react";
import { db2 } from "../Firebase"; // Pastikan path ini benar
import { ref, onValue } from "firebase/database";
import { Toaster } from "react-hot-toast";

// === Komponen Bar Status ===
// ✅ [MODIFIKASI 1] StatBar sekarang menerima 'isWarning' untuk mengubah warna
const StatBar = ({ value = 0, min = 0, max = 100, isWarning = false }) => {
  const clampedValue = Math.max(min, Math.min(value, max));
  const percentage = max - min > 0 ? ((clampedValue - min) / (max - min)) * 100 : 0;
  
  const barColorClass = isWarning
    ? "bg-white/80" // Warna kontras saat kartu merah
    : "bg-gradient-to-r from-green-400 to-blue-500";

  return (
    <div className={`w-full rounded-full h-2.5 mt-auto ${isWarning ? 'bg-white/30' : 'bg-gray-200'}`}>
      <div
        className={`${barColorClass} h-2.5 rounded-full`}
        style={{ width: `${percentage}%`, transition: "width 0.5s ease-out" }}
      ></div>
    </div>
  );
};

// === Komponen StatCard untuk Pzem ===
// ✅ [MODIFIKASI 2] StatCard sekarang menerima 'isWarning' untuk mengubah background
const StatCard = ({
  title,
  displayValue,
  satuan,
  variant = "default",
  barValue,
  barMin,
  barMax,
  isWarning = false,
}) => {
  const isPrimary = variant === "primary";
  const cardClasses = `p-4 md:p-6 rounded-2xl shadow-sm flex flex-col transition-colors duration-500 ease-in-out ${
    isWarning
      ? "bg-gradient-to-br from-red-500 to-rose-600 text-white" // Warna merah jika ada peringatan
      : isPrimary
      ? "bg-gradient-to-br from-indigo-500 to-blue-600 text-white"
      : "bg-white text-gray-800"
  }`;

  return (
    <div className={`${cardClasses} min-h-[140px] md:min-h-[160px] lg:min-h-[180px]`}>
      <div>
        <h3 className="font-semibold text-2xl md:text-xl mb-2">{title}</h3>
        <p className="text-3xl md:text-4xl lg:text-5xl font-bold">{`${displayValue} ${satuan}`}</p>
      </div>
      <StatBar value={barValue} min={barMin} max={barMax} isWarning={isWarning} />
    </div>
  );
};

// === Komponen khusus untuk Archmeter ===
// ✅ [MODIFIKASI 3] ArchmeterStatCard juga menerima 'isWarning'
const ArchmeterStatCard = ({
  title,
  displayValue,
  satuan,
  variant = "default",
  barValue,
  barMin,
  barMax,
  isWarning = false,
}) => {
  const isPrimary = variant === "primary";
  const cardClasses = `p-4 md:p-6 rounded-2xl shadow-sm flex flex-col transition-colors duration-500 ease-in-out ${
    isWarning
      ? "bg-gradient-to-br from-red-500 to-rose-600 text-white" // Warna merah jika ada peringatan
      : isPrimary
      ? "bg-gradient-to-br from-indigo-500 to-blue-600 text-white"
      : "bg-white text-gray-800"
  }`;

  return (
    <div className={`${cardClasses} min-h-[140px] md:min-h-[160px] lg:min-h-[180px]`}>
      <div>
        <div className="flex justify-between items-baseline">
          <h3 className="font-semibold text-2xl md:text-xl">{title}</h3>
          <p className="text-2xl md:text-2xl lg:text-4xl font-bold">{`${displayValue} ${satuan}`}</p>
        </div>
      </div>
      <StatBar value={barValue} min={barMin} max={barMax} isWarning={isWarning} />
    </div>
  );
};

// --- Konfigurasi Kartu (tidak ada perubahan) ---
const pzemStatsConfig = [
    { title: "Voltage", id: "Tegangan", satuan: "V", min: 190, max: 240, formatter: (val) => (val ? val.toFixed(1) : "0.0") },
    { title: "Total Power", id: "Daya", satuan: "kW", min: 0, max: 2500, formatter: (val) => (val ? (val / 1000).toFixed(2) : "0.00") },
    { title: "Energy Delivered", id: "Energi", satuan: "kWh", min: 0, max: 50, formatter: (val) => (val ? val.toFixed(2) : "0.00") },
    { title: "Frequency", id: "Frekuensi", satuan: "Hz", min: 49, max: 51, formatter: (val) => (val ? val.toFixed(1) : "0.0"), variant: "primary" },
];
const archmeterStatsConfig = [
    { title: "Voltage", id: "Voltage_Avg_L_N", satuan: "V", min: 190, max: 240, formatter: (val) => (val ? val.toFixed(2) : "0.00") },
    { title: "Frequency", id: "Frequency", satuan: "Hz", min: 49, max: 51, formatter: (val) => (val ? val.toFixed(2) : "0.00"), variant: "primary" },
];
const allConfigs = [...pzemStatsConfig, ...archmeterStatsConfig]; // Gabungkan konfigurasi untuk pengecekan

// === Komponen Section Pzem ===
// ✅ [MODIFIKASI 4] Section sekarang menerima dan meneruskan 'warningFields'
const PzemSection = ({ panelData, warningFields }) => (
  <div className="bg-gray-200 rounded-2xl p-4 md:p-6 xl:p-8 w-full">
    <h1 className="text-xl sm:text-2xl lg:text-2xl font-bold mb-4 md:mb-6">Pzem 004T Monitoring</h1>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {pzemStatsConfig.map((stat, index) => {
        const rawValue = panelData[stat.id] || 0;
        return (
          <StatCard
            key={index}
            {...stat}
            displayValue={stat.formatter(rawValue)}
            barValue={rawValue}
            barMin={stat.min}
            barMax={stat.max}
            isWarning={warningFields.includes(stat.id)} // Kirim status warning ke kartu
          />
        );
      })}
    </div>
  </div>
);

// === Komponen Section Archmeter ===
// ✅ [MODIFIKASI 5] Section sekarang menerima dan meneruskan 'warningFields'
const ArchmeterSection = ({ panelData, warningFields }) => (
  <div className="bg-gray-200 rounded-2xl p-4 md:p-6 xl:p-8 w-full">
    <h1 className="text-xl sm:text-2xl lg:text-2xl font-bold mb-4 md:mb-6">Archmeter PA330 monitoring</h1>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
      {archmeterStatsConfig.map((stat, index) => {
        const rawValue = panelData[stat.id] || 0;
        return (
          <ArchmeterStatCard
            key={index}
            {...stat}
            displayValue={stat.formatter(rawValue)}
            barValue={rawValue}
            barMin={stat.min}
            barMax={stat.max}
            isWarning={warningFields.includes(stat.id)} // Kirim status warning ke kartu
          />
        );
      })}
    </div>
  </div>
);

// === Komponen Utama (Container) ===
export const ProjectStats1 = () => {
  const [panelData, setPanelData] = useState({});
  // ✅ [MODIFIKASI 6] State untuk menyimpan daftar field yang bermasalah
  const [warningFields, setWarningFields] = useState([]);

  useEffect(() => {
    const pzemRef = ref(db2, "pzem");
    const panelRef = ref(db2, "Panel1");

    const updateDataAndWarnings = (newData) => {
        setPanelData((prev) => {
            const combinedData = { ...prev, ...newData };

            // Cek data yang di luar batas
            const exceeded = allConfigs.filter(stat => {
                const value = combinedData[stat.id];
                return value !== undefined && (value < stat.min || value > stat.max);
            }).map(stat => stat.id); // Ambil ID-nya saja

            setWarningFields(exceeded);
            return combinedData;
        });
    };

    const unsubPzem = onValue(pzemRef, (snapshot) => {
      if (snapshot.exists()) updateDataAndWarnings(snapshot.val());
    });
    const unsubPanel = onValue(panelRef, (snapshot) => {
      if (snapshot.exists()) updateDataAndWarnings(snapshot.val());
    });

    return () => {
      unsubPzem();
      unsubPanel();
    };
  }, []);

  return (
    <div className="font-sans w-full min-h-screen bg-gray-100 flex flex-col items-center p-0 sm:p-6 lg:p-8">
      <div className="w-full flex flex-col gap-6 md:gap-8 m-0">
        {/* ✅ [MODIFIKASI 7] Kirim state warning ke setiap section */}
        <PzemSection panelData={panelData} warningFields={warningFields} />
        <ArchmeterSection panelData={panelData} warningFields={warningFields} />
      </div>
      <Toaster />
    </div>
  );
};

export default ProjectStats1;