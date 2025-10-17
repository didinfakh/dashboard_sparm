import React, { useEffect, useRef, useState } from "react";
import { FiArrowUpRight } from "react-icons/fi";
import { BsCalendarWeek } from "react-icons/bs";
import { IoChatbubblesOutline } from "react-icons/io5";
import { db2 } from "../Firebase";
import { ref, onValue } from "firebase/database";
import toast, { Toaster } from "react-hot-toast";

// 🔹 Komponen StatCard (short) - Tidak ada perubahan
const StatCard = ({
  title,
  id,
  value,
  icon,
  variant = "default",
  panelData,
  satuan,
  progress = 0,
}) => {
  const isPrimary = variant === "primary";
  const cardClasses = `
    p-5 rounded-2xl shadow-sm flex flex-col justify-between
    ${
      isPrimary
        ? "bg-gradient-to-br from-indigo-500 to-blue-600 text-white"
        : "bg-white text-gray-800"
    }
  `;
  const arrowIconWrapperClasses = `
    p-2 rounded-full
    ${isPrimary ? "bg-white/25" : "bg-gray-100 text-gray-600"}
  `;

  return (
    <div className={cardClasses}>
      <div>
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-semibold">{title}</h3>
          {/* <div className={arrowIconWrapperClasses}>
            <FiArrowUpRight size={16} />
          </div> */}
        </div>
        <p className="text-3xl font-bold mb-3">
          {["V1", "V2", "V3", "Vavg"].includes(id)
            ? (panelData[id] / 100).toFixed(1)
            : id === "Edel"
            ? (panelData[id] / 1000).toFixed(2)
            : panelData[id] || 0}{" "}
          {satuan}
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full ${
              isPrimary ? "bg-green-300" : "bg-blue-500"
            }`}
            style={{ width: `${progress}%`, transition: 'width 0.5s ease-in-out' }}
          ></div>
        </div>
      </div>
    </div>
  );
};

// 🔹 Komponen StatCardLong (panjang) - Tidak ada perubahan
const StatCardLong = ({ title, value, progress }) => {
  return (
    <div className="p-5 rounded-2xl shadow-md bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex flex-col justify-between">
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-4xl font-bold mb-3">{value}</p>
        <div className="w-full bg-white/30 rounded-full h-2.5">
          <div
            className="h-2.5 bg-green-300 rounded-full"
            style={{ width: `${progress}%`, transition: 'width 0.5s ease-in-out' }}
          ></div>
        </div>
      </div>
    </div>
  );
};

// 🔹 Komponen utama ProjectStats
export const ProjectStats = () => {
  const [panelData, setPanelData] = useState({});
  const [isWarning, setIsWarning] = useState(false);
  const [warningFields, setWarningFields] = useState([]);
  const blinkInterval = useRef(null);

  // 🔹 [MODIFIKASI 1] Batas nilai untuk perhitungan progress bar
  const limits = {
    Iavg: { min: 0, max: 10 },
    Ptot: { min: 0, max: 1000 },
    Edel: { min: 0, max: 300000 }, // Target visual, misal 3000 kWh (nilai asli 300000)
    V1: { min: 19000, max: 22000 },
    V2: { min: 19000, max: 22000 },
    V3: { min: 19000, max: 22000 },
    Frequency: { min: 49, max: 51 },
  };

  const fieldLabels = {
    Iavg: "Arus Rata-rata (Iavg)",
    Ptot: "Daya Total (Ptot)",
    V1: "Tegangan Phase 1 (V1)",
    V2: "Tegangan Phase 2 (V2)",
    V3: "Tegangan Phase 3 (V3)",
    Frequency: "Frekuensi",
  };
  
  // 🔹 [MODIFIKASI 2] Fungsi untuk menghitung persentase progress bar
  const calculateProgress = (value, min, max) => {
    // Jika data belum ada atau rentang tidak valid, progress 0%
    if (value == null || min == null || max == null || max === min) {
      return 0;
    }
    const range = max - min;
    const correctedValue = value - min;
    const percentage = (correctedValue / range) * 100;
    // Pastikan nilai progress selalu antara 0 dan 100
    return Math.max(0, Math.min(percentage, 100));
  };


  // 🔹 Ambil data dari Firebase (logika pengecekan batas disederhanakan)
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

          setIsWarning(exceeded.length > 0);
          setWarningFields(exceeded);
        }
      },
      (error) => console.error("Error membaca data:", error)
    );

    return () => unsubscribe();
  }, []);

  // 🔹 Munculkan peringatan (tidak ada perubahan)
  useEffect(() => {
    if (isWarning && warningFields.length > 0) {
      const message = warningFields.map((key) => fieldLabels[key] || key).join(", ");
      blinkInterval.current = setInterval(() => {
        toast.error(`${message} di luar batas normal!`, {
          duration: 1000,
          position: "top-center",
          style: { background: "red", color: "white" },
        });
      }, 1000);
    }
    return () => clearInterval(blinkInterval.current);
  }, [isWarning, warningFields]);

  // 🔹 Data untuk kartu (progress statis dihapus)
  const statsData = [
    { title: "Phase 1", id: "V1", satuan: "V", icon: <BsCalendarWeek size={16} />, variant: "default" },
    { title: "Phase 2", id: "V2", satuan: "V", icon: <IoChatbubblesOutline size={16} />, variant: "default" },
    { title: "Phase 3", id: "V3", satuan: "V", icon: <IoChatbubblesOutline size={16} />, variant: "default" },
    { title: "Frequency", id: "Frequency", satuan: "Hz", icon: <BsCalendarWeek size={16} />, variant: "primary" },
  ];

  return (
    <div className="font-sans">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-3">
        {/* 🔹 [MODIFIKASI 3] Gunakan fungsi calculateProgress */}
        <StatCardLong
          title="Average Current"
          value={`${panelData.Iavg ? panelData.Iavg.toFixed(2) : 0} A`}
          progress={calculateProgress(panelData.Iavg, limits.Iavg.min, limits.Iavg.max)}
        />
        <StatCardLong
          title="Energy Delivered"
          value={`${(panelData.Edel / 100).toFixed(1) || 0} Kwh`}
          progress={calculateProgress(panelData.Edel, limits.Edel.min, limits.Edel.max)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => {
          // Ambil batas min dan max untuk stat saat ini
          const currentLimits = limits[stat.id] || {};
          return (
            <StatCard
              key={index}
              title={stat.title}
              id={stat.id}
              satuan={stat.satuan}
              icon={stat.icon}
              variant={stat.variant}
              panelData={panelData}
              // 🔹 [MODIFIKASI 3] Gunakan fungsi calculateProgress
              progress={calculateProgress(panelData[stat.id], currentLimits.min, currentLimits.max)}
            />
          );
        })}
      </div>

      <Toaster />
    </div>
  );
};

export default ProjectStats;