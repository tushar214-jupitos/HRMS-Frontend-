"use client";
import React, { useState, useEffect, useRef } from "react";
import InputField from "@/components/elements/SharedInputs/InputField";
import SelectBox from "@/components/elements/SharedInputs/SelectBox";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface DropdownOption {
  value: string;
  label: string;
}

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

  // Dropdown states
  const [roles, setRoles] = useState<DropdownOption[]>([]);
  const [departments, setDepartments] = useState<DropdownOption[]>([]);
  const [designations, setDesignations] = useState<DropdownOption[]>([]);
  const [reportingManagers, setReportingManagers] = useState<DropdownOption[]>(
    []
  );
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);

  // Multiple selection states for checkboxes
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedDesignations, setSelectedDesignations] = useState<string[]>(
    []
  );
  const [selectedManagers, setSelectedManagers] = useState<string[]>([]);

  // Dropdown open/close states
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const [isDepartmentOpen, setIsDepartmentOpen] = useState(false);
  const [isDesignationOpen, setIsDesignationOpen] = useState(false);
  const [isManagerOpen, setIsManagerOpen] = useState(false);

  // Search terms for dropdown filtering
  const [roleSearch, setRoleSearch] = useState("");
  const [departmentSearch, setDepartmentSearch] = useState("");
  const [designationSearch, setDesignationSearch] = useState("");
  const [managerSearch, setManagerSearch] = useState("");

  // Refs for click outside detection
  const roleRef = useRef<HTMLDivElement>(null);
  const departmentRef = useRef<HTMLDivElement>(null);
  const designationRef = useRef<HTMLDivElement>(null);
  const managerRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (roleRef.current && !roleRef.current.contains(event.target as Node)) {
        setIsRoleOpen(false);
      }
      if (
        departmentRef.current &&
        !departmentRef.current.contains(event.target as Node)
      ) {
        setIsDepartmentOpen(false);
      }
      if (
        designationRef.current &&
        !designationRef.current.contains(event.target as Node)
      ) {
        setIsDesignationOpen(false);
      }
      if (
        managerRef.current &&
        !managerRef.current.contains(event.target as Node)
      ) {
        setIsManagerOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Helper function to parse dropdown data
  const parseDropdownData = (data: any): DropdownOption[] => {
    let items = data;
    if (!Array.isArray(data)) {
      if (data?.results && Array.isArray(data.results)) {
        items = data.results;
      } else if (data?.data && Array.isArray(data.data)) {
        items = data.data;
      } else {
        return [];
      }
    }

    return items
      .map((item: any) => {
        if (typeof item === "string") {
          return { value: item, label: item };
        } else if (typeof item === "object" && item !== null) {
          const value = item.value || item.name || item.id || "";
          const label =
            item.label || item.name || item.display_name || String(value);
          return { value, label };
        }
        return { value: "", label: "" };
      })
      .filter((item: DropdownOption) => item.value !== "");
  };

  // Fetch dropdowns from API
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          toast.error("Unauthorized! Please login again.");
          return;
        }

        setLoadingDropdowns(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        };

        // Fetch all dropdowns in parallel
        const [rolesRes, deptRes, designRes, managerRes] = await Promise.all([
          fetch(`${apiUrl}/dropdowns/employee/roles/`, { headers }),
          fetch(`${apiUrl}/dropdowns/departments/`, { headers }),
          fetch(`${apiUrl}/dropdowns/designations/`, { headers }),
          fetch(`${apiUrl}/dropdowns/employee/reporting-managers/`, {
            headers,
          }),
        ]);

        // Process roles
        if (rolesRes.ok) {
          const data = await rolesRes.json();
          setRoles(parseDropdownData(data));
        }

        // Process departments
        if (deptRes.ok) {
          const data = await deptRes.json();
          setDepartments(parseDropdownData(data));
        }

        // Process designations
        if (designRes.ok) {
          const data = await designRes.json();
          setDesignations(parseDropdownData(data));
        }

        // Process reporting managers
        if (managerRes.ok) {
          const data = await managerRes.json();
          const managers = (
            Array.isArray(data) ? data : data?.results || data?.data || []
          ).map((item: any) => ({
            value: item.email || item.id || "",
            label: item.email || `${item.name || ""} (${item.emp_id || ""})`,
          }));
          setReportingManagers(managers);
        }
      } catch (error) {
        console.error("Error loading filter dropdowns:", error);
      } finally {
        setLoadingDropdowns(false);
      }
    };

    fetchDropdowns();
  }, []);

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

  // Handle checkbox toggle
  const handleCheckboxToggle = (
    value: string,
    selectedArray: string[],
    setSelectedArray: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (selectedArray.includes(value)) {
      setSelectedArray(selectedArray.filter((item) => item !== value));
    } else {
      setSelectedArray([...selectedArray, value]);
    }
  };

  const onSubmit = (data: FilterParams) => {
    // Build filter object with checkbox selections
    const checkboxFilters: any = {};

    if (selectedRoles.length > 0) {
      checkboxFilters.role = selectedRoles.join(",");
    }
    if (selectedDepartments.length > 0) {
      checkboxFilters.department = selectedDepartments.join(",");
    }
    if (selectedDesignations.length > 0) {
      checkboxFilters.designation = selectedDesignations.join(",");
    }
    if (selectedManagers.length > 0) {
      checkboxFilters.reporting_manager_email = selectedManagers.join(",");
    }

    // Remove empty fields from new data
    const newFilters = Object.fromEntries(
      Object.entries(data).filter(
        ([, value]) => value !== "" && value !== undefined
      )
    );

    // Merge all filters
    const mergedFilters = {
      ...activeFilters,
      ...newFilters,
      ...checkboxFilters,
    };

    onFilterChange(mergedFilters);
  };

  const handleReset = () => {
    reset();
    setSelectedRoles([]);
    setSelectedDepartments([]);
    setSelectedDesignations([]);
    setSelectedManagers([]);
    setRoleSearch("");
    setDepartmentSearch("");
    setDesignationSearch("");
    setManagerSearch("");
    onFilterChange({});
  };

  const toggleFilter = () => {
    setIsExpanded(!isExpanded);
  };

  // Filtered option lists based on search inputs
  const filteredRoles = roles.filter((option) =>
    option.label.toLowerCase().includes(roleSearch.toLowerCase())
  );
  const filteredDepartments = departments.filter((option) =>
    option.label.toLowerCase().includes(departmentSearch.toLowerCase())
  );
  const filteredDesignations = designations.filter((option) =>
    option.label.toLowerCase().includes(designationSearch.toLowerCase())
  );
  const filteredManagers = reportingManagers.filter((option) =>
    option.label.toLowerCase().includes(managerSearch.toLowerCase())
  );

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

            {/* Role - Multiple checkboxes dropdown */}
            <div
              className="col-span-12 md:col-span-6 lg:col-span-3 relative"
              ref={roleRef}
            >
              <label className="form-label mb-2 block">Role</label>
              <div
                className="border border-gray-300 dark:border-gray-600 rounded-md p-2 cursor-pointer bg-white dark:bg-gray-800"
                onClick={() => setIsRoleOpen(!isRoleOpen)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {selectedRoles.length > 0
                      ? `${selectedRoles.length} selected`
                      : "Select roles"}
                  </span>
                  <i
                    className={`fa-solid fa-chevron-${
                      isRoleOpen ? "up" : "down"
                    } text-sm`}
                  ></i>
                </div>
              </div>
              {isRoleOpen && (
                <div className="absolute z-10 mt-1 w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 shadow-lg">
                  <div
                    className="p-2 border-b border-gray-200 dark:border-gray-700"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="text"
                      value={roleSearch}
                      onChange={(e) => setRoleSearch(e.target.value)}
                      placeholder="Search roles"
                      className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-sm focus:outline-none"
                    />
                  </div>
                  <div className="max-h-56 overflow-y-auto">
                    {filteredRoles.map((role) => (
                      <label
                        key={role.value}
                        className="flex items-center gap-2 py-2 px-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={selectedRoles.includes(role.value)}
                          onChange={() =>
                            handleCheckboxToggle(
                              role.value,
                              selectedRoles,
                              setSelectedRoles
                            )
                          }
                          className="form-checkbox"
                        />
                        <span className="text-sm">{role.label}</span>
                      </label>
                    ))}
                    {filteredRoles.length === 0 && (
                      <div className="py-3 px-3 text-sm text-gray-500 dark:text-gray-400">
                        No roles found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Department - Multiple checkboxes dropdown */}
            <div
              className="col-span-12 md:col-span-6 lg:col-span-3 relative"
              ref={departmentRef}
            >
              <label className="form-label mb-2 block">Department</label>
              <div
                className="border border-gray-300 dark:border-gray-600 rounded-md p-2 cursor-pointer bg-white dark:bg-gray-800"
                onClick={() => setIsDepartmentOpen(!isDepartmentOpen)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {selectedDepartments.length > 0
                      ? `${selectedDepartments.length} selected`
                      : "Select departments"}
                  </span>
                  <i
                    className={`fa-solid fa-chevron-${
                      isDepartmentOpen ? "up" : "down"
                    } text-sm`}
                  ></i>
                </div>
              </div>
              {isDepartmentOpen && (
                <div className="absolute z-10 mt-1 w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 shadow-lg">
                  <div
                    className="p-2 border-b border-gray-200 dark:border-gray-700"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="text"
                      value={departmentSearch}
                      onChange={(e) => setDepartmentSearch(e.target.value)}
                      placeholder="Search departments"
                      className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-sm focus:outline-none"
                    />
                  </div>
                  <div className="max-h-56 overflow-y-auto">
                    {filteredDepartments.map((dept) => (
                      <label
                        key={dept.value}
                        className="flex items-center gap-2 py-2 px-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={selectedDepartments.includes(dept.value)}
                          onChange={() =>
                            handleCheckboxToggle(
                              dept.value,
                              selectedDepartments,
                              setSelectedDepartments
                            )
                          }
                          className="form-checkbox"
                        />
                        <span className="text-sm">{dept.label}</span>
                      </label>
                    ))}
                    {filteredDepartments.length === 0 && (
                      <div className="py-3 px-3 text-sm text-gray-500 dark:text-gray-400">
                        No departments found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Designation - Multiple checkboxes dropdown */}
            <div
              className="col-span-12 md:col-span-6 lg:col-span-3 relative"
              ref={designationRef}
            >
              <label className="form-label mb-2 block">Designation</label>
              <div
                className="border border-gray-300 dark:border-gray-600 rounded-md p-2 cursor-pointer bg-white dark:bg-gray-800"
                onClick={() => setIsDesignationOpen(!isDesignationOpen)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {selectedDesignations.length > 0
                      ? `${selectedDesignations.length} selected`
                      : "Select designations"}
                  </span>
                  <i
                    className={`fa-solid fa-chevron-${
                      isDesignationOpen ? "up" : "down"
                    } text-sm`}
                  ></i>
                </div>
              </div>
              {isDesignationOpen && (
                <div className="absolute z-10 mt-1 w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 shadow-lg">
                  <div
                    className="p-2 border-b border-gray-200 dark:border-gray-700"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="text"
                      value={designationSearch}
                      onChange={(e) => setDesignationSearch(e.target.value)}
                      placeholder="Search designations"
                      className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-sm focus:outline-none"
                    />
                  </div>
                  <div className="max-h-56 overflow-y-auto">
                    {filteredDesignations.map((desig) => (
                      <label
                        key={desig.value}
                        className="flex items-center gap-2 py-2 px-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={selectedDesignations.includes(desig.value)}
                          onChange={() =>
                            handleCheckboxToggle(
                              desig.value,
                              selectedDesignations,
                              setSelectedDesignations
                            )
                          }
                          className="form-checkbox"
                        />
                        <span className="text-sm">{desig.label}</span>
                      </label>
                    ))}
                    {filteredDesignations.length === 0 && (
                      <div className="py-3 px-3 text-sm text-gray-500 dark:text-gray-400">
                        No designations found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Reporting Manager - Multiple checkboxes dropdown */}
            <div
              className="col-span-12 md:col-span-6 lg:col-span-3 relative"
              ref={managerRef}
            >
              <label className="form-label mb-2 block">Reporting Manager</label>
              <div
                className="border border-gray-300 dark:border-gray-600 rounded-md p-2 cursor-pointer bg-white dark:bg-gray-800"
                onClick={() => setIsManagerOpen(!isManagerOpen)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {selectedManagers.length > 0
                      ? `${selectedManagers.length} selected`
                      : "Select managers"}
                  </span>
                  <i
                    className={`fa-solid fa-chevron-${
                      isManagerOpen ? "up" : "down"
                    } text-sm`}
                  ></i>
                </div>
              </div>
              {isManagerOpen && (
                <div className="absolute z-10 mt-1 w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 shadow-lg">
                  <div
                    className="p-2 border-b border-gray-200 dark:border-gray-700"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="text"
                      value={managerSearch}
                      onChange={(e) => setManagerSearch(e.target.value)}
                      placeholder="Search managers"
                      className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-sm focus:outline-none"
                    />
                  </div>
                  <div className="max-h-56 overflow-y-auto">
                    {filteredManagers.map((manager) => (
                      <label
                        key={manager.value}
                        className="flex items-center gap-2 py-2 px-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={selectedManagers.includes(manager.value)}
                          onChange={() =>
                            handleCheckboxToggle(
                              manager.value,
                              selectedManagers,
                              setSelectedManagers
                            )
                          }
                          className="form-checkbox"
                        />
                        <span className="text-sm">{manager.label}</span>
                      </label>
                    ))}
                    {filteredManagers.length === 0 && (
                      <div className="py-3 px-3 text-sm text-gray-500 dark:text-gray-400">
                        No managers found
                      </div>
                    )}
                  </div>
                </div>
              )}
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
