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
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
}

const AddNewUser = ({ open, setOpen }: statePropsType) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterUser>();

  const [roles, setRoles] = useState<string[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);

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

        const [rolesRes, deptRes] = await Promise.all([
          fetch(
            "https://astrologically-smashable-paxton.ngrok-free.dev/api/dropdowns/user/roles/",
            { headers }
          ),
          fetch(
            "https://astrologically-smashable-paxton.ngrok-free.dev/api/dropdowns/user/departments/",
            { headers }
          ),
        ]);

        if (!rolesRes.ok || !deptRes.ok) {
          toast.error("Failed to load dropdown data (Unauthorized)");
          return;
        }

        const rolesData: string[] = await rolesRes.json();
        const departmentsData: string[] = await deptRes.json();

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

      const res = await fetch(
        "https://astrologically-smashable-paxton.ngrok-free.dev/api/users/register/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify(data),
        }
      );

      const responseData = await res.json();

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
                id="firstName"
                register={register("firstName", {
                  required: "First Name is required",
                })}
                error={errors.firstName}
              />
            </div>

            {/* Last Name */}
            <div className="col-span-12 md:col-span-6">
              <InputField
                label="Last Name"
                id="lastName"
                register={register("lastName", {
                  required: "Last Name is required",
                })}
                error={errors.lastName}
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
                className="block text-sm font-medium mb-1 text-white"
              >
                Role
              </label>
              <select
                id="role"
                className={`input w-full bg-gray-800 text-white border ${
                  errors.role ? "border-red-500" : "border-gray-600"
                } rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                {...register("role", { required: "Role is required" })}
              >
                <option value="" className="text-gray-400">
                  Select Role
                </option>
                {roles?.map((role: string, index: number) => (
                  <option key={index} value={role} className="text-white">
                    {role}
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
                className="block text-sm font-medium mb-1 text-white"
              >
                Department
              </label>
              <select
                id="department"
                className={`input w-full bg-gray-800 text-white border ${
                  errors.department ? "border-red-500" : "border-gray-600"
                } rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                {...register("department", {
                  required: "Department is required",
                })}
              >
                <option value="" className="text-gray-400">
                  Select Department
                </option>
                {departments?.map((dept: string, index: number) => (
                  <option key={index} value={dept} className="text-white">
                    {dept}
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
