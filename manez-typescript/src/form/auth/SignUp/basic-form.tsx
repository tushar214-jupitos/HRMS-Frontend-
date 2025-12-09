"use client";
import ErrorMessage from "@/components/error-message/ErrorMessage";
import { ISignUpForm } from "@/interface";
import { Checkbox, FormControlLabel } from "@mui/material";
import Link from "next/link";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const SignUpBasicForm = () => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ISignUpForm>();

  const onSubmit = async (data: ISignUpForm) => {
    try {
      const payload = {
        username: data.name,
        email: data.email,
        first_name: data.firstName,
        last_name: data.lastName,
        password: data.password,
        role: "employee", // default role
      };

      const res = await fetch(
        "https://cichoriaceous-kristeen-unnormally.ngrok-free.dev/api/users/register/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        console.log(result);
        throw new Error("Registration failed!");
      }

      toast.success("Sign Up successfully!");

      setTimeout(() => (window.location.href = "/"), 500);
    } catch (error: any) {
      toast.error(error.message || "Something went wrong!");
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Username */}
        <div className="from__input-box">
          <div className="form__input-title">
            <label htmlFor="nameEmail">Username</label>
          </div>
          <div className="form__input">
            <input
              id="nameEmail"
              className="form-control"
              type="text"
              {...register("name", { required: "Username is required" })}
            />
            <ErrorMessage error={errors.name} />
          </div>
        </div>

        {/* First Name */}
        <div className="from__input-box">
          <div className="form__input-title">
            <label>First Name</label>
          </div>
          <div className="form__input">
            <input
              className="form-control"
              type="text"
              {...register("firstName", { required: "First name is required" })}
            />
            <ErrorMessage error={errors.firstName} />
          </div>
        </div>

        {/* Last Name */}
        <div className="from__input-box">
          <div className="form__input-title">
            <label>Last Name</label>
          </div>
          <div className="form__input">
            <input
              className="form-control"
              type="text"
              {...register("lastName", { required: "Last name is required" })}
            />
            <ErrorMessage error={errors.lastName} />
          </div>
        </div>

        {/* Email */}
        <div className="from__input-box">
          <div className="form__input-title">
            <label htmlFor="email">Email</label>
          </div>
          <div className="form__input">
            <input
              id="email"
              className="form-control"
              type="email"
              {...register("email", { required: "Email is required" })}
            />
            <ErrorMessage error={errors.email} />
          </div>
        </div>

        {/* Password */}
        <div className="from__input-box">
          <div className="form__input-title flex justify-between">
            <label htmlFor="passwordInput">Password</label>
          </div>
          <div className="form__input">
            <input
              id="passwordInput"
              className="form-control"
              type={isPasswordVisible ? "text" : "password"}
              {...register("password", { required: "Password is required" })}
            />
            <ErrorMessage error={errors.password} />
            <div
              className="pass-icon"
              onClick={() => setIsPasswordVisible(!isPasswordVisible)}
            >
              <i
                className={`fa-sharp fa-light ${
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
              control={<Checkbox {...register("rememberMe")} />}
              label="Remember Me"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="mb-4">
          <button className="btn btn-primary w-full" type="submit">
            Sign Up
          </button>
        </div>
      </form>
    </>
  );
};

export default SignUpBasicForm;
