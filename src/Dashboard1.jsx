import React from "react";
import ProjectStats1 from "./components/ProjectStats1";

const Dashboard1 = () => {
  return (
    // Kita gunakan <main> sebagai container utama.
    // p-6: Memberi jarak di sekeliling konten.
    // bg-gray-100: Memberi sedikit warna latar belakang agar tidak putih polos.
    // min-h-screen: Memastikan latar belakang memenuhi tinggi layar.
    <main className="p-6 bg-gray-100 min-h-screen">
      <ProjectStats1 />
    </main>
  );
};

export default Dashboard1;