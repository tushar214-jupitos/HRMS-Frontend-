"use client";
import Link from "next/link";
import React, { useState } from "react";
import LeaveTypesTable from "./LeaveTypesTable";
import LeaveBalancesTable from "./LeaveBalancesTable";
import AddLeaveTypeModal from "./AddLeaveTypeModal";
import AssignLeaveBalanceModal from "./AssignLeaveBalanceModal";

const LeaveSettingsMainArea = () => {
  const [activeTab, setActiveTab] = useState<"types" | "balances">("types");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleAddSuccess = () => {
    handleRefresh();
    setShowAddModal(false);
  };

  const handleAssignSuccess = () => {
    handleRefresh();
    setShowAssignModal(false);
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
                Leave Settings
              </li>
            </ol>
          </nav>
          <div className="breadcrumb__btn">
            {activeTab === "types" ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setShowAddModal(true)}
              >
                Add Leave Type
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setShowAssignModal(true)}
              >
                Assign Balance
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab("types")}
                className={`${
                  activeTab === "types"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Leave Types
              </button>
              <button
                onClick={() => setActiveTab("balances")}
                className={`${
                  activeTab === "balances"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Leave Balances
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-12 gap-x-6 maxXs:gap-x-0">
          {activeTab === "types" ? (
            <LeaveTypesTable refreshTrigger={refreshTrigger} />
          ) : (
            <LeaveBalancesTable refreshTrigger={refreshTrigger} />
          )}
        </div>

        {/* Modals */}
        {showAddModal && (
          <AddLeaveTypeModal
            open={showAddModal}
            setOpen={setShowAddModal}
            onSuccess={handleAddSuccess}
          />
        )}

        {showAssignModal && (
          <AssignLeaveBalanceModal
            open={showAssignModal}
            setOpen={setShowAssignModal}
            onSuccess={handleAssignSuccess}
          />
        )}
      </div>
    </>
  );
};

export default LeaveSettingsMainArea;
