// components/ProjectStats.jsx (ATAU NAMA FILE ASLI ANDA)

import React, { useEffect, useState } from "react";
import { BsCalendarWeek } from "react-icons/bs";
import { IoChatbubblesOutline } from "react-icons/io5";
import { db2 } from "../Firebase";
import { ref, onValue } from "firebase/database";

// Komponen StatCard (tidak ada perubahan)
const StatCard = ({ title, id, panelData, satuan, progress = 0, variant = "default", isWarning = false }) => {
  const isPrimary = variant === "primary";
  const cardClasses = `p-5 rounded-2xl shadow-sm flex flex-col justify-between transition-colors duration-500 ease-in-out ${isWarning ? "bg-gradient-to-br from-red-500 to-rose-600 text-white" : isPrimary ? "bg-gradient-to-br from-indigo-500 to-blue-600 text-white" : "bg-white text-gray-800"}`;
  const progressBarBgClass = isWarning ? "bg-white/60" : isPrimary ? "bg-green-300" : "bg-blue-500";

  return (
    <div className={cardClasses}>
      <div>
        <h3 className="font-semibold mb-4">{title}</h3>
        <p className="text-3xl font-bold mb-3">
          {/* ✅ Logika pembagian desimal Edel dihapus dari sini */}
          {["V1", "V2", "V3", "Vavg"].includes(id) ? (panelData[id] / 100).toFixed(1) : panelData[id] || 0}{" "}
          {satuan}
        </p>
        <div className={`w-full rounded-full h-2.5 ${isWarning ? 'bg-white/30' : 'bg-gray-200/80'}`}>
          <div className={`h-2.5 rounded-full ${progressBarBgClass}`} style={{ width: `${progress}%`, transition: 'width 0.5s ease-in-out' }}></div>
        </div>
      </div>
    </div>
  );
};

// Komponen StatCardLong (tidak ada perubahan)
const StatCardLong = ({ title, value, progress, isWarning = false }) => {
  const cardClasses = `p-5 rounded-2xl shadow-md flex flex-col justify-between transition-colors duration-500 ease-in-out ${isWarning ? "bg-gradient-to-br from-red-500 to-rose-600 text-white" : "bg-gradient-to-br from-indigo-500 to-blue-600 text-white"}`;
  const progressBarBgClass = isWarning ? "bg-white/60" : "bg-green-300";
  
  return (
    <div className={cardClasses}>
      <div>
        <div className="flex justify-between items-baseline">
          <h3 className="font-semibold text-2xl">{title}</h3>
          <p className="text-3xl font-bold mb-3">{value}</p>
        </div>
        <div className="w-full bg-white/30 rounded-full h-2.5">
          <div className={`h-2.5 rounded-full ${progressBarBgClass}`} style={{ width: `${progress}%`, transition: 'width 0.5s ease-in-out' }}></div>
        </div>
      </div>
    </div>
  );
};

// Komponen utama ProjectStats
export const ProjectStats = () => {
  const [panelData, setPanelData] = useState({});
  const [warningFields, setWarningFields] = useState([]);

  // ✅ Batas Edel diubah ke Infinity agar tidak memicu warning
  const limits = {
    Iavg: { min: 0, max: 10 },
    Ptot: { min: 0, max: 1000 },
    Edel: { min: -Infinity, max: Infinity }, // Tidak lagi memiliki batas
    V1: { min: 19000, max: 22000 },
    V2: { min: 19000, max: 22000 },
    V3: { min: 19000, max: 22000 },
    Vavg: { min: 19000, max: 22000 },
  };
  
  const calculateProgress = (value, min, max) => {
    if (value == null || min == null || max == null || max === min) return 0;
    const percentage = ((value - min) / (max - min)) * 100;
    return Math.max(0, Math.min(percentage, 100));
  };

  useEffect(() => {
    const panelRef = ref(db2, "sensor_data");
    const unsubscribe = onValue(
      panelRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setPanelData(data);
          const exceeded = Object.keys(limits).filter(key => {
            const limit = limits[key];
            const val = data[key];
            return val !== undefined && (val < limit.min || val > limit.max);
          });
          setWarningFields(exceeded);
        }
      },
      (error) => console.error("Error reading data:", error)
    );
    return () => unsubscribe();
  }, []);

  const statsData = [
    { title: "Phase 1", id: "V1", satuan: "V" },
    { title: "Phase 2", id: "V2", satuan: "V" },
    { title: "Phase 3", id: "V3", satuan: "V" },
    { title: "Average Voltage", id: "Vavg", satuan: "V", variant: "primary" },
  ];

  return (
    <div className="font-sans">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-3">
        <StatCardLong
          title="Average Current"
          value={`${panelData.Iavg ? panelData.Iavg.toFixed(2) : 0} A`}
          progress={calculateProgress(panelData.Iavg, limits.Iavg?.min, limits.Iavg?.max)}
          isWarning={warningFields.includes('Iavg')}
        />

        {/* ✅ PERUBAHAN DI SINI: Kartu Edel diganti Ptot */}
        <StatCardLong
          title="Total Power"
          value={`${panelData.Ptot ? panelData.Ptot.toFixed(1) : 0} kW`}
          progress={calculateProgress(panelData.Ptot, limits.Ptot?.min, limits.Ptot?.max)}
          isWarning={warningFields.includes('Ptot')}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => {
          const currentLimits = limits[stat.id] || {};
          return (
            <StatCard
              key={index}
              {...stat}
              panelData={panelData}
              progress={calculateProgress(panelData[stat.id], currentLimits.min, currentLimits.max)}
              isWarning={warningFields.includes(stat.id)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ProjectStats;