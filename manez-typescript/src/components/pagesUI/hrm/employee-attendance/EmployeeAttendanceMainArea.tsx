"use client"
import Breadcrumb from "@/common/Breadcrumb/breadcrumb";
import React, { useState } from "react";
import EmployeeAttendanceSummary from "./EmployeeAttendanceSummary";
import EmployeeAttendanceTable from "./EmployeeAttendanceTable";
import CalendarAttendanceTable from "./CalendarAttendanceTable";
// import TodaysCheckInsReport from "../attendance/TodaysCheckInsReport";

const EmployeeAttendanceMainArea = () => {
  const [activeTab, setActiveTab] = useState<'table' | 'calendar'>('table');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Function to trigger refresh in both views
  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <>
      <div className="app__slide-wrapper">
        <Breadcrumb breadTitle="Employee Attendance" subTitle="Home" />
        <div className="grid grid-cols-12 gap-x-6 maxXs:gap-x-0">
          {/* <TodaysCheckInsReport /> */}
          {/* <EmployeeAttendanceSummary /> */}
          
          {/* Tab Navigation */}
          <div className="col-span-12 mb-6">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('table')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'table'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  List View
                </button>
                <button
                  onClick={() => setActiveTab('calendar')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'calendar'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  Calendar View
                </button>
              </nav>
            </div>
          </div>
          
          {/* Tab Content */}
          {activeTab === 'table' ? 
            <EmployeeAttendanceTable refreshTrigger={refreshTrigger} onRefresh={triggerRefresh} /> : 
            <CalendarAttendanceTable refreshTrigger={refreshTrigger} />
          }
        </div>
      </div>
    </>
  );
};

export default EmployeeAttendanceMainArea;