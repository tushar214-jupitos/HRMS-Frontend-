"use client";
import Breadcrumb from "@/common/Breadcrumb/breadcrumb";
import React, { useEffect, useState } from "react";
import UserFilter from "./UserFilter";
import EmployeeSingleCard from "@/components/common/EmployeeSingleCard";
import { IEmployee } from "@/interface";
import avatarPlaceholder from "../../../../../public/assets/images/avatar/avatar.png";
import { StaticImageData } from "next/image";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const UserMainArea = () => {
  const [employees, setEmployees] = useState<IEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get token from localStorage with fallback
        const fallbackToken =
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzY1NjUzNTMyLCJpYXQiOjE3NjUyMjE1MzIsImp0aSI6Ijk1OWE2YjM4Y2E3NDQ2N2RiY2ExMjkwMmMwMWJkYzEyIiwidXNlcl9pZCI6IjMifQ.ESK3uI0-OWYLAz3cxko4HQKjrVJeVsmUJGnGGkzvAt";
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("accessToken") || fallbackToken
            : fallbackToken;

        const res = await fetch(`${API_BASE_URL}/users/list`, {
          method: "GET",
          headers: {
            "ngrok-skip-browser-warning": "true",
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const rawData = await res.json();
        console.log("Raw API Response:", rawData);
        console.log("Response Type:", typeof rawData);
        
        // Transform API data to match IEmployee interface
        const transformedData = transformApiData(rawData);
        console.log("Transformed Data:", transformedData);
        
        setEmployees(transformedData);
      } catch (error: any) {
        console.error("Error fetching employee data:", error);
        setError(error.message || "Failed to load user data. Please try again later.");
      } finally {
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
    try {
      // Handle different API response structures
      let userList: any[] = [];
      
      if (Array.isArray(apiData)) {
        userList = apiData;
      } else if (apiData && typeof apiData === 'object') {
        if (apiData.results && Array.isArray(apiData.results)) {
          userList = apiData.results;
        } else if (apiData.data && Array.isArray(apiData.data)) {
          userList = apiData.data;
        } else if (apiData.users && Array.isArray(apiData.users)) {
          userList = apiData.users;
        } else if (Object.keys(apiData).length > 0) {
          // If it's a single object, wrap it in an array
          userList = [apiData];
        } else {
          userList = [];
        }
      } else {
        userList = [];
      }
      
      console.log("Processing user list:", userList);

      return userList.map((item: any, index: number) => {
        try {
          // Handle different API response structures
          const userObj = (item && typeof item === 'object' && item.user) ? item.user : item;
          
          // Extract user properties with proper fallbacks
          const id = Number(userObj?.id || item?.id || index + 1) || index + 1;
          
          // Extract names with multiple fallbacks
          const firstName = userObj?.first_name || userObj?.firstName || item?.first_name || item?.firstName || "";
          const lastName = userObj?.last_name || userObj?.lastName || item?.last_name || item?.lastName || "";
          
          // Construct name with multiple fallbacks
          const fullName = `${firstName} ${lastName}`.trim();
          const name = userObj?.username || 
                       item?.username || 
                       userObj?.name ||
                       item?.name ||
                       fullName ||
                       userObj?.email ||
                       item?.email ||
                       `User ${id}`;
          
          // Extract other properties with proper fallbacks
          const email = userObj?.email || item?.email || undefined;
          const username = userObj?.username || item?.username || undefined;
          const role = item?.role || userObj?.role || item?.user_type || userObj?.user_type || "Employee";
          const position = humanizeRole(role);
          const phone = item?.phone || userObj?.phone || item?.mobile || userObj?.mobile || "+1234567890";
          
          // Use placeholder image
          const image = avatarPlaceholder as StaticImageData;

          const employee: IEmployee = {
            id,
            image,
            name: name.trim() || `User ${id}`,
            firstName: firstName || undefined,
            lastName: lastName || undefined,
            email: email || undefined,
            userName: username || undefined,
            employeeID: undefined,
            joiningDate: undefined,
            accountNumber: undefined,
            address: undefined,
            bankName: undefined,
            accountHolderName: undefined,
            branchName: undefined,
            position: position || "Employee",
            phone: phone,
            socialLinks: {
              facebook: "#",
              twitter: "#",
              linkedin: "#",
              youtube: "#",
              website: "#",
            },
          };
          
          console.log("Processed employee:", employee);
          return employee;
        } catch (err) {
          console.error("Error processing user item:", item, err);
          // Return a fallback employee object
          return {
            id: index + 1,
            image: avatarPlaceholder as StaticImageData,
            name: `User ${index + 1}`,
            position: "Employee",
            phone: "+1234567890",
            socialLinks: {
              facebook: "#",
              twitter: "#",
              linkedin: "#",
              youtube: "#",
              website: "#",
            },
          } as IEmployee;
        }
      });
    } catch (err) {
      console.error("Error in transformApiData:", err);
      return [];
    }
  };

  if (loading) {
    return (
      <div className="app__slide-wrapper">
        <Breadcrumb breadTitle="User" subTitle="Home" />
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app__slide-wrapper">
        <Breadcrumb breadTitle="User" subTitle="Home" />
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center p-6 bg-red-50 rounded-lg max-w-md">
            <div className="text-red-500 mb-4">
              <i className="fas fa-exclamation-triangle text-3xl"></i>
            </div>
            <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Users</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="btn btn-primary"
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
        <Breadcrumb breadTitle="User" subTitle="Home" />
        <UserFilter />
        <div className="grid grid-cols-12 gap-x-6 maxXs:gap-x-0">
          {employees && employees.length > 0 ? (
            employees.map((employee) => (
              <EmployeeSingleCard key={employee.id} employee={employee} />
            ))
          ) : (
            <div className="col-span-12">
              <div className="flex justify-center items-center min-h-[300px]">
                <div className="text-center">
                  <i className="fas fa-users text-5xl text-gray-300 mb-4"></i>
                  <h3 className="text-xl font-medium text-gray-700 mb-2">No Users Found</h3>
                  <p className="text-gray-500">There are currently no users to display.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {employees && employees.length > 0 && (
          <div className="flex justify-center mt-[20px] mb-[20px]">
            <button type="button" className="btn btn-primary">
              Load More
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default UserMainArea;