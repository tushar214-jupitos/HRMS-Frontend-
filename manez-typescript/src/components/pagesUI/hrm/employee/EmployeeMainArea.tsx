"use client";
import Breadcrumb from "@/common/Breadcrumb/breadcrumb";
import React, { useEffect, useState } from "react";
import EmployeeFilter from "./EmployeeFilter";
import EmployeeSingleCard from "@/components/common/EmployeeSingleCard";
import { IEmployee } from "@/interface";
import { StaticImageData } from "next/image";
import avatarPlaceholder from "../../../../../public/assets/images/avatar/avatar.png";

const EmployeeMainArea = () => {
  const [employees, setEmployees] = useState<IEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const apiUrl =
          process.env.NEXT_PUBLIC_API_BASE_URL;
        const token =
          process.env.NEXT_PUBLIC_API_TOKEN;

        const response = await fetch(`${apiUrl}/employee/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch employees");
        }

        const data = await response.json();

        // Log the response to see its structure
        console.log("API Response:", data);

        // Handle different response structures
        let employeeList: any[] = [];

        if (Array.isArray(data)) {
          // If data is directly an array
          employeeList = data;
        } else if (data.results && Array.isArray(data.results)) {
          // If data has a results property
          employeeList = data.results;
        } else if (data.data && Array.isArray(data.data)) {
          // If data has a data property
          employeeList = data.data;
        } else if (data.employees && Array.isArray(data.employees)) {
          // If data has an employees property
          employeeList = data.employees;
        } else {
          console.error("Unexpected API response structure:", data);
          throw new Error("Invalid API response format");
        }

        // Transform API data to match IEmployee interface
        const transformedData: IEmployee[] = employeeList.map((emp: any) => ({
          id: emp.id || emp.emp_id,
          image: avatarPlaceholder as StaticImageData,
          name: `${emp.first_name || ""} ${emp.last_name || ""}`.trim(),
          position: emp.designation || emp.role || "Employee",
          phone: emp.mobile || emp.contact_number || "+1234567890",
          socialLinks: {
            facebook: "https://www.facebook.com",
            twitter: "https://x.com",
            linkedin: "https://www.linkedin.com",
            youtube: "https://www.youtube.com/channel",
            website: "#",
          },
          firstName: emp.first_name,
          lastName: emp.last_name,
          email: emp.official_email,
          employeeID: emp.emp_id,
          joiningDate: emp.date_of_joining,
          address: emp.address,
          bankName: emp.bank_name,
          accountNumber: emp.account_number,
        }));

        setEmployees(transformedData);
        setError(null);
      } catch (err) {
        console.error("Error fetching employees:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load employees"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  if (loading) {
    return (
      <div className="app__slide-wrapper">
        <Breadcrumb breadTitle="Employee" subTitle="Home" />
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div
              className="spinner-border animate-spin inline-block w-12 h-12 border-4 rounded-full border-primary border-t-transparent"
              role="status"
            >
              <span className="sr-only">Loading...</span>
            </div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Loading employees...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app__slide-wrapper">
        <Breadcrumb breadTitle="Employee" subTitle="Home" />
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="text-red-500 text-xl mb-4">
              <i className="fa-solid fa-exclamation-triangle"></i>
            </div>
            <p className="text-red-500 dark:text-red-400">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary mt-4"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="app__slide-wrapper">
        <Breadcrumb breadTitle="Employee" subTitle="Home" />
        <EmployeeFilter />

        {employees.length === 0 ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <p className="text-gray-600 dark:text-gray-400">
              No employees found
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-12 gap-x-6 maxXs:gap-x-0">
              {employees.map((employee, index) => (
                <EmployeeSingleCard
                  key={employee.id || index}
                  employee={employee}
                />
              ))}
            </div>

            <div className="flex justify-center mt-[20px] mb-[20px]">
              <button type="button" className="btn btn-primary">
                Load More
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default EmployeeMainArea;
