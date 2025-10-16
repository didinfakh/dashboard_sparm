import React from "react";
import ProjectStats from "./components/ProjectStats ";
import ProjectStats1 from "./components/ProjectStats1";

const Dashboard1 = () => {
  return (
    <main className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          {/* <h2 className="text-3xl font-bold text-gray-800">Dashboard 2</h2>
          <p className="text-gray-500">You have 3 appointments today</p> */}
        </div>
      </div>

      <div className="">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Patient Body Analysis */}
          <div className="md:col-span-2  p-4 rounded-2xl">
            <div className="flex justify-between items-center mb-4">
              {/* <h3 className="font-semibold">Patient Body Analysis</h3>
              <button className="text-sm text-gray-500 flex items-center gap-2">
                Real Time
              </button> */}
            </div>
            <ProjectStats1 />
          </div>
        </div>
      </div>
    </main>
  );
};

export default Dashboard1;
