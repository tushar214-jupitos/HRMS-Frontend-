"use client";
import React, { useState } from "react";
import InputField from "@/components/elements/SharedInputs/InputField";
import SelectBox from "@/components/elements/SharedInputs/SelectBox";
import { useForm } from "react-hook-form";
import {
  employeeDesignationData,
  employeeStatusData,
} from "@/data/dropdown-data";

interface FilterParams {
  search?: string;
  emp_id?: string;
  role?: string;
  department?: string;
  designation?: string;
  reporting_manager_email?: string;
  has_uan?: string;
  has_aadhaar?: string;
  has_pan?: string;
  overall_experience__gte?: string;
  date_of_joining__gte?: string;
  date_of_birth__lte?: string;
  ordering?: string;
}

interface EmployeeListFilterProps {
  onFilterChange: (filters: FilterParams) => void;
  isOpen: boolean;
  onClose: () => void;
  activeFilters?: FilterParams;
}

const booleanOptions = [
  { value: "true", label: "Yes" },
  { value: "false", label: "No" },
];

const roleOptions = [
  { value: "employee", label: "Employee" },
  { value: "manager", label: "Manager" },
  { value: "admin", label: "Admin" },
  { value: "hr", label: "HR" },
];

const orderingOptions = [
  { value: "first_name", label: "First Name (A-Z)" },
  { value: "-first_name", label: "First Name (Z-A)" },
  { value: "date_of_joining", label: "Joining Date (Oldest)" },
  { value: "-date_of_joining", label: "Joining Date (Newest)" },
  { value: "overall_experience", label: "Experience (Low to High)" },
  { value: "-overall_experience", label: "Experience (High to Low)" },
];

const EmployeeListFilter = ({
  onFilterChange,
  isOpen,
  onClose,
  activeFilters = {},
}: EmployeeListFilterProps) => {
  const { register, handleSubmit, control, reset } = useForm<FilterParams>();
  const [isExpanded, setIsExpanded] = useState(isOpen);

  // Get filter label for display
  const getFilterLabel = (key: string, value: string): string => {
    const filterLabels: Record<string, string> = {
      search: `Search: ${value}`,
      emp_id: `Employee ID: ${value}`,
      role: `Role: ${value}`,
      department: `Department: ${value}`,
      designation: `Designation: ${value}`,
      reporting_manager_email: `Reporting Manager: ${value}`,
      has_uan: `Has UAN: ${value === "true" ? "Yes" : "No"}`,
      has_aadhaar: `Has Aadhaar: ${value === "true" ? "Yes" : "No"}`,
      has_pan: `Has PAN: ${value === "true" ? "Yes" : "No"}`,
      overall_experience__gte: `Min. Experience: ${value} years`,
      date_of_joining__gte: `Joining Date From: ${value}`,
      date_of_birth__lte: `Birth Date To: ${value}`,
      ordering: `Sort By: ${value}`,
    };
    return filterLabels[key] || `${key}: ${value}`;
  };

  const activeFilterCount = Object.keys(activeFilters).length;

  const onSubmit = (data: FilterParams) => {
    // Remove empty fields from new data
    const newFilters = Object.fromEntries(
      Object.entries(data).filter(
        ([, value]) => value !== "" && value !== undefined
      )
    );

    // Merge new filters with existing active filters
    const mergedFilters = {
      ...activeFilters,
      ...newFilters,
    };

    onFilterChange(mergedFilters);
  };

  const handleReset = () => {
    reset();
    onFilterChange({});
  };

  const toggleFilter = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="card__wrapper mb-[20px]">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={toggleFilter}
      >
        <div className="flex items-center gap-2">
          <i className="icon-filter-list text-lg"></i>
          <h6 className="mb-0 font-semibold">
            Advanced Filters
            {activeFilterCount > 0 && (
              <span className="ml-2 bg-primary text-white px-2 py-1 rounded-full text-xs font-bold">
                {activeFilterCount}
              </span>
            )}
          </h6>
        </div>
        <i className={`fa-solid fa-chevron-${isExpanded ? "up" : "down"}`}></i>
      </div>

      {/* Display Active Filters */}
      {activeFilterCount > 0 && (
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-3">
            Applied Filters ({activeFilterCount}):
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(activeFilters).map(([key, value]) => (
              <div
                key={key}
                className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-800 text-blue-900 dark:text-blue-100 px-3 py-1 rounded-full text-sm"
              >
                <span>{getFilterLabel(key, String(value))}</span>
                <button
                  type="button"
                  onClick={() => {
                    const newFilters = { ...activeFilters };
                    delete newFilters[key as keyof FilterParams];
                    onFilterChange(newFilters);
                  }}
                  className="ml-1 hover:text-red-600 dark:hover:text-red-400 font-bold"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {isExpanded && (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6">
          <div className="grid grid-cols-12 gap-x-6 gap-y-6">
            {/* Global Search */}
            <div className="col-span-12 md:col-span-6 lg:col-span-3">
              <InputField
                label="Search"
                id="search"
                type="text"
                register={register("search")}
              />
            </div>

            {/* Employee ID - Multiple values (comma-separated) */}
            <div className="col-span-12 md:col-span-6 lg:col-span-3">
              <InputField
                label="Employee ID"
                id="emp_id"
                type="text"
                register={register("emp_id")}
              />
            </div>

            {/* Role - Multiple values */}
            <div className="col-span-12 md:col-span-6 lg:col-span-3">
              <SelectBox
                id="role"
                label="Role"
                options={roleOptions}
                control={control}
              />
            </div>

            {/* Department - Multiple values */}
            <div className="col-span-12 md:col-span-6 lg:col-span-3">
              <InputField
                label="Department"
                id="department"
                type="text"
                register={register("department")}
              />
            </div>

            {/* Designation - Multiple values */}
            <div className="col-span-12 md:col-span-6 lg:col-span-3">
              <InputField
                label="Designation"
                id="designation"
                type="text"
                register={register("designation")}
              />
            </div>

            {/* Reporting Manager Email */}
            <div className="col-span-12 md:col-span-6 lg:col-span-3">
              <InputField
                label="Reporting Manager (Email)"
                id="reporting_manager_email"
                type="text"
                register={register("reporting_manager_email")}
              />
            </div>

            {/* Minimum Overall Experience */}
            <div className="col-span-12 md:col-span-6 lg:col-span-3">
              <InputField
                label="Min. Overall Experience (years)"
                id="overall_experience__gte"
                type="number"
                register={register("overall_experience__gte")}
              />
            </div>

            {/* Date of Joining (From) */}
            <div className="col-span-12 md:col-span-6 lg:col-span-3">
              <InputField
                label="Joining Date (From)"
                id="date_of_joining__gte"
                type="date"
                register={register("date_of_joining__gte")}
              />
            </div>

            {/* Date of Birth (To) */}
            <div className="col-span-12 md:col-span-6 lg:col-span-3">
              <InputField
                label="Date of Birth (To)"
                id="date_of_birth__lte"
                type="date"
                register={register("date_of_birth__lte")}
              />
            </div>

            {/* Has UAN */}
            <div className="col-span-12 md:col-span-6 lg:col-span-3">
              <SelectBox
                id="has_uan"
                label="Has UAN"
                options={booleanOptions}
                control={control}
              />
            </div>

            {/* Has Aadhaar */}
            <div className="col-span-12 md:col-span-6 lg:col-span-3">
              <SelectBox
                id="has_aadhaar"
                label="Has Aadhaar"
                options={booleanOptions}
                control={control}
              />
            </div>

            {/* Has PAN */}
            <div className="col-span-12 md:col-span-6 lg:col-span-3">
              <SelectBox
                id="has_pan"
                label="Has PAN"
                options={booleanOptions}
                control={control}
              />
            </div>

            {/* Ordering */}
            <div className="col-span-12 md:col-span-6 lg:col-span-3">
              <SelectBox
                id="ordering"
                label="Sort By"
                options={orderingOptions}
                control={control}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-6 justify-end">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={handleReset}
            >
              Reset
            </button>
            <button type="submit" className="btn btn-primary">
              Apply Filters
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default EmployeeListFilter;
