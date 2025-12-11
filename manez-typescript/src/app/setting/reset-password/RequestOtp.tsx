"use client";

import React, { useState } from "react";
import { toast } from "sonner";

export default function RequestOtp() {
  const [loading, setLoading] = useState(false);

  const requestOtp = async () => {
    setLoading(true);

    const token = localStorage.getItem("access_token");

    const res = await fetch(
      "https://astrologically-smashable-paxton.ngrok-free.dev/api/users/after-login-password-reset/request/",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      toast.success(data.message || "OTP sent to your email");
      window.dispatchEvent(new CustomEvent("otp-sent"));
    } else {
      toast.error(data.error || "Error sending OTP");
    }
  };

  return (
    <div>
      <button
        onClick={requestOtp}
        className="bg-blue-600 text-white p-2 rounded w-full"
      >
        {loading ? "Sending OTP..." : "Send OTP"}
      </button>
    </div>
  );
}
