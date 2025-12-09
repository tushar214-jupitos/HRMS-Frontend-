"use client";
import Breadcrumb from "@/common/Breadcrumb/breadcrumb";
import React, { useEffect, useState } from "react";
import EmployeeFilter from "./EmployeeFilter";
import EmployeeSingleCard from "@/components/common/EmployeeSingleCard";
import EmployeeDashboardCard from "./EmployeeDashboardCard";
import AddNewEmployeeModal from "./AddNewEmployeeModal";
import { IEmployee } from "@/interface";
import { StaticImageData } from "next/image";
import avatarPlaceholder from "../../../../../public/assets/images/avatar/avatar.png";
import EmployeeListView from "./EmployeeListView";

const EmployeeMainArea = () => {
  const [employees, setEmployees] = useState<IEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  const [modalOpen, setModalOpen] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [inactiveCount, setInactiveCount] = useState(0);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        const token = process.env.NEXT_PUBLIC_API_TOKEN;

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

        console.log("API Response:", data);

        let employeeList: any[] = [];

        if (Array.isArray(data)) {
          employeeList = data;
        } else if (data.results && Array.isArray(data.results)) {
          employeeList = data.results;
        } else if (data.data && Array.isArray(data.data)) {
          employeeList = data.data;
        } else if (data.employees && Array.isArray(data.employees)) {
          employeeList = data.employees;
        } else {
          console.error("Unexpected API response structure:", data);
          throw new Error("Invalid API response format");
        }

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

        // Calculate statistics
        const total = employeeList.length;
        const active = employeeList.filter(
          (emp: any) =>
            emp.employed_status === "Active" || emp.employed_status === "active"
        ).length;
        const inactive = employeeList.filter(
          (emp: any) =>
            emp.employed_status === "Inactive" ||
            emp.employed_status === "inactive"
        ).length;

        setTotalCount(total);
        setActiveCount(active);
        setInactiveCount(inactive);
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

        {/* Dashboard Cards and Add Employee Button */}
        <div className="grid grid-cols-12 gap-x-6 maxXs:gap-x-0 mb-[20px] items-end">
          <div className="col-span-12 xxl:col-span-9">
            <div className="grid grid-cols-12 gap-x-6 maxXs:gap-x-0 h-full">
              <EmployeeDashboardCard
                totalCount={totalCount}
                activeCount={activeCount}
                inactiveCount={inactiveCount}
              />
            </div>
          </div>
          <div className="col-span-12 xxl:col-span-3 flex justify-end h-full">
            <div className="card__wrapper w-full xxl:w-auto">
              <button
                type="button"
                className="btn btn-primary w-full"
                data-bs-toggle="modal"
                data-bs-target="#addNewEmployee"
                onClick={() => setModalOpen(true)}
              >
                Add Employee
              </button>
            </div>
          </div>
        </div>

        {modalOpen && (
          <AddNewEmployeeModal open={modalOpen} setOpen={setModalOpen} />
        )}

        <EmployeeFilter />

        {/* View Toggle Buttons */}
        <div className="flex justify-end mb-[20px] gap-2">
          <button
            type="button"
            className={`btn ${
              viewMode === "card" ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => setViewMode("card")}
            title="Card View"
          >
            <i className="fa-solid fa-grid-2"></i>
          </button>
          <button
            type="button"
            className={`btn ${
              viewMode === "list" ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => setViewMode("list")}
            title="List View"
          >
            <i className="fa-solid fa-list"></i>
          </button>
        </div>

        {employees.length === 0 ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <p className="text-gray-600 dark:text-gray-400">
              No employees found
            </p>
          </div>
        ) : (
          <>
            {viewMode === "card" ? (
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
            ) : (
              <EmployeeListView employees={employees} />
            )}
          </>
        )}
      </div>
    </>
  );
};

export default EmployeeMainArea;
