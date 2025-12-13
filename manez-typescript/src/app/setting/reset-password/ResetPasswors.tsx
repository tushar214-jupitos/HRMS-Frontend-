// "use client";

// import React, { useState } from "react";
// import { toast } from "sonner";
// import { useRouter } from "next/navigation";

// export default function ResetPassword({ otpId }: { otpId: number }) {
//   const router = useRouter();

//   const [newPass, setNewPass] = useState("");
//   const [confirmPass, setConfirmPass] = useState("");
//   const [loading, setLoading] = useState(false);

//   const resetPassword = async () => {
//     if (newPass !== confirmPass) {
//       toast.error("Passwords do not match");
//       return;
//     }

//     setLoading(true);

//     const token = localStorage.getItem("access_token");

//     const res = await fetch(
//       "https://e.dev/users/after-login-password-reset/reset/",
//       {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           new_password: newPass,
//           confirm_password: confirmPass,
//           otp_id: otpId,
//         }),
//       }
//     );

//     const data = await res.json();
//     setLoading(false);

//     if (res.ok) {
//       toast.success("Password changed! Redirecting...");
//       setTimeout(() => router.push("/auth/signin-basic"), 2000);
//     } else {
//       toast.error(data.error || "Failed to reset password");
//     }
//   };

//   return (
//     <div>
//       <input
//         type="password"
//         placeholder="New Password"
//         className="w-full border p-2 rounded mb-3"
//         value={newPass}
//         onChange={(e) => setNewPass(e.target.value)}
//       />

//       <input
//         type="password"
//         placeholder="Confirm Password"
//         className="w-full border p-2 rounded mb-3"
//         value={confirmPass}
//         onChange={(e) => setConfirmPass(e.target.value)}
//       />

//       <button
//         onClick={resetPassword}
//         className="bg-purple-600 text-white p-2 rounded w-full"
//       >
//         {loading ? "Updating..." : "Reset Password"}
//       </button>
//     </div>
//   );
// }
