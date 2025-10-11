import React from "react";
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
  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      <div className="bg-gray-100  shadow-lg p-6">
        {/* Header */}
        {/* <header className="flex flex-wrap justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold text-blue-600">Healthink.</h1>
            <nav className="hidden md:flex items-center gap-4">
              <a
                href="#"
                className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-semibold"
              >
                Dashboard
              </a>
              <a href="#" className="text-gray-500 px-4 py-2">
                Schedule
              </a>
              <a href="#" className="text-gray-500 px-4 py-2">
                History
              </a>
              <a href="#" className="text-gray-500 px-4 py-2">
                Activity
              </a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                className="bg-gray-100 rounded-lg pl-10 pr-4 py-2 w-48 focus:outline-none"
              />
            </div>
            <button className="p-2">
              <FiBell className="text-gray-500" />
            </button>
            <button className="p-2">
              <FiSettings className="text-gray-500" />
            </button>
            <div className="flex items-center gap-2">
              <img
                src="https://i.pravatar.cc/150?u=abraham"
                alt="Abraham Smith"
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="font-semibold text-sm">Abraham Smith</p>
                <p className="text-xs text-gray-500">Therapist</p>
              </div>
            </div>
          </div>
        </header> */}

        {/* Main Content */}
        <main>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Dashboard 2</h2>
              <p className="text-gray-500">You have 3 appointments today</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 relative flex">
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

              <div className="md:col-span-2 bg-cover bg-center p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex justify-between items-end">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Kolom 1-3: Tabel Order (Menggunakan gaya semantik <table>) */}
                  <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow-xl">
                    <h2 className="text-xl font-semibold mb-4 text-black">
                      Laporan Status Order
                    </h2>
                    <table className="min-w-full divide-y divide-black">
                      <thead className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <tr>
                          <th scope="col" className="py-3 text-left">
                            ORDER NUMBER
                          </th>
                          <th scope="col" className="py-3 text-left">
                            TYPE
                          </th>
                          <th scope="col" className="py-3 text-left">
                            DATE
                          </th>
                          <th scope="col" className="py-3 text-left">
                            REPORTED BY
                          </th>
                          <th scope="col" className="py-3 text-right">
                            STATUS
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-500 text-sm">
                        {[
                          {
                            id: "#200211",
                            type: "Traffic",
                            date: "13 Nov, 2022",
                            reporter: "Nova Post",
                            logoColor: "bg-red-400",
                            status: "Reported",
                            statusClass: "bg-purple-500 text-purple-100",
                          },
                          {
                            id: "#200212",
                            type: "Planning mistake",
                            date: "16 Nov, 2022",
                            reporter: "DHL",
                            logoColor: "bg-yellow-400",
                            status: "In review",
                            statusClass: "bg-green-500 text-green-100",
                          },
                          {
                            id: "#765947",
                            type: "Delay",
                            date: "24 Nov, 2022",
                            reporter: "UPS",
                            logoColor: "bg-orange-500",
                            status: "Reported",
                            statusClass: "bg-purple-500 text-purple-100",
                          },
                        ].map((order) => (
                          <tr
                            key={order.id}
                            className="text-black hover:bg-white"
                          >
                            <td className="py-4 whitespace-nowrap font-medium text-gray-800">
                              {order.id}
                            </td>
                            <td className="py-4 whitespace-nowrap text-gray-500">
                              {order.type}
                            </td>
                            <td className="py-4 whitespace-nowrap text-gray-500">
                              {order.date}
                            </td>
                            <td className="py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <span
                                  className={`w-3 h-3 rounded-full mr-3 ${order.logoColor}`}
                                ></span>
                                <span>{order.reporter}</span>
                              </div>
                            </td>
                            <td className="py-4 whitespace-nowrap text-right">
                              <span
                                className={`text-xs px-3 py-1 rounded-full font-medium ${order.statusClass}`}
                              >
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="lg:col-span-1 flex flex-col gap-6">
                    <div
                      className={`p-4 rounded-lg shadow-xl h-40 flex flex-col justify-between bg-[#ffd53f]`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="text-sm font-medium opacity-80 text-black">
                          INVOICE
                        </div>
                        <div className="w-20 h-10">
                          {/* Chart mini untuk Invoice */}
                          <Line
                            data={{
                              labels: ["J", "F", "M", "A", "M", "J"],
                              datasets: [
                                {
                                  data: [10, 25, 15, 30, 20, 35],
                                  borderColor: "black",
                                  borderWidth: 2,
                                  pointRadius: 0,
                                  tension: 0.4,
                                  fill: false,
                                },
                              ],
                            }}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: { display: false },
                                tooltip: { enabled: false },
                              },
                              scales: {
                                x: { display: false },
                                y: { display: false },
                              },
                              elements: { point: { radius: 0 } },
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex justify-between items-end">
                        <div>
                          <div className="text-3xl font-bold text-black">
                            €4,598
                          </div>
                          <div className="text-xs text-black opacity-70">
                            UPCOMING INVOICE
                          </div>
                        </div>
                        <div className="flex items-center text-xs font-semibold text-black">
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

                    {/* Stat Card 2: PALLET DELIVERIES (Background Gelap) */}
                    <div className="bg-white p-4 rounded-lg shadow-xl h-40 flex flex-col justify-between text-black">
                      <div className="flex justify-between items-start">
                        <div className="text-sm font-medium opacity-80">
                          PALLET DELIVERIES
                        </div>
                        <div className="w-20 h-10 opacity-70">
                          {/* Chart mini untuk Pallet */}
                          <Line
                            data={{
                              labels: ["J", "F", "M", "A", "M", "J"],
                              datasets: [
                                {
                                  data: [35, 20, 30, 15, 25, 10],
                                  borderColor: "white",
                                  borderWidth: 2,
                                  pointRadius: 0,
                                  tension: 0.4,
                                  fill: false,
                                },
                              ],
                            }}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: { display: false },
                                tooltip: { enabled: false },
                              },
                              scales: {
                                x: { display: false },
                                y: { display: false },
                              },
                              elements: { point: { radius: 0 } },
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex justify-between items-end">
                        <div className="text-3xl font-bold">1650</div>
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
                {/* <div>
                  <h3 className="font-semibold mb-2">Issue Found</h3>
                  <div className="flex gap-2">
                    <span className="bg-white/30 backdrop-blur-sm text-xs font-semibold px-3 py-1 rounded-full">
                      Osteoporosis
                    </span>
                    <span className="bg-white/30 backdrop-blur-sm text-xs font-semibold px-3 py-1 rounded-full">
                      Bronchodilator drugs
                    </span>
                  </div>
                </div>
                <button className="bg-white/30 backdrop-blur-sm p-2 rounded-full">
                  <FiArrowRight />
                </button> */}
              </div>
            </div>
          </div>
        </main>
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
