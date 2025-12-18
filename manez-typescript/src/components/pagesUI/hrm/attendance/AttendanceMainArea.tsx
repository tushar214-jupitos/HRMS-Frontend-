"use client"
import Breadcrumb from "@/common/Breadcrumb/breadcrumb";
import React, { useState } from "react";
import AttendanceTable from "./AttendanceTable";
import ShiftManagementTable from "./ShiftManagementTable";
import AttendanceTypeIcons from "./AttendanceTypeIcons";


const AttendanceMainArea = () => {
  const [activeTab, setActiveTab] = useState<'attendance' | 'shift'>('attendance');

  return (
    <>
      <div className="app__slide-wrapper">
        <Breadcrumb breadTitle="Attendance" subTitle="Home" />
        <AttendanceTypeIcons />
        <div className="flex mb-4">
          <button
            className={`px-4 py-2 rounded-t-lg ${activeTab === 'attendance' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setActiveTab('attendance')}
          >
            Attendance Records
          </button>
          <button
            className={`px-4 py-2 rounded-t-lg ${activeTab === 'shift' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setActiveTab('shift')}
          >
            Shift Management
          </button>
        </div>
        <div className="grid grid-cols-12 gap-x-6 maxXs:gap-x-0">
          {activeTab === 'attendance' ? <AttendanceTable /> : <ShiftManagementTable />}
        </div>
      </div>
    </>
  );
};

export default AttendanceMainArea;