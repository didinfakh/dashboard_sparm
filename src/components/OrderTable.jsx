// src/components/OrderTable.jsx

import React from 'react';

const orderTableData = [
  { 
    id: '#200211', 
    type: 'Traffic', 
    date: '13 Nov, 2022', 
    reporter: 'Nova Post', 
    status: 'Reported', 
    logoColor: 'bg-red-500', 
    statusClass: 'bg-purple-900 text-purple-300'
  },
  { 
    id: '#200212', 
    type: 'Planning mistake', 
    date: '16 Nov, 2022', 
    reporter: 'DHL', 
    status: 'In review', 
    logoColor: 'bg-yellow-500', 
    statusClass: 'bg-green-900 text-green-300'
  },
  { 
    id: '#765947', 
    type: 'Delay', 
    date: '24 Nov, 2022', 
    reporter: 'UPS', 
    status: 'Reported', 
    logoColor: 'bg-orange-600', 
    statusClass: 'bg-purple-900 text-purple-300' 
  },
  { 
    id: '#501833', 
    type: 'Wrong format', 
    date: '01 Dec, 2022', 
    reporter: 'FedEx', 
    status: 'In review', 
    logoColor: 'bg-blue-600', 
    statusClass: 'bg-green-900 text-green-300'
  },
];

const OrderTable = () => {
  return (

    <div className="bg-[#2a2c34] p-6 rounded-lg shadow-xl text-white w-full">
      <h2 className="text-xl font-semibold mb-4">Order Status Report</h2>
      <table className="min-w-full divide-y divide-gray-700">
        
        <thead className="text-xs font-medium text-gray-400 uppercase tracking-wider">
          <tr>
            <th scope="col" className="py-3 text-left border border-black">ORDER NUMBER</th>
            <th scope="col" className="py-3 text-left">TYPE</th>
            <th scope="col" className="py-3 text-left">DATE</th>
            <th scope="col" className="py-3 text-left">REPORTED BY</th>
            <th scope="col" className="py-3 text-right">STATUS</th>
          </tr>
        </thead>

        {/* Isi Tabel */}
        <tbody className="divide-y divide-gray-800 text-sm">
          {orderTableData.map((order) => (
            <tr key={order.id} className="text-white hover:bg-[#374151]">
              
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
};

export default OrderTable;