"use client";
import React, { useState } from "react";
import Link from "next/link";
import EmploymentTypeTable from "@/components/pagesUI/master-data/employment-type/EmploymentTypeTable";
import AddEmploymentTypeModal from "@/components/pagesUI/master-data/employment-type/AddEmploymentTypeModal";

const EmploymentTypeMainArea = () => {
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <>
      <div className="app__slide-wrapper">
        <div className="breadcrumb__wrapper mb-[25px]">
          <nav>
            <ol className="breadcrumb flex items-center mb-0">
              <li className="breadcrumb-item">
                <Link href="/">Home</Link>
              </li>
              <li className="breadcrumb-item">
                <Link href="#">Master Data</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Employment Type
              </li>
            </ol>
          </nav>
          <div className="breadcrumb__btn">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setModalOpen(true)}
            >
              Add Employment Type
            </button>
          </div>
        </div>
        <EmploymentTypeTable />
        {modalOpen && (
          <AddEmploymentTypeModal open={modalOpen} setOpen={setModalOpen} />
        )}
      </div>
    </>
  );
};

export default EmploymentTypeMainArea;
