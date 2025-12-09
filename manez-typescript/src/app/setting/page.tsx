"use client";

import React from "react";
import DashboardHeader from "@/components/layouts/header/DashboardHeader";
import DashBoardSidebar from "@/components/layouts/sidebar/DashBoardSidebar";

const SettingsPage = () => {
  return (
    <div className="app__slide-wrapper min-h-screen">
      {/* Sidebar + Header Only */}
      <DashBoardSidebar />
      <DashboardHeader />

      {/* Empty Page Body */}
      <div className="p-4 md:p-6">
        <div className="text-center text-muted">
          <p>This page is empty. Add your content here.</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
