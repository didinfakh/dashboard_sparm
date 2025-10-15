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
import { subMonths, startOfToday } from "date-fns";

// import VisualizationCard from "../components/VisualizationCard";
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      await loginFirestore();

      // --- 1. Mengambil Data Aktual dari 'power_history' (Tidak Berubah) ---
      const twoMonthsAgo = subMonths(startOfToday(), 2);
      const actualDataRef = collection(firestore, "power_history");
      const actualQuery = query(
        actualDataRef,
        where("timestamp", ">=", Timestamp.fromDate(twoMonthsAgo)),
        orderBy("timestamp", "asc")
      );

      const actualSnapshot = await getDocs(actualQuery);
      const actualData = actualSnapshot.docs.map((doc) => ({
        x: doc.data().timestamp.toDate(),
        y: doc.data().energy_per_hour,
      }));

      // --- 2. Mengambil Data Prediksi dari 'monthly_forecast_data' (Diperbarui) ---
      const today = startOfToday();
      const predictionDataRef = collection(firestore, "monthly_forecast_data");
      const predictionQuery = query(
        predictionDataRef,
        // ✅ DIUBAH: Menggunakan field "time"
        where("time", ">=", Timestamp.fromDate(today)),
        // ✅ DIUBAH: Mengurutkan berdasarkan "time"
        orderBy("time", "asc")
      );

      const predictionSnapshot = await getDocs(predictionQuery);

      console.log(
        "Data prediksi mentah diterima:",
        predictionSnapshot.docs.map((doc) => doc.data())
      );

      const predictionData = predictionSnapshot.docs.map((doc) => {
        return {
          // ✅ DIUBAH: Mengambil tanggal dari "time"
          x: doc.data().time.toDate(),
          // ✅ DIUBAH: Mengambil nilai dari "predicted_power"
          y: doc.data().predicted_power,
        };
      });

      // --- 3. Menyiapkan Data untuk Chart (Tidak Berubah) ---
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
            data: predictionSnapshot.docs.map((doc) => {
              return {
                x: doc.data().time.toDate(),
                y: doc.data().predicted_energy_kwh,
              };
            }),
            borderColor: "#9865fa",
            backgroundColor: "#C6A8FF",
            borderDash: [10, 10],
            tension: 0.3,
            pointRadius: 1,
          },
        ],
      });
      setLoading(false);
    };

    fetchData();
  }, []);

  // Opsi chart tetap sama, tidak perlu diubah
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: "time",
        time: {
          unit: "month",
          tooltipFormat: "dd MMM yyyy HH:mm",
        },
        grid: { color: "rgba(0, 0, 0, 0)" },
        ticks: { color: "#000" },
      },
      y: {
        beginAtZero: false,
        grid: { color: "rgba(0, 0, 0, 0)" },
        ticks: { color: "#0000" },
      },
    },
    plugins: {
      legend: { position: "top", labels: { color: "#0000000" } },
    },
  };

  return (
    <div className="page-container ">
      <div className="line-chart-wrapper mx-auto">
        {loading || !chartData ? (
          <p className="loading-text">Memuat data historis & prediksi...</p>
        ) : (
          <Line options={options} data={chartData} />
        )}
      </div>
    </div>
  );
}

export default KwhForecastChart;
