"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

export default function ResetPasswordConfirmPage() {
  const { uid, token } = useParams();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/password-reset-confirm/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            new_password: password,
            uid: uid,
            token: token,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        toast.success("Password reset successful! Redirecting...");
        setTimeout(() => router.push("/auth/signin-basic"), 2000);
      } else {
        const errorMsg = data.message || "Invalid token or link expired!";
        toast.error(errorMsg);
      }
    } catch (error) {
      toast.error("Server error!");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded shadow">
      <h2 className="text-lg font-semibold mb-4">Set New Password</h2>
      <form onSubmit={handleSubmit}>
        {/* New Password */}
        <div className="relative mb-4">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="New Password"
            className="w-full border p-2 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <span
            className="absolute right-3 top-3 cursor-pointer text-gray-500"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "👁️" : "👁️‍🗨️"}
          </span>
        </div>

        {/* Confirm Password */}
        <div className="relative mb-4">
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            className="w-full border p-2 rounded"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <span
            className="absolute right-3 top-3 cursor-pointer text-gray-500"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
          </span>
        </div>

        <button className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">
          Reset Password
        </button>
      </form>
    </div>
  );
}
