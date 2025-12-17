"use client";
import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent } from "@mui/material";
import { statePropsType } from "@/interface/common.interface";
import { useForm } from "react-hook-form";
import InputField from "@/components/elements/SharedInputs/InputField";
import { toast } from "sonner";

interface RegisterUser {
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  department: number;
}

const AddNewUser = ({ open, setOpen }: statePropsType) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterUser>();

  const [roles, setRoles] = useState<string[]>([]);
  const [departments, setDepartments] = useState<{id: number, name: string}[]>([]);

  const handleToggle = () => setOpen(!open);

  // ===========================
  // Fetch Roles & Departments
  // ===========================
  useEffect(() => {
    if (!open) return;

    const fetchDropdownData = async () => {
      try {
        const token = localStorage.getItem("accessToken");

        if (!token) {
          toast.error("Unauthorized! Please login again.");
          return;
        }

        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        };

        const rolesRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/dropdowns/user/roles/`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
              "ngrok-skip-browser-warning": "true",
            },
          }
        );

        const departmentsRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/dropdowns/user/department-choices/`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
              "ngrok-skip-browser-warning": "true",
            },
          }
        );

        if (!rolesRes.ok || !departmentsRes.ok) {
          toast.error("Failed to load dropdown data (Unauthorized)");
          return;
        }

        // Parse roles as array of strings
        const rolesData: string[] = await rolesRes.json();
        const departmentsData: {id: number, name: string}[] = await departmentsRes.json();

        setRoles(rolesData || []);
        setDepartments(departmentsData || []);
      } catch (err) {
        toast.error("Failed to load dropdown data!");
      }
    };

    fetchDropdownData();
  }, [open]);

  // ===========================
  // Submit Registration
  // ===========================
  const onSubmit = async (data: RegisterUser) => {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        toast.error("Unauthorized! Please login again.");
        return;
      }

      // Log the data being sent
      console.log("Sending data to API:", data);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/register/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({
            ...data,
            department: parseInt(data.department as unknown as string)
          }),
        }
      );

      const responseData = await res.json();
      console.log("API Response:", responseData);

      if (!res.ok) {
        toast.error(responseData?.message || "Registration failed");
        return;
      }

      toast.success("User Registered Successfully!");
      setTimeout(() => setOpen(false), 1000);
    } catch (error) {
      toast.error("Something went wrong. Try again!");
    }
  };

  return (
    <Dialog open={open} onClose={handleToggle} fullWidth maxWidth="sm">
      <DialogTitle>
        <div className="flex justify-between">
          <h5 className="modal-title">Register User</h5>
          <button onClick={handleToggle} type="button" className="bd-btn-close">
            <i className="fa-solid fa-xmark-large"></i>
          </button>
        </div>
      </DialogTitle>

      <DialogContent className="common-scrollbar max-h-screen overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-12 gap-6">
            {/* First Name */}
            <div className="col-span-12 md:col-span-6">
              <InputField
                label="First Name"
                id="first_name"
                register={register("first_name", {
                  required: "First Name is required",
                })}
                error={errors.first_name}
              />
            </div>

            {/* Last Name */}
            <div className="col-span-12 md:col-span-6">
              <InputField
                label="Last Name"
                id="last_name"
                register={register("last_name", {
                  required: "Last Name is required",
                })}
                error={errors.last_name}
              />
            </div>

            {/* Email */}
            <div className="col-span-12 md:col-span-6">
              <InputField
                label="Email Address"
                id="email"
                type="email"
                register={register("email", { required: "Email is required" })}
                error={errors.email}
              />
            </div>

            {/* Username */}
            <div className="col-span-12 md:col-span-6">
              <InputField
                label="Username"
                id="username"
                register={register("username", {
                  required: "Username is required",
                })}
                error={errors.username}
              />
            </div>

            {/* Password */}
            <div className="col-span-12 md:col-span-6">
              <InputField
                label="Password"
                id="password"
                type="password"
                register={register("password", {
                  required: "Password is required",
                })}
                error={errors.password}
              />
            </div>

            {/* Role Dropdown */}
            <div className="col-span-12 md:col-span-6">
              <label
                htmlFor="role"
                className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
              >
                Role
              </label>
              <select
                id="role"
                className={`w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border ${
                  errors.role ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                {...register("role", { required: "Role is required" })}
              >
                <option value="" className="text-gray-400">
                  Select Role
                </option>
                {roles?.map((role: string, index: number) => (
                  <option key={index} value={role} className="text-gray-900 dark:text-white bg-white dark:bg-gray-800">
                    {role.charAt(0).toUpperCase() + role.slice(1).replace(/_/g, " ")}
                  </option>
                ))}
              </select>
              {errors.role && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.role.message}
                </p>
              )}
            </div>

            {/* Department Dropdown */}
            <div className="col-span-12 md:col-span-6">
              <label
                htmlFor="department"
                className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
              >
                Department
              </label>
              <select
                id="department"
                className={`w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border ${
                  errors.department ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                {...register("department", {
                  required: "Department is required",
                  setValueAs: (v) => (v === "" ? "" : parseInt(v)),
                })}
              >
                <option value="" className="text-gray-400">
                  Select Department
                </option>
                {departments?.map((dept) => (
                  <option key={dept.id} value={dept.id} className="text-gray-900 dark:text-white bg-white dark:bg-gray-800">
                    {dept.name}
                  </option>
                ))}
              </select>
              {errors.department && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.department.message}
                </p>
              )}
            </div>
          </div>

          <div className="submit__btn text-center mt-6">
            <button className="btn btn-primary" type="submit">
              Register
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddNewUser;