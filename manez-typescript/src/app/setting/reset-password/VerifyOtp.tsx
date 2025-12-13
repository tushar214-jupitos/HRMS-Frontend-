// "use client";

// import React, { useState } from "react";
// import { toast } from "sonner";

// export default function VerifyOtp({
//   setOtpId,
// }: {
//   setOtpId: (id: number) => void;
// }) {
//   const [otp, setOtp] = useState("");
//   const [loading, setLoading] = useState(false);

//   const verifyOtp = async () => {
//     setLoading(true);

//     const token = localStorage.getItem("access_token");

//     const res = await fetch(
//       "https://astrologically-smashable-paxton.ngrok-free.dev/api/users/after-login-password-reset/verify-otp/",
//       {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ otp_code: otp }),
//       }
//     );

//     const data = await res.json();
//     setLoading(false);

//     if (res.ok) {
//       toast.success("OTP Verified");
//       setOtpId(data.otp_id);
//       window.dispatchEvent(new CustomEvent("otp-verified"));
//     } else {
//       toast.error(data.error || "Invalid OTP");
//     }
//   };

//   return (
//     <div>
//       <input
//         type="text"
//         maxLength={6}
//         placeholder="Enter OTP"
//         className="w-full border p-2 rounded mb-3"
//         value={otp}
//         onChange={(e) => setOtp(e.target.value)}
//       />

//       <button
//         onClick={verifyOtp}
//         className="bg-green-600 text-white p-2 rounded w-full"
//       >
//         {loading ? "Verifying..." : "Verify OTP"}
//       </button>
//     </div>
//   );
// }
