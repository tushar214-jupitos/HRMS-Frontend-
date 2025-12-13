"use client";

import React, { useState } from "react";
import DashboardHeader from "@/components/layouts/header/DashboardHeader";
import DashBoardSidebar from "@/components/layouts/sidebar/DashBoardSidebar";
import { toast } from "sonner";

const AfterLoginPasswordReset = () => {
  const [step, setStep] = useState<"request" | "otp" | "reset">("request");
  const [loading, setLoading] = useState(false);

  const [otp, setOtp] = useState("");
  const [otpId, setOtpId] = useState<number | null>(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const accessToken = localStorage.getItem("accessToken");

  if (!accessToken) {
    return (
      <p className="text-red-500 text-center mt-10">You must be logged in!</p>
    );
  }

  // STEP 1: REQUEST OTP
  const handleRequestOTP = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/after-login-password-reset/request/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "OTP sent to your email!");
        setStep("otp");
      } else {
        toast.error(data.error || "Failed to send OTP");
      }
    } catch {
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: VERIFY OTP
  const handleVerifyOTP = async () => {
    if (!otp) return toast.error("Enter OTP");

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/after-login-password-reset/verify-otp/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ otp_code: otp }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "OTP verified!");
        setOtpId(data.otp_id);
        setStep("reset");
      } else {
        toast.error(data.error || "Invalid OTP");
      }
    } catch {
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: RESET PASSWORD
  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) return toast.error("Enter password");

    if (newPassword !== confirmPassword)
      return toast.error("Passwords do not match");

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/after-login-password-reset/reset/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            new_password: newPassword,
            confirm_password: confirmPassword,
          }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Password reset successfully!");
        setTimeout(() => {
          window.location.href = "/auth/signin-basic";
        }, 1500);
      } else {
        toast.error(data.error || "Failed to reset password");
      }
    } catch {
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app__slide-wrapper min-h-screen">
      {/* NAVBAR */}
      <DashboardHeader />

      <div className="flex">
        {/* SIDEBAR */}
        <DashBoardSidebar />

        {/* MAIN CONTENT */}
        <div className="flex-1 p-6">
          <div className="max-w-md mx-auto bg-white p-6 rounded shadow-md">
            {step === "request" && (
              <div className="text-center">
                <h2 className="text-lg font-semibold mb-4">Reset Password</h2>
                <p>Click below to receive OTP on your registered email.</p>
                <button
                  className="mt-4 w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                  onClick={handleRequestOTP}
                  disabled={loading}
                >
                  {loading ? "Sending OTP..." : "Send OTP"}
                </button>
              </div>
            )}

            {step === "otp" && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Enter OTP</h2>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full border p-2 rounded mb-4"
                />
                <button
                  className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
                  onClick={handleVerifyOTP}
                  disabled={loading}
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
              </div>
            )}

            {step === "reset" && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Set New Password</h2>
                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border p-2 rounded mb-4"
                />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border p-2 rounded mb-4"
                />
                <button
                  className="w-full bg-purple-600 text-white p-2 rounded hover:bg-purple-700"
                  onClick={handleResetPassword}
                  disabled={loading}
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AfterLoginPasswordReset;
