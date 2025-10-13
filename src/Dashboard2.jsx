import React, { useEffect, useState } from "react";
import {
  FiSearch,
  FiBell,
  FiSettings,
  FiChevronDown,
  FiCalendar,
  FiPlus,
  FiMinus,
  FiMoreHorizontal,
  FiArrowRight,
} from "react-icons/fi";
import {
  FaHeartbeat,
  FaBrain,
  FaLungs,
  FaTint,
  FaHeart,
  FaBolt,
  FaShieldAlt,
  FaLeaf,
} from "react-icons/fa";
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";
import ProjectStats from "./components/ProjectStats ";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
} from "chart.js";
// import ElectricalPanel3D from "./components/";
import SchneiderPanel from "./components/SchneiderPanel";
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title
);
import { db, db2, dbDatabase } from "./Firebase";
import { onValue, ref } from "firebase/database";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";

// Data dummy untuk grafik detak jantung
const heartRateData = [
  { name: "Page A", uv: 40 },
  { name: "Page B", uv: 30 },
  { name: "Page C", uv: 60 },
  { name: "Page D", uv: 50 },
  { name: "Page E", uv: 80 },
  { name: "Page F", uv: 70 },
  { name: "Page G", uv: 90 },
];

// Data dummy untuk grafik kolesterol
const cholesterolData = [
  { v: 10 },
  { v: 40 },
  { v: 20 },
  { v: 50 },
  { v: 30 },
  { v: 70 },
  { v: 60 },
];

const Dashboard2 = () => {
  const [monthSumarry, setMonthSumarry] = useState([]);
  const [dataMonthSummary, setDataMonthSummary] = useState([]);
  async function getDatabase() {
    const snapshot = await getDocs(
      collection(dbDatabase, "monthly_forecast_summary")
    );
    console.log("isi snapshot");
    console.log(snapshot.docs.map((doc) => doc.data()));
    setDataMonthSummary(snapshot.docs.map((doc) => doc.data()));
    try {
      const q = query(
        collection(dbDatabase, "monthly_forecast_summary"),
        orderBy("created_at", "desc"),
        limit(1)
      );
      const snapshot = await getDocs(q);
      console.log(snapshot);
      const data = snapshot.docs.map((doc) => doc.data());
      console.log("Data terakhir:", data);
      setMonthSumarry(data[0]);
    } catch (error) {
      console.error("Gagal ambil data Firestore:", error);
    }
  }
  useEffect(() => {
    getDatabase();
  }, []);
  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      <div className="bg-gray-100  shadow-lg p-6">
        {/* Main Content */}
        <main>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Dashboard 2</h2>
              <p className="text-gray-500">You have 3 appointments today</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 relative flex !max-h-[100px]">
              <SchneiderPanel />
            </div>

            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Patient Body Analysis */}
              <div className="md:col-span-2 bg-gray-200 p-4 rounded-2xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Patient Body Analysis</h3>
                  <button className="text-sm text-gray-500 flex items-center gap-2">
                    Real Time
                  </button>
                </div>
                <ProjectStats />
              </div>
            </div>
          </div>
        </main>
        <div className="mt-3  text-white flex justify-between items-end">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 w-full">
            {/* ====== BAGIAN TABEL ====== */}
            <div className="col-span-1 lg:col-span-4 bg-white p-6 rounded-lg shadow-xl w-full">
              <h2 className="text-xl font-semibold mb-4 text-black">
                Record Prediction
              </h2>
              <table className="w-full divide-y divide-black">
                <thead className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 text-left">NUMBER</th>
                    <th className="py-3 text-left">DATE</th>
                    <th className="py-3 text-left">COST</th>
                    <th className="py-3 text-left">KWH</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-500 text-sm">
                  {dataMonthSummary.map((value, index) => (
                    <tr key={index} className="text-black hover:bg-gray-50">
                      <td className="py-4 whitespace-nowrap font-medium text-gray-800">
                        {index + 1}
                      </td>
                      <td className="py-4 whitespace-nowrap text-gray-500">
                        {value.forecast_month}
                      </td>
                      <td className="py-4 whitespace-nowrap text-gray-500">
                        Rp. {value.predicted_total_cost.toLocaleString("id-ID")}
                      </td>
                      <td className="py-4 whitespace-nowrap text-gray-500">
                        {Math.round(value.predicted_total_kwh * 100) / 100}{" "}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ====== BAGIAN STATISTIK ====== */}
            <div className="col-span-1 flex flex-col gap-6">
              {/* Card INVOICE */}
              <div className="p-4 rounded-lg shadow-xl h-40 flex flex-col justify-between bg-[#ffd53f] text-black">
                <div className="flex justify-between items-start">
                  <div className="text-sm font-medium opacity-80">
                    Prediction Price per Month
                  </div>
                </div>
                <div className="flex justify-around items-end">
                  <div>
                    <div className="text-xl font-bold">{`Rp. ${(
                      monthSumarry.predicted_total_kwh *
                      monthSumarry.price_per_kwh
                    ).toLocaleString("id-ID")}`}</div>
                    <div className="text-xs opacity-70">UPCOMING INVOICE</div>
                  </div>
                  <div className="flex items-center text-xs font-semibold">
                    <svg
                      className="w-3 h-3 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 10l7-7m0 0l7 7m-7-7v18"
                      ></path>
                    </svg>
                    1.2%
                  </div>
                </div>
              </div>

              {/* Card PALLET DELIVERIES */}
              {console.log("ini adalah mont sumary")}
              {console.log(monthSumarry)}
              <div className="bg-white p-4 rounded-lg shadow-xl h-40 flex flex-col justify-between text-black">
                <div className="flex justify-between items-start">
                  <div className="text-sm font-medium opacity-80">
                    Prediction Kwh per Month
                  </div>
                </div>
                <div className="flex justify-between items-end">
                  <div className="text-2xl font-bold">{`${
                    Math.round(monthSumarry.predicted_total_kwh * 100) / 100
                  } Kwh`}</div>
                  <div className="flex items-center text-xs font-semibold text-green-700">
                    <svg
                      className="w-3 h-3 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 10l7-7m0 0l7 7m-7-7v18"
                      ></path>
                    </svg>
                    2.6%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-komponen untuk daftar obat
const MedicationItem = ({ icon, title, subtitle, active = false }) => (
  <div
    className={`flex items-center gap-4 p-3 rounded-lg ${
      active ? "bg-blue-600 text-white" : ""
    }`}
  >
    <div className={`p-3 rounded-lg ${active ? "bg-white/20" : "bg-gray-100"}`}>
      {icon}
    </div>
    <div>
      <p
        className={`font-semibold text-sm ${
          active ? "text-white" : "text-gray-800"
        }`}
      >
        {title}
      </p>
      <p className={`text-xs ${active ? "text-blue-100" : "text-gray-500"}`}>
        {subtitle}
      </p>
    </div>
  </div>
);

// Sub-komponen untuk jadwal pertemuan
const AppointmentItem = ({ avatar, name, speciality }) => (
  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
    <div className="flex items-center gap-3">
      <img src={avatar} alt={name} className="w-10 h-10 rounded-full" />
      <div>
        <p className="font-semibold text-sm">{name}</p>
        <p className="text-xs text-gray-500">{speciality}</p>
      </div>
    </div>
    <FiMoreHorizontal className="text-gray-400" />
  </div>
);
export default Dashboard2;
