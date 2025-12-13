"use client";

import ErrorMessage from "@/components/error-message/ErrorMessage";
import { ISignInForm } from "@/interface";
import { Checkbox, FormControlLabel } from "@mui/material";
import Link from "next/link";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const SignInBasicForm = () => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ISignInForm>();

  const onSubmit = async (data: ISignInForm) => {
    setLoading(true);

    const payload = {
      username: data.name.trim(),
      password: data.password,
    };

    console.log("Sending login data:", payload);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/login/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await res.json();
      console.log("Backend response:", result);

      if (!res.ok) {
        toast.error(result.message || "Login failed");
        return;
      }

      // ===== Validate token existence =====
      if (!result.access || !result.refresh) {
        toast.error("Token missing in server response");
        return;
      }

      // ===== Save tokens =====
      localStorage.setItem("accessToken", result.access);
      localStorage.setItem("refreshToken", result.refresh);

      // ===== Save user =====
      if (result.user) {
        localStorage.setItem("user", JSON.stringify(result.user));
      }

      toast.success("Login successful");

      // ===== Redirect =====
      router.push("/");
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Username/Email */}
      <div className="from__input-box">
        <div className="form__input-title">
          <label htmlFor="nameEmail">Email or Username</label>
        </div>
        <div className="form__input">
          <input
            className="form-control"
            id="nameEmail"
            type="text"
            defaultValue=""
            {...register("name", {
              required: "Email or Username is required",
            })}
          />
          <ErrorMessage error={errors.name} />
        </div>
      </div>

      {/* Password */}
      <div className="from__input-box">
        <div className="form__input-title flex justify-between">
          <label htmlFor="passwordInput">Password</label>
          <Link href="/reset-password" className="text-sm text-primary">
            <small>Forgot Password?</small>
          </Link>
        </div>
        <div className="form__input">
          <input
            className="form-control"
            type={isPasswordVisible ? "text" : "password"}
            id="passwordInput"
            defaultValue=""
            {...register("password", { required: "Password is required" })}
          />
          <ErrorMessage error={errors.password} />
          <div className="pass-icon" onClick={togglePasswordVisibility}>
            <i
              className={`fa-solid ${
                isPasswordVisible ? "fa-eye" : "fa-eye-slash"
              }`}
            ></i>
          </div>
        </div>
      </div>

      {/* Remember Me */}
      <div className="mb-4">
        <div className="form-check">
          <FormControlLabel
            control={
              <Checkbox
                className="custom-checkbox"
                {...register("rememberMe")}
              />
            }
            label="Remember Me"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="mb-4">
        <button
          className="btn btn-primary w-full"
          type="submit"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </div>
    </form>
  );
};

export default SignInBasicForm;
