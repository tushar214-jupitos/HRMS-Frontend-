"use client";

import React, { useState } from "react";
import { toast } from "sonner";

export default function RequestResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/password-reset/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        toast.success("Check your email for the reset link!");
        setSent(true);
        setEmail("");
      } else {
        toast.error(data.message || "Failed to send email.");
      }
    } catch (e) {
      toast.error("Server error.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded shadow">
      {sent ? (
        <p className="text-green-600 text-center font-semibold">
          ✅ Email sent! Please check your inbox.
        </p>
      ) : (
        <form onSubmit={handleRequest}>
          <h2 className="text-lg font-semibold mb-4">Reset Password</h2>

          <input
            type="email"
            placeholder="Enter your email"
            className="w-full border p-2 rounded mb-4"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
            Send Reset Email
          </button>
        </form>
      )}
    </div>
  );
}
