// src/Dashboard2.jsx

import React, { useEffect, useState } from 'react';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
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
} from 'chart.js';
import { db } from "./Firebase";
import { ref, onValue } from "firebase/database";
// Pendaftaran komponen Chart.js yang diperlukan
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

// --- 1. DATA & OPTIONS: GAUGE (Semi-Donut Chart) ---
// Gauge Chart menggunakan Donut Chart dengan trik: potong setengah dan putar
const gaugeData = (label,data) => ({
  labels: [label, 'Target', 'Sisa'],
  datasets: [{
    data: [data], // Contoh data: 75% terisi, 5% kelebihan (indicator), 20% kosong
    backgroundColor: ['#ffc600', '#16a34a', '#374151'], // Kuning, Hijau, Abu-abu gelap
    borderWidth: 0,
  }],
});

const gaugeOptions = {
  responsive: true,
  maintainAspectRatio: false,
  rotation: 270,        // Putar chart 270 derajat (mulai dari bawah)
  circumference: 180,   // Hanya tampilkan setengah lingkaran (180 derajat)
  plugins: { 
    legend: { display: false },
    tooltip: { enabled: false }
  },
  cutout: '80%',
};

// --- 2. DATA & OPTIONS: TREN ARUS 3 FASA (Line Chart) ---
const threePhaseCurrentData = {
  labels: ['14:49:50', '14:49:55', '14:50:00', '14:50:05', '14:50:10', '14:50:15', '14:50:20', '14:50:25'],
  datasets: [
    { label: 'Arus Fasa A', data: [0.8, 0.7, 0.9, 0.75, 0.85, 0.9, 0.7, 0.8], borderColor: '#16a34a', borderWidth: 2, pointRadius: 0, tension: 0.4 },
    { label: 'Arus Fasa B', data: [0.5, 0.6, 0.7, 0.55, 0.65, 0.7, 0.5, 0.6], borderColor: '#ffc600', borderWidth: 2, pointRadius: 0, tension: 0.4 },
    { label: 'Arus Fasa C', data: [0.2, 0.3, 0.4, 0.35, 0.25, 0.4, 0.3, 0.2], borderColor: '#8b5cf6', borderWidth: 2, pointRadius: 0, tension: 0.4 },
  ],
};

const threePhaseCurrentOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'bottom', labels: { color: '#9ca3af' } } },
  scales: {
    x: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
    y: { min: -1.0, max: 1.0, ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
  },
};

// --- 3. DATA & OPTIONS: DAYA AKTIF TOTAL (Bar Chart) ---
const activePowerData = {
  labels: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00'],
  datasets: [
    {
      label: 'Daya Aktif (kW)',
      data: [2, 3, 5, 8, 7, 6, 9, 10],
      backgroundColor: '#ffc600',
    },
  ],
};

const activePowerOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false }, ticks: { color: '#9ca3af' } },
    y: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
  },
};

// --- 4. DATA & OPTIONS: AKUMULASI ENERGI (Line Chart Sederhana) ---
const energyAccumulationData = {
  labels: ['14:49:50', '14:50:00', '14:50:10', '14:50:20'],
  datasets: [
    { label: 'total_net_kWh', data: [0.1, 0.4, 0.7, 0.9], borderColor: '#16a34a', borderWidth: 2, pointRadius: 2, tension: 0.3, fill: false },
  ],
};

const energyAccumulationOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'bottom', labels: { color: '#9ca3af' } } },
  scales: {
    x: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
    y: { min: -1.0, max: 1.0, ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
  },
};


// --- KOMPONEN FUNGSI PEMBANTU ---

// Komponen Gauge (Semi-Donut)
const GaugeChart = ({ title, label,data }) => {
  const currentData = gaugeData(label, data);
  
  // Hitung nilai tengah untuk ditampilkan
  const currentValue = currentData.datasets[0].data[0];

  return (
    <div className="bg-[#2a2c34] p-4 rounded-lg shadow-xl h-[200px] flex flex-col items-center">
      <h3 className="text-sm font-semibold mb-[-10px] text-center text-white">{title}</h3>
      <div className="relative w-full h-[100%] mt-4">
        <Doughnut data={currentData} options={gaugeOptions} />
        {/* Teks di tengah (Di bawah) */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 mt-4 flex flex-col items-center">
            <span className="text-xl font-bold text-white">{currentValue} V</span>
        </div>
      </div>
    </div>
  );
};

// --- KOMPONEN FUNGSI UTAMA DASHBOARD ---
const Dashboard2 = () => {
  const [panelData, setPanelData] = useState({});

 useEffect(() => {
    const panelRef = ref(db, "Panel1");

    const unsubscribe = onValue(panelRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setPanelData(data);
      }
    }, (error) => {
      console.error("Error membaca data:", error);
    });

    return () => unsubscribe();
  }, []);

  return (
    // Background gelap keseluruhan
    <div className="min-h-screen p-8 bg-[#1f2127] text-white font-sans">
      {console.log('ini adalah panel datas')}
{      console.log(panelData)}      {/* Panel 1 Header */}
      <h1 className="text-2xl font-bold mb-6 text-center">Panel Monitoring Listrik</h1>

      {/* Grid Layout Utama (4x2 untuk gauges dan charts) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* BARIS 1: GAUGE CHARTS (Tegangan) */}
        <GaugeChart title="Tegangan Fasa R (V1)" label="V1" data={panelData?.Voltage_L1_N?Number(panelData?.Voltage_L1_N.toFixed(1)) : 0}/>
        <GaugeChart title="Tegangan Fasa S (V2)" label="V2" />
        <GaugeChart title="Tegangan Fasa T (V3)" label="V3" />
        <GaugeChart title="Rata-rata Tegangan" label="Rata-rata" />

        {/* BARIS 2: CHARTS TREN */}
        
        {/* Tren Arus 3 Fasa (Line Chart) */}
        <div className="md:col-span-2 bg-[#2a2c34] p-4 rounded-lg shadow-xl h-[300px]">
          <h2 className="text-lg font-semibold mb-4 text-white">Tren Arus 3 Fasa</h2>
          <div className="h-[80%]">
            <Line data={threePhaseCurrentData} options={threePhaseCurrentOptions} />
          </div>
        </div>

        {/* Daya Aktif Total (Bar Chart) */}
        <div className="bg-[#2a2c34] p-4 rounded-lg shadow-xl h-[300px]">
          <h2 className="text-lg font-semibold mb-4 text-white">Daya Aktif Total (kW)</h2>
          <div className="h-[80%]">
            <Bar data={activePowerData} options={activePowerOptions} />
          </div>
        </div>

        {/* Akumulasi Energi Hari Ini (Line Chart) */}
        <div className="bg-[#2a2c34] p-4 rounded-lg shadow-xl h-[300px]">
          <h2 className="text-lg font-semibold mb-4 text-white">Akumulasi Energi Hari Ini (kWh)</h2>
          <div className="h-[80%]">
            <Line data={energyAccumulationData} options={energyAccumulationOptions} />
          </div>
        </div>
      </div>
      
      {/* Panel 2 Header (Opsional, untuk memisahkan konten) */}
      <h1 className="text-2xl font-bold mt-8 mb-6 text-center">Panel Informasi Operasional</h1>

      {/* Grid Layout Tambahan (4 kolom untuk Tabel dan Cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Kolom 1-3: Tabel Order (Menggunakan gaya semantik <table>) */}
        <div className="lg:col-span-3 bg-[#2a2c34] p-6 rounded-lg shadow-xl">
          <h2 className="text-xl font-semibold mb-4 text-white">Laporan Status Order</h2>
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              <tr>
                <th scope="col" className="py-3 text-left">ORDER NUMBER</th>
                <th scope="col" className="py-3 text-left">TYPE</th>
                <th scope="col" className="py-3 text-left">DATE</th>
                <th scope="col" className="py-3 text-left">REPORTED BY</th>
                <th scope="col" className="py-3 text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-sm">
              {[
                { id: '#200211', type: 'Traffic', date: '13 Nov, 2022', reporter: 'Nova Post', logoColor: 'bg-red-500', status: 'Reported', statusClass: 'bg-purple-900 text-purple-300' },
                { id: '#200212', type: 'Planning mistake', date: '16 Nov, 2022', reporter: 'DHL', logoColor: 'bg-yellow-500', status: 'In review', statusClass: 'bg-green-900 text-green-300' },
                { id: '#765947', type: 'Delay', date: '24 Nov, 2022', reporter: 'UPS', logoColor: 'bg-orange-600', status: 'Reported', statusClass: 'bg-purple-900 text-purple-300' },
              ].map((order) => (
                <tr key={order.id} className="text-white hover:bg-[#374151]">
                  <td className="py-4 whitespace-nowrap font-medium text-gray-200">{order.id}</td>
                  <td className="py-4 whitespace-nowrap text-gray-400">{order.type}</td>
                  <td className="py-4 whitespace-nowrap text-gray-400">{order.date}</td>
                  <td className="py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`w-3 h-3 rounded-full mr-3 ${order.logoColor}`}></span>
                      <span>{order.reporter}</span>
                    </div>
                  </td>
                  <td className="py-4 whitespace-nowrap text-right">
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${order.statusClass}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Kolom 4: STAT CARDS (Invoice & Pallet) */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          
          {/* Stat Card 1: INVOICE (Background Kuning) */}
          <div className={`p-4 rounded-lg shadow-xl h-40 flex flex-col justify-between bg-[#ffc600]`}>
            <div className="flex justify-between items-start">
              <div className="text-sm font-medium opacity-80 text-black">INVOICE</div>
              <div className="w-20 h-10">
                {/* Chart mini untuk Invoice */}
                <Line data={{labels: ['J','F','M','A','M','J'], datasets: [{data: [10, 25, 15, 30, 20, 35], borderColor: 'black', borderWidth: 2, pointRadius: 0, tension: 0.4, fill: false}]}} options={{responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } }, scales: { x: { display: false }, y: { display: false } }, elements: { point: { radius: 0 } }}} />
              </div>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <div className="text-3xl font-bold text-black">€4,598</div>
                <div className="text-xs text-black opacity-70">UPCOMING INVOICE</div>
              </div>
              <div className="flex items-center text-xs font-semibold text-black">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
                1.2%
              </div>
            </div>
          </div>

          {/* Stat Card 2: PALLET DELIVERIES (Background Gelap) */}
          <div className="bg-[#2a2c34] p-4 rounded-lg shadow-xl h-40 flex flex-col justify-between text-white">
            <div className="flex justify-between items-start">
              <div className="text-sm font-medium opacity-80">PALLET DELIVERIES</div>
              <div className="w-20 h-10 opacity-70">
                {/* Chart mini untuk Pallet */}
                <Line data={{labels: ['J','F','M','A','M','J'], datasets: [{data: [35, 20, 30, 15, 25, 10], borderColor: 'white', borderWidth: 2, pointRadius: 0, tension: 0.4, fill: false}]}} options={{responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } }, scales: { x: { display: false }, y: { display: false } }, elements: { point: { radius: 0 } }}} />
              </div>
            </div>
            <div className="flex justify-between items-end">
              <div className="text-3xl font-bold">1650</div>
              <div className="flex items-center text-xs font-semibold text-green-400">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
                2.6%
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard2;