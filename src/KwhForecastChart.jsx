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
import { firestore, loginFirestore } from "./firebase/firestore"; // Pastikan path ini benar
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  orderBy,
} from "firebase/firestore";
import { subMonths, startOfToday } from "date-fns";

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
        setLoading(true);
        await loginFirestore();

        // --- 1. Mengambil Data Aktual dari 'power_history' ---
        const oneMonthAgo = subMonths(startOfToday(), 1);
        const actualDataRef = collection(firestore, "power_history");
        const actualQuery = query(
          actualDataRef,
          where("timestamp", ">=", Timestamp.fromDate(oneMonthAgo)),
          orderBy("timestamp", "asc")
        );
        const actualSnapshot = await getDocs(actualQuery);
        const actualData = actualSnapshot.docs.map((doc) => ({
          x: doc.data().timestamp.toDate(),
          y: doc.data().energy_per_hour,
        }));

        // --- 2. Mengambil Data Prediksi dari 'monthly_forecast_data' ---
        const today = startOfToday();
        const predictionDataRef = collection(firestore, "monthly_forecast_data");
        const predictionQuery = query(
          predictionDataRef,
          where("time", ">=", Timestamp.fromDate(today)),
          orderBy("time", "asc")
        );
        const predictionSnapshot = await getDocs(predictionQuery);
        const predictionData = predictionSnapshot.docs.map((doc) => ({
          x: doc.data().time.toDate(),
          y: doc.data().predicted_energy_kwh,
        }));

        // --- 3. Menyiapkan Data untuk Chart ---
        setChartData({
          datasets: [
            {
              label: "kWh Aktual",
              data: actualData,
              borderColor: "#74f078",
              backgroundColor: "#74f078",
              tension: 0.3,
              pointRadius: 1,
            },
            {
              label: "kWh Prediksi",
              data: predictionData, // Menggunakan data yang sudah diproses
              borderColor: "#9865fa",
              backgroundColor: "#C6A8FF",
              borderDash: [10, 10],
              tension: 0.3,
              pointRadius: 1,
            },
          ],
        });
        
        // --- 4. Menentukan Nilai Max untuk Sumbu Y secara Dinamis ---
        const allYValues = [...actualData.map(d => d.y), ...predictionData.map(d => d.y)];
        const maxYValue = Math.max(...allYValues);
        const suggestedMax = maxYValue + (maxYValue * 0.1); // Tambah padding 10%

        // --- 5. Mengatur Opsi Chart ---
        setChartOptions({
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              type: "time",
              time: {
                unit: "month",
                tooltipFormat: "dd MMM yyyy HH:mm",
              },
              grid: { display: false },
              ticks: { color: "#333" },
            },
            y: {
              beginAtZero: true, // Mulai dari 0 agar lebih intuitif
              suggestedMax: suggestedMax, // ✅ Batas atas Y Axis dinamis
              grid: { color: "rgba(0, 0, 0, 0.05)" },
              ticks: { color: "#333" },
            },
          },
          plugins: {
            legend: { 
                position: "top", 
                labels: { color: "#000000" } // ✅ Warna diperbaiki
            },
          },
        });

      } catch (error) {
        console.error("Gagal mengambil data chart:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="page-container">
      {/* ✅ Wrapper diberi tinggi spesifik, misal 500px */}
      <div className="line-chart-wrapper mx-auto" style={{ height: "250px" }}> 
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