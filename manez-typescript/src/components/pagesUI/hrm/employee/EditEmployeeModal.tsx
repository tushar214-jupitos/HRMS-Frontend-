"use client";
import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent } from "@mui/material";
import { useForm } from "react-hook-form";
import InputField from "@/components/elements/SharedInputs/InputField";
import FormLabel from "@/components/elements/SharedInputs/FormLabel";
import DatePicker from "react-datepicker";
import SelectBox from "@/components/elements/SharedInputs/SelectBox";
import { toast } from "sonner";
import { IEmployee } from "@/interface";
import {
  linkUserToEmployee,
  getUserEmails,
} from "../../../../lib/employeeService";

type EmployeeFormData = {
  emp_id: string;
  first_name: string;
  last_name: string;
  mobile: string;
  official_email: string;
  date_of_birth?: string;
  blood_group?: string;
  designation?: string;
  father_or_husband_name?: string;
  father_age?: number | string;
  address?: string;
  permanent_address?: string;
  date_of_joining?: string;
  overall_experience?: string;
  previous_experience?: string;
  employment_status?: string;
  job_title?: string;
  reporting_manager_email?: string;
  bank_name?: string;
  account_number?: string;
  aadhaar_number?: string;
  pan_number?: string;
  has_uan?: boolean;
  uan_number?: string;
};

interface DropdownOption {
  id?: number;
  value: string;
  label: string;
  name?: string;
  email?: string;
  emp_id?: string;
}

interface EditEmployeeModalProps {
  open: boolean;
  employee: IEmployee;
  onClose: () => void;
  onSuccess: () => void;
}

const EditEmployeeModal = ({
  open,
  employee,
  onClose,
  onSuccess,
}: EditEmployeeModalProps) => {
  const [selectStartDate, setSelectStartDate] = useState<Date | null>(null);
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employeePhoto, setEmployeePhoto] = useState<File | null>(null);
  const [documents, setDocuments] = useState<File[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | number | "">(
    ""
  );

  // Dropdown states
  const [employmentStatuses, setEmploymentStatuses] = useState<
    DropdownOption[]
  >([]);
  const [officialEmails, setOfficialEmails] = useState<DropdownOption[]>([]);
  const [jobTitles, setJobTitles] = useState<DropdownOption[]>([]);
  const [bloodGroups, setBloodGroups] = useState<DropdownOption[]>([]);
  const [grades, setGrades] = useState<DropdownOption[]>([]);
  const [designations, setDesignations] = useState<DropdownOption[]>([]);
  const [reportingManagers, setReportingManagers] = useState<DropdownOption[]>(
    []
  );
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<EmployeeFormData>();

  const [employeeDetail, setEmployeeDetail] = useState<any>(null);

  const normalizeUserId = (val: any) => {
    const num = Number(val);
    return Number.isFinite(num) ? num : "";
  };

  // Helper function to parse dropdown data
  const parseDropdownData = (
    data: any,
    fieldName: string = ""
  ): DropdownOption[] => {
    console.log(`Parsing ${fieldName}:`, typeof data, data);

    // Handle case where data is wrapped in an object with results or data property
    let items = data;

    if (!Array.isArray(data)) {
      // Check for various wrapper patterns
      if (data?.results && Array.isArray(data.results)) {
        items = data.results;
      } else if (data?.data && Array.isArray(data.data)) {
        items = data.data;
      } else if (typeof data === "object" && data !== null) {
        // If data is an object, try to extract values from it
        const possibleArrays = Object.values(data).find((val) =>
          Array.isArray(val)
        );
        if (possibleArrays) {
          items = possibleArrays;
        } else {
          console.warn(`${fieldName}: Could not find array in response`, data);
          return [];
        }
      } else {
        console.warn(`${fieldName}: Invalid data type`, typeof data);
        return [];
      }
    }

    if (!Array.isArray(items) || items.length === 0) {
      console.warn(`${fieldName}: No items to parse`, items);
      return [];
    }

    const parsed = items
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
      .filter((item) => item.value !== "");

    console.log(`${fieldName} parsed result:`, parsed);
    return parsed;
  };

  const uanCheckboxValue = watch("has_uan");

  // Parse date string to Date object
  const parseDate = (dateString?: string): Date | null => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  };

  const populateForm = (source: any) => {
    if (!source) return;

    reset({
      emp_id: source.emp_id || source.employeeID || "",
      first_name: source.first_name || source.firstName || "",
      last_name: source.last_name || source.lastName || "",
      mobile: source.mobile || source.phone || "",
      official_email: source.official_email || source.email || "",
      address: source.address || "",
      permanent_address: source.permanent_address || "",
      father_or_husband_name: source.father_or_husband_name || "",
      father_age: source.father_age || "",
      designation: source.designation || source.position || "",
      blood_group: source.blood_group || "",
      overall_experience: source.overall_experience || "",
      previous_experience: source.previous_experience || "",
      employment_status:
        source.employed_status ||
        source.employment_status ||
        source.status ||
        "",
      job_title:
        source.job_title ||
        source.previous_designation ||
        source.designation ||
        "",
      reporting_manager_email: source.reporting_manager_email || "",
      bank_name: source.bank_name || "",
      account_number: source.account_number || "",
      aadhaar_number: source.aadhaar_number || "",
      pan_number: source.pan_number || "",
      has_uan: source.has_uan || false,
      uan_number: source.uan_number || "",
    });

    setSelectStartDate(parseDate(source.date_of_joining || source.joiningDate));
    setBirthDate(parseDate(source.date_of_birth));
    setSelectedUserId(
      source.user ||
        source.user_id ||
        source.userId ||
        source.linked_user_id ||
        ""
    );
  };

  // Fetch all dropdown data
  useEffect(() => {
    if (!open) return;

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
        const [
          empStatusRes,
          jobTitleRes,
          bloodRes,
          gradeRes,
          designationRes,
          userEmails,
        ] = await Promise.all([
          fetch(`${apiUrl}/dropdowns/employee/status/`, { headers }),
          fetch(`${apiUrl}/dropdowns/employee/job-titles/`, { headers }),
          fetch(`${apiUrl}/dropdowns/employee/blood-groups/`, { headers }),
          fetch(`${apiUrl}/dropdowns/grades/`, { headers }),
          fetch(`${apiUrl}/dropdowns/designations/`, { headers }),
          getUserEmails(),
        ]);

        // Process employment statuses
        if (empStatusRes.ok) {
          const data = await empStatusRes.json();
          setEmploymentStatuses(parseDropdownData(data, "Employment Statuses"));
        } else {
          console.error(
            "Failed to fetch employment statuses:",
            empStatusRes.status
          );
        }

        // Process official emails from user email dropdown
        const userEmailList = Array.isArray(userEmails)
          ? userEmails
          : userEmails?.results || userEmails?.data || [];
        const userEmailOptions = userEmailList
          .map((item: any) => {
            const email =
              typeof item === "string"
                ? item
                : item?.email || item?.user_email || item?.username || "";
            const id =
              typeof item === "string"
                ? email
                : item?.id || item?.user_id || item?.user || email;
            if (!email) return null;
            return { value: email, label: email, id } as DropdownOption;
          })
          .filter(Boolean) as DropdownOption[];
        setOfficialEmails(userEmailOptions);
        setReportingManagers(userEmailOptions);

        // Process job titles
        if (jobTitleRes.ok) {
          const data = await jobTitleRes.json();
          setJobTitles(parseDropdownData(data, "Job Titles"));
        } else {
          console.error("Failed to fetch job titles:", jobTitleRes.status);
        }

        // Process blood groups
        if (bloodRes.ok) {
          const data = await bloodRes.json();
          setBloodGroups(parseDropdownData(data, "Blood Groups"));
        } else {
          console.error("Failed to fetch blood groups:", bloodRes.status);
        }

        // Process grades
        if (gradeRes.ok) {
          const data = await gradeRes.json();
          setGrades(parseDropdownData(data, "Grades"));
        } else {
          console.error("Failed to fetch grades:", gradeRes.status);
        }

        // Process designations
        if (designationRes.ok) {
          const data = await designationRes.json();
          setDesignations(parseDropdownData(data, "Designations"));
        } else {
          console.error("Failed to fetch designations:", designationRes.status);
        }

        // End of dropdown fetching
      } catch (error) {
        console.error("Error loading dropdowns:", error);
        toast.error("Failed to load dropdown options");
      } finally {
        setLoadingDropdowns(false);
      }
    };

    fetchDropdowns();
  }, [open]);

  // Initialize form with employee data
  useEffect(() => {
    if (employee && open) {
      populateForm(employee as any);
    }
  }, [employee, open, reset]);

  // Fetch detailed employee data on open
  useEffect(() => {
    if (!open || !(employee as any)?.id) return;

    const fetchEmployeeDetail = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        const resp = await fetch(
          `${apiUrl}/employee/${(employee as any).id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
              "ngrok-skip-browser-warning": "true",
            },
          }
        );

        if (!resp.ok) {
          console.error("Failed to fetch employee detail", resp.status);
          return;
        }

        const data = await resp.json();
        setEmployeeDetail(data);
        populateForm(data);
      } catch (err) {
        console.error("Error fetching employee detail", err);
      }
    };

    fetchEmployeeDetail();
  }, [employee, open]);

  const formatDate = (date: Date | null) =>
    date ? date.toISOString().split("T")[0] : "";

  // Handle file uploads
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setEmployeePhoto(e.target.files[0]);
    }
  };

  const handleDocumentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileList = Array.from(e.target.files);
      // Validate file sizes (max 10MB per file)
      const validFiles = fileList.filter((file) => {
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} is larger than 10MB`);
          return false;
        }
        return true;
      });
      // Add to existing documents (avoid duplicates)
      const newDocuments = [...documents, ...validFiles];
      const uniqueDocuments = newDocuments.filter(
        (file, index, self) =>
          index ===
          self.findIndex((f) => f.name === file.name && f.size === file.size)
      );
      setDocuments(uniqueDocuments);
    }
  };

  const handleRemoveDocument = (index: number) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const onSubmit = async (data: EmployeeFormData) => {
    if (isSubmitting) return;

    const userIdForLink = selectedUserId || data.official_email;
    if (!userIdForLink) {
      toast.error("Please choose an official email to link the user.");
      return;
    }

    const payload = {
      emp_id: data.emp_id,
      first_name: data.first_name,
      last_name: data.last_name,
      mobile: data.mobile,
      official_email: data.official_email,
      date_of_birth: formatDate(birthDate),
      blood_group: data.blood_group ?? "",
      designation: data.designation ?? "",
      father_or_husband_name: data.father_or_husband_name ?? "",
      father_age: data.father_age ? Number(data.father_age) : undefined,
      address: data.address ?? "",
      permanent_address: data.permanent_address ?? "",
      date_of_joining: formatDate(selectStartDate),
      overall_experience: data.overall_experience ?? "",
      previous_experience: data.previous_experience ?? "",
      employment_status: data.employment_status ?? "Active",
      job_title: data.job_title ?? "",
      reporting_manager_email: data.reporting_manager_email ?? "",
      bank_name: data.bank_name ?? "",
      account_number: data.account_number ?? "",
      aadhaar_number: data.aadhaar_number ?? "",
      pan_number: data.pan_number ?? "",
      has_uan: Boolean(data.has_uan),
      uan_number: data.uan_number ?? "",
    };

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast.error("Unauthorized! Please login again.");
        return;
      }

      setIsSubmitting(true);

      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/employee/${employee.id}/`;

      const response = await fetch(apiUrl, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(
          message || "Failed to update employee. Please try again."
        );
      }

      // Link user to employee after update if userId changed
      if (userIdForLink && employee.id) {
        try {
          await linkUserToEmployee(employee.id, userIdForLink);
        } catch (linkError) {
          console.error("Failed to update user link:", linkError);
          // Don't throw error, just log it
        }
      }

      toast.success("Employee updated successfully!");
      setTimeout(() => onSuccess(), 200);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update employee. Please try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const officialEmailValue = watch("official_email");

  useEffect(() => {
    if (!officialEmailValue) {
      setSelectedUserId("");
      return;
    }

    // Always resolve user id from API when an email is selected
    setSelectedUserId("");
    let active = true;
    const fetchId = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setSelectedUserId("");
          return;
        }
        const base = process.env.NEXT_PUBLIC_API_BASE_URL;
        const urls = [
          `${base}/api/dropdowns/user/id-by-email/?email=${encodeURIComponent(
            officialEmailValue
          )}`,
          `${base}/dropdowns/user/id-by-email/?email=${encodeURIComponent(
            officialEmailValue
          )}`,
        ];

        for (const url of urls) {
          const resp = await fetch(url, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
              "ngrok-skip-browser-warning": "true",
            },
          });

          if (!resp.ok) {
            continue;
          }

          const data = await resp.json();
          if (!active) return;
          const resolvedId = normalizeUserId(data?.id);
          setSelectedUserId(resolvedId || "");
          return;
        }

        if (active) {
          setSelectedUserId("");
        }
      } catch (err) {
        console.error("Error resolving user ID:", err);
        if (active) setSelectedUserId("");
      }
    };

    fetchId();

    return () => {
      active = false;
    };
  }, [officialEmailValue]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        <div className="flex justify-between">
          <h5 className="modal-title">Edit Employee</h5>
          <button
            onClick={onClose}
            type="button"
            className="bd-btn-close"
            disabled={isSubmitting}
          >
            <i className="fa-solid fa-xmark-large"></i>
          </button>
        </div>
      </DialogTitle>
      <DialogContent className="common-scrollbar max-h-screen overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="card__wrapper mt-[5px]">
            <div className="grid grid-cols-12 gap-y-6 gap-x-6 maxXs:gap-x-0 justify-center align-center">
              <div className="col-span-12 md:col-span-6 ">
                <InputField
                  label="First Name"
                  id="first_name"
                  type="text"
                  register={register("first_name", {
                    required: "First Name is required",
                  })}
                  error={errors.first_name}
                />
              </div>
              <div className="col-span-12 md:col-span-6">
                <InputField
                  label="Last Name"
                  id="last_name"
                  type="text"
                  register={register("last_name", {
                    required: "Last Name is required",
                  })}
                  error={errors.last_name}
                />
              </div>
              <div className="col-span-12 md:col-span-6">
                <InputField
                  label="Employee ID"
                  id="emp_id"
                  type="text"
                  register={register("emp_id", {
                    required: "Employee ID is required",
                  })}
                  error={errors.emp_id}
                  disabled
                />
              </div>
              <div className="col-span-12 md:col-span-6">
                <InputField
                  label="Contact Number"
                  id="mobile"
                  type="text"
                  register={register("mobile", {
                    required: "Contact Number is required",
                  })}
                  error={errors.mobile}
                />
              </div>

              {/* Official Email - User Emails Dropdown */}
              <div className="col-span-12 md:col-span-6">
                <SelectBox
                  id="official_email"
                  label="Official Email"
                  options={officialEmails}
                  control={control}
                  isRequired={true}
                />
                {officialEmailValue && selectedUserId && (
                  <p className="text-xs text-green-600 mt-1">
                    {officialEmailValue} - User ID: {selectedUserId}
                  </p>
                )}
              </div>

              {/* Auto-filled User ID */}
              <div className="col-span-12 md:col-span-6">
                <div className="from__input-box">
                  <div className="form__input-title">
                    <label htmlFor="linked_user_id" className="input__label">
                      User ID
                    </label>
                  </div>
                  <div className="form__input">
                    <input
                      id="linked_user_id"
                      type="text"
                      className="form-control"
                      value={selectedUserId || ""}
                      readOnly
                      disabled
                      placeholder="Auto-filled from selected email"
                    />
                  </div>
                  {!selectedUserId && officialEmailValue && (
                    <p className="text-xs text-gray-500 mt-1">
                      Resolving user ID for {officialEmailValue}...
                    </p>
                  )}
                </div>
              </div>

              {/* Father / Husband Name */}
              <div className="col-span-12 md:col-span-6">
                <InputField
                  label="Father / Husband Name"
                  id="father_or_husband_name"
                  type="text"
                  register={register("father_or_husband_name")}
                  error={errors.father_or_husband_name}
                />
              </div>

              {/* Current Address */}
              <div className="col-span-12">
                <InputField
                  label="Current Address"
                  id="address"
                  isTextArea={true}
                  required={true}
                  register={register("address", {
                    required: "Address is required",
                  })}
                  error={errors.address}
                />
              </div>

              {/* Permanent Address */}
              <div className="col-span-12">
                <InputField
                  label="Permanent Address"
                  id="permanent_address"
                  isTextArea={true}
                  register={register("permanent_address")}
                  error={errors.permanent_address}
                />
              </div>

              {/* Date of Birth */}
              <div className="col-span-12 md:col-span-6">
                <FormLabel label="Date of Birth" id="date_of_birth" />
                <div className="datepicker-style">
                  <DatePicker
                    id="date_of_birth"
                    selected={birthDate}
                    onChange={(date) => setBirthDate(date)}
                    showYearDropdown
                    showMonthDropdown
                    useShortMonthInDropdown
                    showPopperArrow={false}
                    peekNextMonth
                    dropdownMode="select"
                    isClearable
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Date of birth"
                    className="w-full"
                  />
                </div>
              </div>

              {/* Blood Group - API Dropdown */}
              <div className="col-span-12 md:col-span-6">
                <SelectBox
                  id="blood_group"
                  label="Blood Group"
                  options={bloodGroups}
                  control={control}
                />
              </div>

              {/* Designation - API Dropdown */}
              <div className="col-span-12 md:col-span-6">
                <SelectBox
                  id="designation"
                  label="Designation"
                  options={designations}
                  control={control}
                  isRequired={false}
                />
              </div>

              {/* Father / Husband Age */}
              <div className="col-span-12 md:col-span-6">
                <InputField
                  label="Father / Husband Age"
                  id="father_age"
                  type="number"
                  register={register("father_age")}
                  error={errors.father_age}
                />
              </div>

              {/* Joining Date */}
              <div className="col-span-12 md:col-span-6">
                <FormLabel label="Joining Date" id="selectJoiningDate" />
                <div className="datepicker-style">
                  <DatePicker
                    id="selectJoiningDate"
                    selected={selectStartDate}
                    onChange={(date) => setSelectStartDate(date)}
                    showYearDropdown
                    showMonthDropdown
                    useShortMonthInDropdown
                    showPopperArrow={false}
                    peekNextMonth
                    dropdownMode="select"
                    isClearable
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Joining date"
                    className="w-full"
                  />
                </div>
              </div>

              {/* Overall Experience */}
              <div className="col-span-12 md:col-span-6">
                <InputField
                  label="Overall Experience (years)"
                  id="overall_experience"
                  type="text"
                  register={register("overall_experience")}
                  error={errors.overall_experience}
                />
              </div>

              {/* Previous Experience */}
              <div className="col-span-12 md:col-span-6">
                <InputField
                  label="Previous Experience (years)"
                  id="previous_experience"
                  type="text"
                  register={register("previous_experience")}
                  error={errors.previous_experience}
                />
              </div>

              {/* Employment Status - API Dropdown */}
              <div className="col-span-12 md:col-span-6">
                <SelectBox
                  id="employment_status"
                  label="Status"
                  options={employmentStatuses}
                  control={control}
                  isRequired={true}
                />
              </div>

              {/* Job Title - API Dropdown */}
              <div className="col-span-12 md:col-span-6">
                <SelectBox
                  id="job_title"
                  label="Job Title"
                  options={jobTitles}
                  control={control}
                />
              </div>

              {/* Reporting Manager - API Dropdown */}
              <div className="col-span-12 md:col-span-6">
                <SelectBox
                  id="reporting_manager_email"
                  label="Reporting Manager"
                  options={reportingManagers}
                  control={control}
                />
              </div>

              {/* Bank Name */}
              <div className="col-span-12 md:col-span-6">
                <InputField
                  label="Bank Name"
                  id="bank_name"
                  type="text"
                  register={register("bank_name")}
                  error={errors.bank_name}
                />
              </div>

              {/* Account Number */}
              <div className="col-span-12 md:col-span-6">
                <InputField
                  label="Account Number"
                  id="account_number"
                  type="text"
                  register={register("account_number")}
                  error={errors.account_number}
                />
              </div>

              {/* Aadhaar Number */}
              <div className="col-span-12 md:col-span-6">
                <InputField
                  label="Aadhaar Number"
                  id="aadhaar_number"
                  type="text"
                  register={register("aadhaar_number")}
                  error={errors.aadhaar_number}
                />
              </div>

              {/* PAN Number */}
              <div className="col-span-12 md:col-span-6">
                <InputField
                  label="PAN Number"
                  id="pan_number"
                  type="text"
                  register={register("pan_number")}
                  error={errors.pan_number}
                />
              </div>

              {/* Has UAN Checkbox */}
              <div className="col-span-12 md:col-span-6">
                <div className="from__input-box">
                  <div className="form__input-title">
                    <label htmlFor="has_uan" className="input__label">
                      Has UAN
                    </label>
                  </div>
                  <div className="form__input flex items-center gap-2 pt-2">
                    <input
                      id="has_uan"
                      type="checkbox"
                      className="h-4 w-4"
                      {...register("has_uan")}
                    />
                    <label
                      htmlFor="has_uan"
                      className="mb-0 cursor-pointer text-black dark:text-white"
                    >
                      Yes
                    </label>
                  </div>
                </div>
              </div>

              {/* UAN Number - Conditional */}
              {uanCheckboxValue && (
                <div className="col-span-12 md:col-span-6">
                  <InputField
                    label="UAN Number"
                    id="uan_number"
                    type="text"
                    register={register("uan_number")}
                    error={errors.uan_number}
                  />
                </div>
              )}

              {/* Employee Photo */}
              <div className="col-span-12">
                <div className="from__input-box">
                  <div className="form__input-title">
                    <label htmlFor="sellerphoto">
                      Employee Photo (100px*100px)
                    </label>
                  </div>
                  <div className="form__input">
                    <input
                      className="form-control"
                      id="sellerphoto"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                    />
                    {employeePhoto && (
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Selected: {employeePhoto.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Upload Documents */}
              <div className="col-span-12">
                <div className="from__input-box">
                  <div className="form__input-title">
                    <label htmlFor="documents">
                      Upload Documents (Aadhaar, PAN, etc.)
                    </label>
                    <span className="text-gray-500 text-sm ml-2">
                      (Max 10MB per file)
                    </span>
                  </div>
                  <div className="form__input">
                    <input
                      className="form-control"
                      id="documents"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      multiple
                      onChange={handleDocumentsChange}
                    />
                    {documents.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {documents.map((doc, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-800 rounded"
                          >
                            <span className="text-sm truncate flex-1">
                              {doc.name} ({formatFileSize(doc.size)})
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveDocument(index)}
                              className="ml-2 text-red-500 hover:text-red-700"
                            >
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="submit__btn text-center flex justify-center gap-3 mt-6">
            <button
              className="btn btn-secondary"
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditEmployeeModal;
