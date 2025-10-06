// src/Dashboard1.jsx

import React from 'react';
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

// --- DATA & OPTIONS UNTUK CHARTJS ---

// 1. ORDER DISTRIBUTION CHART (Donut Chart)
const orderDistributionData = {
  labels: ['Electric', 'Offset', 'Format Printing'],
  datasets: [
    {
      data: [53, 28, 20],
      backgroundColor: ['#ffc600', '#16a34a', '#8b5cf6'],
      borderWidth: 0,
      cutout: '80%',
    },
  ],
};

const orderDistributionOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
};

// 2. OPERATIONAL EVENTS CHART (Bar Chart)
const operationalEventsData = {
  labels: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
  datasets: [
    {
      label: 'This week',
      data: [6, 8, 4, 9, 7, 3, 2],
      backgroundColor: '#ffc600', // Kuning
      barPercentage: 0.5,
      categoryPercentage: 0.8,
    },
    {
      label: 'Last week',
      data: [4, 5, 2, 7, 6, 1, 1],
      backgroundColor: '#8b5cf6', // Ungu
      barPercentage: 0.5,
      categoryPercentage: 0.8,
    },
  ],
};

const operationalEventsOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'top', labels: { color: '#9ca3af' } } },
  scales: {
    x: { grid: { display: false }, ticks: { color: '#9ca3af' } },
    y: { display: false, grid: { display: false } },
  },
};

// 3. RESPONSIBILITY DISTRIBUTION CHART (Donut Chart)
const responsibilityData = {
  labels: ['Planning', 'Logistics', 'Packaging', 'Other'],
  datasets: [
    {
      data: [25, 25, 25, 25], // Asumsi distribusi merata untuk contoh
      backgroundColor: ['#ffc600', '#8b5cf6', '#16a34a', '#374151'],
      borderWidth: 0,
      cutout: '80%',
    },
  ],
};

const responsibilityOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
};

// 4. STAT CARD LINE CHART (Chart mini untuk Invoice/Pallet)
const statLineChartData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      data: [10, 25, 15, 30, 20, 35],
      borderColor: 'white',
      borderWidth: 2,
      pointRadius: 0,
      tension: 0.4,
      fill: false,
    },
  ],
};

const statLineChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { enabled: false } },
  scales: { x: { display: false }, y: { display: false } },
  elements: { point: { radius: 0 } },
};

// --- DATA UNTUK TABEL ---

const orderTableData = [
  { id: '#200211', type: 'Traffic', date: '13 Nov, 2022', reporter: 'Nova Post', status: 'Reported', logoColor: 'bg-red-500', statusClass: 'bg-purple-900 text-purple-300' },
  { id: '#200212', type: 'Planning mistake', date: '16 Nov, 2022', reporter: 'DHL', status: 'In review', logoColor: 'bg-yellow-500', statusClass: 'bg-green-900 text-green-300' },
  { id: '#765947', type: 'Delay', date: '24 Nov, 2022', reporter: 'UPS', status: 'Reported', logoColor: 'bg-orange-600', statusClass: 'bg-purple-900 text-purple-300' },
  { id: '#501833', type: 'Wrong format', date: '01 Dec, 2022', reporter: 'FedEx', status: 'In review', logoColor: 'bg-blue-600', statusClass: 'bg-green-900 text-green-300' },
];

// --- KOMPONEN FUNGSI UTAMA ---

const Dashboard1 = () => {
  // Fungsi Komponen Pembantu untuk Kartu Statistik (Invoice & Pallet)
  const StatCard = ({ title, value, trend, color, chartData, chartOptions, icon }) => (
    <div className={`p-4 rounded-lg shadow-xl h-40 flex flex-col justify-between ${color}`}>
      <div className="flex justify-between items-start">
        <div className="text-sm font-medium opacity-80 text-black">{title}</div>
        <div className="w-20 h-10">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>
      <div className="flex justify-between items-end">
        <div>
          <div className="text-3xl font-bold text-black">{value}</div>
          <div className="text-xs text-black opacity-70">UPCOMING INVOICE</div>
        </div>
        <div className="flex items-center text-xs font-semibold text-black">
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
          {trend}
        </div>
      </div>
    </div>
  );

  // Komponen Tabel (menggunakan tag <table>)
  const OrderTable = () => (
    <div className="bg-[#2a2c34] p-6 rounded-lg shadow-xl">
      <h2 className="text-xl font-semibold mb-4 text-white">Order Status Report</h2>
      
      {/* Tabel menggunakan tag <table> semantik */}
      <table className="min-w-full divide-y divide-gray-700">
        
        {/* Header Tabel */}
        <thead className="text-xs font-medium text-gray-400 uppercase tracking-wider">
          <tr>
            <th scope="col" className="py-3 text-left">ORDER NUMBER</th>
            <th scope="col" className="py-3 text-left">TYPE</th>
            <th scope="col" className="py-3 text-left">DATE</th>
            <th scope="col" className="py-3 text-left">REPORTED BY</th>
            <th scope="col" className="py-3 text-right">STATUS</th>
          </tr>
        </thead>

        {/* Isi Tabel */}
        <tbody className="divide-y divide-gray-800 text-sm">
          {orderTableData.map((order) => (
            <tr key={order.id} className="text-white">
              
              {/* Order Number */}
              <td className="py-4 whitespace-nowrap font-medium text-gray-200">{order.id}</td>
              
              {/* Type */}
              <td className="py-4 whitespace-nowrap text-gray-400">{order.type}</td>
              
              {/* Date */}
              <td className="py-4 whitespace-nowrap text-gray-400">{order.date}</td>
              
              {/* Reported By */}
              <td className="py-4 whitespace-nowrap">
                <div className="flex items-center">
                  {/* Placeholder untuk Logo/Indikator Reporter */}
                  <span className={`w-3 h-3 rounded-full mr-3 ${order.logoColor}`}></span>
                  <span>{order.reporter}</span>
                </div>
              </td>
              
              {/* Status (Tombol Pill) */}
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
  );
  // Akhir dari OrderTable

  return (
    // Background gelap keseluruhan
    <div className="min-h-screen p-8 bg-[#1f2127] text-white font-sans">
      
      {/* Grid Layout Utama */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Kolom Kiri (1/4 lebar) */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          
          {/* Widget 1: ORDER DISTRIBUTION */}
          <div className="bg-[#2a2c34] p-6 rounded-lg shadow-xl h-[300px]"> 
            <h2 className="text-lg font-semibold mb-4 text-white">ORDER DISTRIBUTION</h2>
            <div className="relative h-48 flex items-center justify-center">
              <Doughnut data={orderDistributionData} options={orderDistributionOptions} />
              {/* Teks Persentase Manual */}
              <span className="absolute left-0 top-1/2 transform -translate-y-1/2 text-sm text-gray-400">53%</span>
              <span className="absolute right-0 top-1/2 transform -translate-y-1/2 text-sm text-gray-400">28%</span>
              <span className="absolute top-1/3 right-1/4 transform -translate-y-1/2 text-sm text-gray-400">20%</span>
            </div>
            {/* Legenda Manual */}
            <div className="flex justify-around text-xs mt-4">
              {orderDistributionData.labels.map((label, index) => (
                <div key={label} className="flex items-center">
                  <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: orderDistributionData.datasets[0].backgroundColor[index] }}></span>
                  <span className="text-gray-400">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Widget 2: OPERATIONAL EVENTS (Bar Chart) */}
          <div className="bg-[#2a2c34] p-6 rounded-lg shadow-xl h-[300px]">
            <h2 className="text-lg font-semibold mb-4 text-white">OPERATIONAL EVENTS</h2>
            <div className="h-48">
              <Bar data={operationalEventsData} options={operationalEventsOptions} />
            </div>
          </div>
        </div>

        {/* Kolom Kanan (3/4 lebar) */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          
          {/* Baris 1: Tabel Order (SUDAH DIUBAH KE TAG <table>) */}
          <OrderTable /> 

          {/* Baris 2: Responsibility Chart dan Stat Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Widget 3: RESPONSIBILITY DISTRIBUTION */}
            <div className="bg-[#2a2c34] p-6 rounded-lg shadow-xl h-[300px]">
              <h2 className="text-lg font-semibold mb-4 text-white">RESPONSIBILITY DISTRIBUTION</h2>
              <div className="relative h-56 flex items-center justify-center">
                <Doughnut data={responsibilityData} options={responsibilityOptions} />
                {/* Teks di tengah */}
                <div className="absolute flex flex-col items-center">
                  <div className="text-4xl font-bold text-white">25%</div>
                  <div className="text-sm text-gray-400">Pekerjaan di sini...</div>
                </div>
              </div>
            </div>

            {/* Widget 4 & 5: Stat Cards */}
            <div className="flex flex-col gap-6">
              
              {/* Stat Card 1: UPCOMING INVOICE (Background Kuning) */}
              <StatCard
                title="INVOICE"
                value="€4,598"
                trend="1.2%"
                color="bg-[#ffc600]"
                chartData={statLineChartData}
                chartOptions={statLineChartOptions}
              />

              {/* Stat Card 2: PALLET DELIVERIES (Background Gelap) */}
              <div className="bg-[#2a2c34] p-4 rounded-lg shadow-xl h-40 flex flex-col justify-between text-white">
                <div className="flex justify-between items-start">
                  <div className="text-sm font-medium opacity-80">PALLET DELIVERIES</div>
                  <div className="w-20 h-10 opacity-70">
                    <Line data={statLineChartData} options={statLineChartOptions} />
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
      </div>
      
      {/* Footer/Audio Player (Bawah) */}
      <div className="mt-8 flex items-center justify-center p-4 bg-[#2a2c34] rounded-lg">
        {/* Placeholder untuk tombol play/pause dan progress bar */}
        <div className="flex items-center space-x-4">
          <button className="text-white hover:text-gray-400">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path></svg>
          </button>
          <div className="w-96 bg-gray-700 rounded-full h-1.5">
            <div className="bg-pink-600 h-1.5 rounded-full w-1/3"></div>
          </div>
          <button className="text-white hover:text-gray-400">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-5.464-8.464a.5.5 0 00.354.854H7v2a.5.5 0 001 0v-2h2.043a.5.5 0 00.354-.854l-2.5-2.5a.5.5 0 00-.707 0l-2.5 2.5z" clipRule="evenodd"></path></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard1;