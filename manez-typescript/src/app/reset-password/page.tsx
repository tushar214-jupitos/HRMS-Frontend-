"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
//import DashboardHeader from "@/components/layouts/header/DashboardHeader";
//import DashBoardSidebar from "@/components/layouts/sidebar/DashBoardSidebar";
import BasicResetPasswordForm from "@/app/auth/reset-password-basic/page";
import RequestResetPasswordPage from "@/app/auth/reset-password-basic/page";

const SettingsPage = () => {
  const [showReset, setShowReset] = useState(false);
  const router = useRouter();

  const handleRedirect = () => {
    router.push("/auth/reset-password"); // your reset password page
  };

  return (
    <div className="app__slide-wrapper min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      {/* <DashBoardSidebar /> */}

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* <DashboardHeader /> */}

        {/* Centered buttons with spacing from top */}
        <div className="p-4 md:p-6 flex justify-center space-y-4 md:space-y-0 md:space-x-4 flex-col md:flex-row mt-16 md:mt-20">
          <button
            onClick={() => setShowReset(!showReset)}
            className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 w-full md:w-auto"
          >
            {showReset ? "Close Reset Password" : "Reset Password"}
          </button>
        </div>

        {/* Inline form */}
        <div className="p-4 md:p-6">
          {showReset && <RequestResetPasswordPage />}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
