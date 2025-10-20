// src/visualizations/KwhForecastChart.jsx

import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { firestore, loginFirestore } from "./firebase/firestore";
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  orderBy,
} from "firebase/firestore";
import { subDays, addDays, startOfToday } from "date-fns";
import { id } from 'date-fns/locale';

import "./KwhForecastChart.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

function KwhForecastChart() {
  const [chartData, setChartData] = useState(null);
  const [chartOptions, setChartOptions] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true); // Mulai loading
        await loginFirestore();
        const today = startOfToday();

        // --- Fetching Data (Tidak ada perubahan) ---
        const tenDaysAgo = subDays(today, 10);
        const actualDataRef = collection(firestore, "power_history");
        const actualQuery = query( actualDataRef, where("timestamp", ">=", Timestamp.fromDate(tenDaysAgo)), orderBy("timestamp", "asc") );
        const actualSnapshot = await getDocs(actualQuery);
        const actualData = actualSnapshot.docs.map((doc) => ({ x: doc.data().timestamp.toDate(), y: doc.data().energy_per_hour }));

        const tenDaysFuture = addDays(today, 10);
        const predictionDataRef = collection(firestore, "monthly_forecast_data");
        const predictionQuery = query( predictionDataRef, where("time", ">=", Timestamp.fromDate(today)), where("time", "<=", Timestamp.fromDate(tenDaysFuture)), orderBy("time", "asc") );
        const predictionSnapshot = await getDocs(predictionQuery);
        const predictionData = predictionSnapshot.docs.map((doc) => ({ x: doc.data().time.toDate(), y: doc.data().predicted_energy_kwh }));

        // --- Persiapan Data Chart ---
        const allLabels = [...actualData.map(d => d.x), ...predictionData.map(d => d.x)];
        const allYValues = [...actualData.map(d => d.y), ...predictionData.map(d => d.y)];
        const maxYValue = Math.max(...allYValues, 0);
        const suggestedMax = maxYValue + (maxYValue * 0.1);

        // ✅ 1. Hitung indeks midpoint SEKARANG, setelah data siap
        const historicalMidpointIndex = Math.floor(actualData.length / 2);
        const predictionMidpointIndex = actualData.length + Math.floor(predictionData.length / 2);

        // --- Set Data Chart ---
        setChartData({
          labels: allLabels,
          datasets: [
            { label: "kWh Aktual", data: actualData, borderColor: "#9865fa", backgroundColor: "#9865fa", tension: 0.3, pointRadius: 1, borderWidth: 1.5 },
            { label: "kWh Prediksi", data: predictionData, borderColor: "#74f078", backgroundColor: "#74f078", borderDash: [10, 10], tension: 0.3, pointRadius: 1, borderWidth: 1.5 },
          ],
        });

        // --- Set Opsi Chart ---
        setChartOptions({
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              type: "category",
              grid: { display: false },
              ticks: {
                  color: "#333",
                  // ✅ 2. Modifikasi callback untuk menggunakan indeks yang sudah dihitung
                  callback: function(value, index, ticks) {
                    // Cek jika indeks cocok dengan midpoint yang sudah kita hitung
                    if (index === historicalMidpointIndex && actualData.length > 0) {
                      return 'Oktober';
                    }
                    if (index === predictionMidpointIndex && predictionData.length > 0) {
                      return 'November';
                    }
                    return null; // Sembunyikan label lain
                  },
                  autoSkip: false,
                  maxRotation: 0,
                  minRotation: 0,
               },
            },
            y: {
              beginAtZero: true,
              suggestedMax: suggestedMax,
              grid: { color: "rgba(0, 0, 0, 0.05)" },
              ticks: { color: "#333" },
            },
          },
          plugins: {
            tooltip: {
                callbacks: {
                    title: function(context) {
                        if (context[0] && context[0].label) {
                           try {
                                const date = new Date(context[0].label);
                                return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
                           } catch (e) { return context[0].label; }
                        }
                        return '';
                    }
                }
            },
            legend: {
              position: 'top', align: 'end',
              labels: { color: '#33374d', usePointStyle: false, boxWidth: 12, padding: 20, font: { size: 14, weight: '600' } }
            }
          },
        }); // Akhir setChartOptions

      } catch (error) {
        console.error("Gagal mengambil data chart:", error);
      } finally {
        setLoading(false); // Hentikan loading setelah selesai (sukses atau gagal)
      }
    };

    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Hapus dependensi fetchedData

  return (
    <div className="page-container">
      <div className="line-chart-wrapper mx-auto w-[]" style={{ height: "250px" }}>
        {loading || !chartData ? (
          <p className="loading-text">Memuat data historis & prediksi...</p>
        ) : (
          <Line options={chartOptions} data={chartData} />
        )}
      </div>
    </div>
  );
}

export default KwhForecastChart;