import Breadcrumb from "@/common/Breadcrumb/breadcrumb";
import React from "react";
import ShiftManagementTable from "./ShiftManagementTable";
// import TodaysCheckInsReport from "./TodaysCheckInsReport";

const AttendanceMainArea = () => {
  return (
    <>
      <div className="app__slide-wrapper">
        <Breadcrumb breadTitle="Attendance" subTitle="Home" />
        <div className="grid grid-cols-12 gap-x-6 maxXs:gap-x-0">
          {/* <TodaysCheckInsReport /> */}
          <ShiftManagementTable />
        </div>
      </div>
    </>
  );
};

export default AttendanceMainArea;