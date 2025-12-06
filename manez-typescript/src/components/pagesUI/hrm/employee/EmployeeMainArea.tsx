"use client";

import React, { useEffect, useState } from "react";
import Breadcrumb from "@/common/Breadcrumb/breadcrumb";
import EmployeeFilter from "./EmployeeFilter";
import EmployeeSingleCard from "@/components/common/EmployeeSingleCard";
import { IEmployee } from "@/interface";


const EmployeeMainArea = () => {
  const [employees, setEmployees] = useState<IEmployee[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem("access"); // your token storage

      const response = await fetch(
        "https://cichoriaceous-kristeen-unnormally.ngrok-free.dev/api/users/list",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      // Convert API response → IEmployee format
     const mappedEmployees: IEmployee[] = data.results.map((item: any) => ({
       id: item.id,
       image: item.profile_image
         ? item.profile_image
         : "/assets/img/default-user.png", // fallback image
       name: `${item.user.first_name} ${item.user.last_name}`,
       firstName: item.user.first_name,
       lastName: item.user.last_name,
       email: item.user.email,
       userName: item.user.username,
       position: item.role, // API field
       phone: item.phone, // API field
       socialLinks: {
         facebook: "",
         twitter: "",
         linkedin: "",
         youtube: "",
         website: "",
       },
     }));

      setEmployees(mappedEmployees);
    } catch (error) {
      console.error("Fetch employees error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <>
      <div className="app__slide-wrapper">
        <Breadcrumb breadTitle="Employee" subTitle="Home" />
        <EmployeeFilter />

        {loading ? (
          <p className="text-center py-10">Loading...</p>
        ) : (
          <div className="grid grid-cols-12 gap-x-6 maxXs:gap-x-0">
            {employees.map((employee, index) => (
              <EmployeeSingleCard key={index} employee={employee} />
            ))}
          </div>
        )}

        <div className="flex justify-center mt-[20px] mb-[20px]">
          <button type="button" className="btn btn-primary">
            Load More
          </button>
        </div>
      </div>
    </>
  );
};

export default EmployeeMainArea;
