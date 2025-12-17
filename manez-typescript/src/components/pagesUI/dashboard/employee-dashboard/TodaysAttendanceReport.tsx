"use client";
import React from "react";

const TodaysAttendanceReport = () => {
  return (
    <div className="card__wrapper">
      <div className="card__title-wrap mb-4">
        <h5 className="card__heading-title">Today's Attendance</h5>
      </div>
      <div className="flex justify-center items-center h-48">
        <p>Attendance data not available</p>
      </div>
    </div>
  );
};

export default TodaysAttendanceReport;