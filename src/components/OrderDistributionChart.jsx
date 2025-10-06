
import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
ChartJS.register(ArcElement, Tooltip, Legend);

// --- Data Chart ---
const data = {
  labels: ['Electric', 'Offset', 'Format Printing', 'Logistics', 'Packaging', 'Other'],
  datasets: [
    {
      data: [35, 20, 15, 10, 10, 10], 
      backgroundColor: ['#ffc600', '#16a34a', '#8b5cf6', '#dc2626', '#10b981', '#3b82f6'],
      borderWidth: 0, 
      cutout: '80%',
    },
  ],
};


const options = {
  responsive: true,
  maintainAspectRatio: false, // JANGAN UBAH INI! Tapi pastikan kontainer memiliki tinggi
  plugins: {
    legend: { display: false },
    tooltip: { callbacks: { label: ({ label, raw }) => `${label}: ${raw}%` } }
  },
};

const OrderDistributionChart = () => {
  return (
    <div className="bg-[#2a2c34] p-6 rounded-lg shadow-xl text-white w-full max-w-sm mx-auto"> 
      <h2 className="text-lg font-semibold mb-6">ORDER DISTRIBUTION</h2>
      <div className="relative h-64 flex items-center justify-center mb-6">
        
        <div className="w-full h-full"> 
           <Doughnut data={data} options={options} />
        </div>

        {/* <div className="absolute inset-0 flex flex-col justify-center items-center pointer-events-none">
          <span className="text-4xl font-bold">35%</span>
          <span className="text-sm text-gray-400">Electric</span>
          
          <span className="absolute left-1 top-1/3 transform -translate-y-1/2 text-sm font-bold text-gray-300">53%</span>
          <span className="absolute right-0 top-1/2 transform -translate-y-1/2 text-sm font-bold text-gray-300">28%</span>
        </div> */}
      </div>

      {/* <h3 className="text-sm font-medium mb-2 text-gray-300">DETAILS</h3>
      
      <div className="auto-scroll-legend border-t border-gray-700 pt-2">
        <div className="auto-scroll-content">
          {data.labels.map((label, index) => (
            <div key={label} className="flex justify-between items-center py-1 text-sm">
              <div className="flex items-center">
                <span 
                  className="w-2 h-2 rounded-full mr-2" 
                  style={{ backgroundColor: data.datasets[0].backgroundColor[index] }}
                ></span>
                <span className="text-gray-400">{label}</span>
              </div>
              <span className="font-semibold">{data.datasets[0].data[index]}%</span>
            </div>
          ))}
        </div>
      </div> */}
    </div>
  );
};

export default OrderDistributionChart;