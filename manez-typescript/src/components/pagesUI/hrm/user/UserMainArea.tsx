"use client";
import Breadcrumb from "@/common/Breadcrumb/breadcrumb";
import React, { useEffect, useState } from "react";
import UserFilter from "./UserFilter";
import EmployeeSingleCard from "@/components/common/EmployeeSingleCard";
import { IEmployee } from "@/interface";

const UserMainArea = () => {
  const [employees, setEmployees] = useState<IEmployee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        // Get token from localStorage with fallback
        const fallbackToken =
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzY1NjUzNTMyLCJpYXQiOjE3NjUyMjE1MzIsImp0aSI6Ijk1OWE2YjM4Y2E3NDQ2N2RiY2ExMjkwMmMwMWJkYzEyIiwidXNlcl9pZCI6IjMifQ.ESK3uI0-OWYLAz3cxko4HQKjrVJeVsmUJGnGGkzvAtM";
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("authToken") || fallbackToken
            : fallbackToken;

        const response = await fetch(
          "https://cichoriaceous-kristeen-unnormally.ngrok-free.dev/api/users/list",
          {
            method: "GET",
            headers: {
              "ngrok-skip-browser-warning": "true",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        console.log("API Response:", data);

        // Transform API data to match IEmployee interface
        const transformedData = transformApiData(data);
        setEmployees(transformedData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching employee data:", error);
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  // Function to map API response to IEmployee interface
  // Helper to make role labels nicer, e.g. "super_admin" -> "Super Admin"
  const humanizeRole = (role?: string) => {
    if (!role) return "Employee";
    return role
      .toString()
      .replace(/_/g, " ")
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  // Function to map API response to IEmployee interface
  const transformApiData = (apiData: any): IEmployee[] => {
    const dataArray = Array.isArray(apiData)
      ? apiData
      : apiData?.results || apiData?.data || apiData?.users || [];

    return dataArray.map((item: any) => {
      const userObj = item.user ?? {};
      const id = Number(item.id ?? userObj.id ?? 0) || 0;

      const firstName = userObj.first_name ?? userObj.firstName ?? "";
      const lastName = userObj.last_name ?? userObj.lastName ?? "";

      const name =
        userObj.username ??
        (`${firstName} ${lastName}`.trim() ||
          `${userObj.first_name ?? ""}`.trim() ||
          "Unknown");

      const image =
        item.profile_image ||
        userObj.profile_image ||
        userObj.avatar ||
        userObj.picture ||
        "/default-avatar.png";

      const position = humanizeRole(item.role ?? userObj.role);

      const phone = item.phone ?? userObj.phone ?? "+1234567890";

      return {
        id,
        image,
        name,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        email: userObj.email ?? undefined,
        userName: userObj.username ?? undefined,
        employeeID: undefined,
        joiningDate: undefined,
        accountNumber: undefined,
        address: undefined,
        bankName: undefined,
        accountHolderName: undefined,
        branchName: undefined,
        position,
        phone,
        socialLinks: {
          facebook: "",
          twitter: "",
          linkedin: "",
          youtube: "",
          website: "#",
        },
      } as IEmployee;
    });
  };

  if (loading) {
    return (
      <div className="app__slide-wrapper">
        <Breadcrumb breadTitle="User" subTitle="Home" />
        <div className="text-center py-10">Loading employees...</div>
      </div>
    );
  }

  return (
    <>
      <div className="app__slide-wrapper">
        <Breadcrumb breadTitle="User" subTitle="Home" />
        <UserFilter />
        <div className="grid grid-cols-12 gap-x-6 maxXs:gap-x-0">
          {employees.length > 0 ? (
            employees.map((employee) => (
              <EmployeeSingleCard key={employee.id} employee={employee} />
            ))
          ) : (
            <div className="col-span-12 text-center py-10">No User found</div>
          )}
        </div>

        <div className="flex justify-center mt-[20px] mb-[20px]">
          <button type="button" className="btn btn-primary">
            Load More
          </button>
        </div>
      </div>
    </>
  );
};

export default UserMainArea;
