import React, { useEffect, useState } from "react";
import { db2 } from "../Firebase"; // Pastikan path ini benar
import { ref, onValue } from "firebase/database";
import { Toaster } from "react-hot-toast";

// === Komponen Bar Status ===
const StatBar = ({ value = 0, min = 0, max = 100 }) => {
  const clampedValue = Math.max(min, Math.min(value, max));
  const percentage = max - min > 0 ? ((clampedValue - min) / (max - min)) * 100 : 0;

  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-auto">
      <div
        className="bg-gradient-to-r from-green-400 to-blue-500 h-2.5 rounded-full"
        style={{ width: `${percentage}%`, transition: "width 0.5s ease-out" }}
      ></div>
    </div>
  );
};

// === Komponen StatCard untuk Pzem ===
const StatCard = ({
  title,
  displayValue,
  satuan,
  variant = "default",
  barValue,
  barMin,
  barMax,
}) => {
  const isPrimary = variant === "primary";
  const cardClasses = `p-4 md:p-6 rounded-2xl shadow-sm flex flex-col ${
    isPrimary
      ? "bg-gradient-to-br from-indigo-500 to-blue-600 text-white"
      : "bg-white text-gray-800"
  }`;

  return (
    <div className={`${cardClasses} min-h-[140px] md:min-h-[160px] lg:min-h-[180px]`}>
      <div>
        <h3 className="font-semibold text-base md:text-lg mb-2">{title}</h3>
        <p className="text-3xl md:text-4xl lg:text-5xl font-bold">{`${displayValue} ${satuan}`}</p>
      </div>
      <StatBar value={barValue} min={barMin} max={barMax} />
    </div>
  );
};

// === Komponen khusus untuk Archmeter ===
const ArchmeterStatCard = ({
  title,
  displayValue,
  satuan,
  variant = "default",
  barValue,
  barMin,
  barMax,
}) => {
  const isPrimary = variant === "primary";
  const cardClasses = `p-4 md:p-6 rounded-2xl shadow-sm flex flex-col ${
    isPrimary
      ? "bg-gradient-to-br from-indigo-500 to-blue-600 text-white"
      : "bg-white text-gray-800"
  }`;

  return (
    <div className={`${cardClasses} min-h-[140px] md:min-h-[160px] lg:min-h-[180px]`}>
      <div>
        <div className="flex justify-between items-baseline">
          <h3 className="font-semibold text-xl md:text-lg">{title}</h3>
          <p className="text-3xl md:text-4xl lg:text-5xl font-bold">{`${displayValue} ${satuan}`}</p>
        </div>
      </div>
      <StatBar value={barValue} min={barMin} max={barMax} />
    </div>
  );
};

// --- Konfigurasi Kartu ---
const pzemStatsConfig = [
    { title: "Voltage", id: "Tegangan", satuan: "V", min: 190, max: 240, formatter: (val) => (val ? val.toFixed(1) : "0.0") },
    { title: "Total Power", id: "Daya", satuan: "KW", min: 0, max: 2500, formatter: (val) => (val ? (val / 1000).toFixed(2) : "0.00") },
    { title: "Energy Delivered", id: "Energi", satuan: "KWH", min: 0, max: 50, formatter: (val) => (val ? val.toFixed(2) : "0.00") },
    { title: "Frequency", id: "Frekuensi", satuan: "Hz", min: 49, max: 51, formatter: (val) => (val ? val.toFixed(1) : "0.0"), variant: "primary" },
];
const archmeterStatsConfig = [
    { title: "Voltage", id: "Voltage_Avg_L_N", satuan: "V", min: 190, max: 240, formatter: (val) => (val ? val.toFixed(2) : "0.00") },
    { title: "Frequency", id: "Frequency", satuan: "Hz", min: 49, max: 51, formatter: (val) => (val ? val.toFixed(2) : "0.00"), variant: "primary" },
];

// === Komponen Section Pzem ===
const PzemSection = ({ panelData }) => (
  <div className="bg-gray-200 rounded-2xl p-4 md:p-6 xl:p-8 w-full">
    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 md:mb-6">Pzem 004T Monitoring</h1>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {pzemStatsConfig.map((stat, index) => {
        const rawValue = panelData[stat.id] || 0;
        return <StatCard key={index} {...stat} displayValue={stat.formatter(rawValue)} barValue={rawValue} barMin={stat.min} barMax={stat.max} />;
      })}
    </div>
  </div>
);

// === Komponen Section Archmeter ===
const ArchmeterSection = ({ panelData }) => (
  <div className="bg-gray-200 rounded-2xl p-4 md:p-6 xl:p-8 w-full">
    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 md:mb-6">Archmeter PA330</h1>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
      {archmeterStatsConfig.map((stat, index) => {
        const rawValue = panelData[stat.id] || 0;
        return <ArchmeterStatCard key={index} {...stat} displayValue={stat.formatter(rawValue)} barValue={rawValue} barMin={stat.min} barMax={stat.max} />;
      })}
    </div>
  </div>
);

// === Komponen Utama (Container) ===
export const ProjectStats1 = () => {
  const [panelData, setPanelData] = useState({});

  useEffect(() => {
    const pzemRef = ref(db2, "pzem");
    const panelRef = ref(db2, "Panel1");
    const unsubPzem = onValue(pzemRef, (snapshot) => {
      if (snapshot.exists()) setPanelData((prev) => ({ ...prev, ...snapshot.val() }));
    });
    const unsubPanel = onValue(panelRef, (snapshot) => {
      if (snapshot.exists()) setPanelData((prev) => ({ ...prev, ...snapshot.val() }));
    });
    return () => {
      unsubPzem();
      unsubPanel();
    };
  }, []);

  return (
    // [MODIFIKASI 1] 'justify-center' dihapus agar konten mulai dari atas.
    <div className="font-sans w-full min-h-screen bg-gray-100 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      {/* [MODIFIKASI 2] 'max-w-screen-xl' dihapus agar kontainer melebar penuh. */}
      <div className="w-full flex flex-col gap-6 md:gap-8">
        <PzemSection panelData={panelData} />
        <ArchmeterSection panelData={panelData} />
      </div>
      <Toaster />
    </div>
  );
};

export default ProjectStats1;