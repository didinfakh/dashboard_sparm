import React, { useEffect, useState } from "react";
import { FiArrowUpRight } from "react-icons/fi";
import { BsCalendarWeek } from "react-icons/bs"; // Ikon kalender
import { IoChatbubblesOutline } from "react-icons/io5"; // Ikon untuk "On Discuss"
import { db, db2 } from "../Firebase";
import { ref, onValue } from "firebase/database";
/**
 * Sub-komponen untuk satu kartu statistik.
 * Menerima props untuk menyesuaikan tampilan dan datanya.
 */
const StatCard = ({
  title,
  id,
  value,
  description,
  icon,
  variant = "default",
  panelData,
  satuan,
}) => {
  // Menentukan style berdasarkan varian (default atau primary)
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

  const descriptionTextClasses = `
    text-sm
    ${isPrimary ? "text-green-200" : "text-gray-500"}
  `;

  return (
    <div className={cardClasses}>
      <div>
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-semibold">{title}</h3>
          <div className={arrowIconWrapperClasses}>
            <FiArrowUpRight size={16} />
          </div>
        </div>
        <p className="text-3xl font-bold">{`${
          ["V1", "V2", "V3", "Vavg"].includes(id)
            ? (panelData[id] / 100).toFixed(1)
            : id == "Edel"
            ? (panelData[id] / 1000).toFixed(2)
            : panelData[id]
        } ${satuan}`}</p>
      </div>
      <div className={`flex items-center gap-2 mt-4 ${descriptionTextClasses}`}>
        {icon}
        <span>{description}</span>
      </div>
    </div>
  );
};
const StatCardLong = ({
  title,
  id,
  value,
  description,
  icon,
  variant = "default",
  panelData,
  satuan,
}) => {
  // Menentukan style berdasarkan varian (default atau primary)

  return (
    <div className=" p-5 rounded-2xl shadow-md bg-gradient-to-br from-indigo-500 to-blue-600 text-white  flex items-center justify-between">
      <div>
        <h3 className=" font-semibold">{title}</h3>
        <p className="text-4xl font-bold">{value}</p>
        <p className="text-sm opacity-75 mt-1">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Itaque,
          eaque.
        </p>
      </div>
      <div className="flex flex-col items-end">
        {/* <div className="flex space-x-2 mb-2">
            {renderStars(ratingConsulting)}
          </div> */}
        {/* <button className="bg-white text-blue-600 px-4 py-2 rounded-full text-sm hover:bg-gray-100">
          Rate Now
        </button> */}
      </div>
    </div>
  );
};

/**
 * Komponen utama yang menampilkan semua kartu statistik.
 */
export const ProjectStats1 = () => {
  const [panelData, setPanelData] = useState({});
  useEffect(() => {
    console.log("Fetching data from Firebase...");
    const panelRef = ref(db, "panel_1/pa330");
    const unsubscribe = onValue(
      panelRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setPanelData(data);
          console.log("Data terbaru:", data);
        }
      },
      (error) => {
        console.error("Error membaca data:", error);
      }
    );

    return () => unsubscribe();
  }, []);
  const statsData = [
    {
      title: "Phase 1",
      id: "voltage",
      value: 10,
      satuan: "V",
      description: "Displays voltage of the first phase",
      icon: <BsCalendarWeek size={16} />,
      variant: "default",
    },
    {
      title: "Total Power",
      id: "power",
      satuan: "KW",
      value: 12,
      description: "Displays Total Power",
      icon: <IoChatbubblesOutline size={16} />,
      variant: "default",
    },
    {
      title: "Frekuensi",
      id: "frequency",
      satuan: "Hz",
      value: 2,
      description: "Displays voltage of the third phase",
      icon: <IoChatbubblesOutline size={16} />,
      variant: "default",
    },
    {
      title: "Energy Delivered",
      id: "Edel",
      satuan: "KWH",
      value: 24,
      description: "Average current across all phases",
      icon: <BsCalendarWeek size={16} />,
      variant: "primary",
    },
  ];

  return (
    <div className=" font-sans">
      <div className="grid grid-cols-1 sm:grid-cols-2  gap-6 mb-3">
        <StatCardLong
          title="Phase 1"
          value={`${panelData.fasa_1 ? panelData.fasa_1.toFixed(2) : 0} V`}
        />
        <StatCardLong
          title="Frekuensi"
          value={`${panelData.frekuensi.toFixed(1) || 0} Hz`}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            id={stat.id}
            value={stat.value}
            description={stat.description}
            icon={stat.icon}
            variant={stat.variant}
            panelData={panelData.ct_1}
            satuan={stat.satuan}
          />
        ))}
      </div>
    </div>
  );
};

export default ProjectStats1;
