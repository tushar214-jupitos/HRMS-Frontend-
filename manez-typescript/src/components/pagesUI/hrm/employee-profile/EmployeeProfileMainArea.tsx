"use client";
import Breadcrumb from "@/common/Breadcrumb/breadcrumb";
import { idType } from "@/interface/common.interface";
import React, { useEffect, useState } from "react";
import PersonalInformation from "./PersonalInformation";
import EmergencyContact from "./EmergencyContact";

import EducationQualification from "./EducationQualification";
import ExperienceDetails from "./ExperienceDetails";
import BankAccount from "./BankAccount";

import SocialProfile from "./SocialProfile";
import Passport from "./Passport";
import { IEmployee } from "@/interface";
import avatarPlaceholder from "../../../../../public/assets/images/avatar/avatar.png";

const EmployeeProfileMainArea = ({ id }: idType) => {
  const [employee, setEmployee] = useState<IEmployee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        setLoading(true);
        const base =
          process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "";
        const token = process.env.NEXT_PUBLIC_API_TOKEN;
        if (!base) {
          throw new Error("API base URL is not configured");
        }

        const endpoint = `${base}/employee/${id}/`;
        const response = await fetch(endpoint, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            "ngrok-skip-browser-warning": "true",
          },
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || "Failed to fetch employee");
        }

        const data = await response.json();
        const mapped: IEmployee = {
          id: data.id ?? id,
          image: avatarPlaceholder,
          name:
            data.full_name ||
            `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim() ||
            data.emp_id ||
            "Employee",
          firstName: data.first_name,
          lastName: data.last_name,
          email: data.official_email,
          employeeID: data.emp_id,
          joiningDate: data.date_of_joining,
          address: data.address || data.permanent_address,
          position: data.designation || data.employed_status || "N/A",
          role: data.employed_status,
          phone: data.mobile || data.alternate_mobile || "N/A",
          date_of_birth: data.date_of_birth,
          gender: data.gender || "N/A",
          fatherName: data.father_or_husband_name,
          fatherAge: data.father_age,
          bankName: data.bank_name,
          accountNumber: data.account_number,
          aadhaarNumber: data.aadhaar_number,
          panNumber: data.pan_number,
          has_uan: data.has_uan,
          uan_number: data.uan_number,
          permanent_address: data.permanent_address,
          overall_experience: data.overall_experience,
          previous_experience: data.previous_experience,
          socialLinks: {
            facebook: "https://www.facebook.com",
            twitter: "https://x.com",
            linkedin: "https://www.linkedin.com",
            youtube: "https://www.youtube.com/channel",
            website: "#",
          },
        };

        setEmployee(mapped);
        setError(null);
      } catch (err) {
        console.error("Employee fetch error", err);
        setError(
          err instanceof Error ? err.message : "Failed to load employee"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id]);

  if (loading) {
    return (
      <div className="app__slide-wrapper">
        <Breadcrumb breadTitle="Employee Profile" subTitle="Home" />
        <div className="flex justify-center items-center min-h-[300px]">
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="app__slide-wrapper">
        <Breadcrumb breadTitle="Employee Profile" subTitle="Home" />
        <div className="flex justify-center items-center min-h-[300px]">
          <p className="text-red-500 dark:text-red-400">
            {error || "Employee not found"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="app__slide-wrapper">
        <Breadcrumb breadTitle="Employee Profile" subTitle="Home" />
        <div className="grid grid-cols-12 gap-x-6 maxXs:gap-x-0">
          <PersonalInformation data={employee} />
          <EmergencyContact data={employee} />
          <EducationQualification />
          <ExperienceDetails />
          <BankAccount />
          <Passport />
          <SocialProfile />
        </div>
      </div>
    </>
  );
};

export default EmployeeProfileMainArea;
