"use client";
import Link from "next/link";
import React, { useState } from "react";
import AddDepartmentModal from "./AddDepartmentModal";
import DepartmentTable from "./DepartmentTable";

const DepartmentMainArea = () => {
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
                Department
              </li>
            </ol>
          </nav>
          <div className="breadcrumb__btn">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setModalOpen(true)}
            >
              Add Department
            </button>
          </div>
        </div>
        <DepartmentTable />
        {modalOpen && (
          <AddDepartmentModal open={modalOpen} setOpen={setModalOpen} />
        )}
      </div>
    </>
  );
};

export default DepartmentMainArea;
