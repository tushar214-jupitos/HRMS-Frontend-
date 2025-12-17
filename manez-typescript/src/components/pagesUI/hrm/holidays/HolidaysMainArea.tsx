"use client";
import Link from "next/link";
import React, { useState } from "react";
import HolidayTable from "./HolidayTable";
import AddNewHoliday from "./AddNewHoliday";

const HolidaysMainArea = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Function to handle successful holiday creation/update
  const handleHolidaySuccess = () => {
    setRefreshKey(prev => prev + 1); // Increment to trigger refresh
  };

  return (
    <>
      <div className="app__slide-wrapper">
        <div className="breadcrumb__wrapper mb-[25px]">
          <nav>
            <ol className="breadcrumb flex items-center mb-0">
              <li className="breadcrumb-item">
                <Link href="/">Home</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Holidays
              </li>
            </ol>
          </nav>
          <div className="breadcrumb__btn">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setModalOpen(true)}
            >
              Add Holidays
            </button>
          </div>
        </div>
        {/* table */}
        <HolidayTable key={`holiday-table-${refreshKey}`} />

        {modalOpen && (
          <AddNewHoliday 
            open={modalOpen} 
            setOpen={(isOpen) => {
              setModalOpen(isOpen);
              // Refresh table when modal closes after successful operation
              if (!isOpen) {
                handleHolidaySuccess();
              }
            }} 
          />
        )}
      </div>
    </>
  );
};

export default HolidaysMainArea;