"use client";
import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent } from "@mui/material";
import { statePropsType } from "@/interface/common.interface";
import { useForm } from "react-hook-form";
import InputField from "@/components/elements/SharedInputs/InputField";
import FormLabel from "@/components/elements/SharedInputs/FormLabel";
import DatePicker from "react-datepicker";
import SelectBox from "@/components/elements/SharedInputs/SelectBox";
import { toast } from "sonner";

type EmployeeFormData = {
  emp_id: string;
  first_name: string;
  last_name: string;
  mobile: string;
  official_email: string;
  date_of_birth?: string;
  blood_group?: string;
  father_or_husband_name?: string;
  father_age?: number | string;
  address?: string;
  permanent_address?: string;
  date_of_joining?: string;
  overall_experience?: string;
  previous_experience?: string;
  employment_type?: string;
  employment_status?: string;
  job_title?: string;
  role?: string;
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
  designation?: string;
  emp_id?: string;
}

const AddNewEmployeeModal = ({ open, setOpen }: statePropsType) => {
  const [selectStartDate, setSelectStartDate] = useState<Date | null>(
    new Date()
  );
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employeePhoto, setEmployeePhoto] = useState<File | null>(null);
  const [documents, setDocuments] = useState<File[]>([]);

  // Dropdown states
  const [roles, setRoles] = useState<DropdownOption[]>([]);
  const [employmentTypes, setEmploymentTypes] = useState<DropdownOption[]>([]);
  const [employmentStatuses, setEmploymentStatuses] = useState<
    DropdownOption[]
  >([]);
  const [officialEmails, setOfficialEmails] = useState<DropdownOption[]>([]);
  const [jobTitles, setJobTitles] = useState<DropdownOption[]>([]);
  const [bloodGroups, setBloodGroups] = useState<DropdownOption[]>([]);
  const [grades, setGrades] = useState<DropdownOption[]>([]);
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
  } = useForm<EmployeeFormData>({
    defaultValues: {
      employment_status: "Active",
    },
  });
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
  const handleToggle = () => setOpen(!open);

  // Fetch all dropdown data
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        setLoadingDropdowns(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        const token = process.env.NEXT_PUBLIC_API_TOKEN;

        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        };

        // Fetch all dropdowns in parallel
        const [
          roleRes,
          empTypeRes,
          empStatusRes,
          emailRes,
          jobTitleRes,
          bloodRes,
          gradeRes,
          managerRes,
        ] = await Promise.all([
          fetch(`${apiUrl}/dropdowns/employee/roles/`, { headers }),
          fetch(`${apiUrl}/dropdowns/employee/employment-types/`, { headers }),
          fetch(`${apiUrl}/dropdowns/employee/status/`, { headers }),
          fetch(`${apiUrl}/dropdowns/employee/official-emails/`, { headers }),
          fetch(`${apiUrl}/dropdowns/employee/job-titles/`, { headers }),
          fetch(`${apiUrl}/dropdowns/employee/blood-groups/`, { headers }),
          fetch(`${apiUrl}/dropdowns/grades/`, { headers }),
          fetch(`${apiUrl}/dropdowns/employee/reporting-managers/`, {
            headers,
          }),
        ]);

        // Process roles
        if (roleRes.ok) {
          const data = await roleRes.json();
          setRoles(parseDropdownData(data, "Roles"));
        } else {
          console.error("Failed to fetch roles:", roleRes.status);
        }

        // Process employment types
        if (empTypeRes.ok) {
          const data = await empTypeRes.json();
          setEmploymentTypes(parseDropdownData(data, "Employment Types"));
        } else {
          console.error("Failed to fetch employment types:", empTypeRes.status);
        }

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

        // Process official emails
        if (emailRes.ok) {
          const data = await emailRes.json();
          setOfficialEmails(parseDropdownData(data, "Official Emails"));
        } else {
          console.error("Failed to fetch official emails:", emailRes.status);
        }

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

        // Process reporting managers
        if (managerRes.ok) {
          const data = await managerRes.json();
          console.log("Reporting managers response:", data);
          const managers = parseDropdownData(data);
          // For reporting managers, use email as value if available
          const formattedManagers = (
            Array.isArray(data) ? data : data?.results || data?.data || []
          ).map((item: any) => ({
            value: item.email || item.id || "",
            label: `${item.name || ""} - ${item.designation || ""} (${
              item.emp_id || ""
            })`,
          }));
          setReportingManagers(
            formattedManagers.length > 0 ? formattedManagers : managers
          );
        } else {
          console.error(
            "Failed to fetch reporting managers:",
            managerRes.status
          );
        }
      } catch (error) {
        console.error("Error loading dropdowns:", error);
        toast.error("Failed to load dropdown options");
      } finally {
        setLoadingDropdowns(false);
      }
    };

    fetchDropdowns();
  }, []);

  const formatDate = (date: Date | null) =>
    date ? date.toISOString().split("T")[0] : "";

  // Handle reset
  const handleReset = () => {
    reset();
    setSelectStartDate(new Date());
    setBirthDate(null);
    setEmployeePhoto(null);
    setDocuments([]);
  };

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

  // Handle form submission
  const onSubmit = async (data: EmployeeFormData) => {
    if (isSubmitting) return;

    const payload = {
      emp_id: data.emp_id,
      first_name: data.first_name,
      last_name: data.last_name,
      mobile: data.mobile,
      official_email: data.official_email,
      date_of_birth: formatDate(birthDate),
      blood_group: data.blood_group ?? "",
      father_or_husband_name: data.father_or_husband_name ?? "",
      father_age: data.father_age ? Number(data.father_age) : undefined,
      address: data.address ?? "",
      permanent_address: data.permanent_address ?? "",
      date_of_joining: formatDate(selectStartDate),
      overall_experience: data.overall_experience ?? "",
      previous_experience: data.previous_experience ?? "",
      employment_type: data.employment_type ?? "",
      employment_status: data.employment_status ?? "Active",
      job_title: data.job_title ?? "",
      role: data.role ?? "",
      reporting_manager_email: data.reporting_manager_email ?? "",
      bank_name: data.bank_name ?? "",
      account_number: data.account_number ?? "",
      aadhaar_number: data.aadhaar_number ?? "",
      pan_number: data.pan_number ?? "",
      has_uan: Boolean(data.has_uan),
      uan_number: data.uan_number ?? "",
    };

    try {
      setIsSubmitting(true);

      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/employee/`;
      const token = process.env.NEXT_PUBLIC_API_TOKEN;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to add employee. Please try again.");
      }

      toast.success("Employee added successfully!");
      handleReset();
      setTimeout(() => setOpen(false), 200);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to add employee. Please try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingDropdowns) {
    return (
      <Dialog open={open} onClose={handleToggle} fullWidth maxWidth="md">
        <DialogTitle>
          <div className="flex justify-between">
            <h5 className="modal-title">Add New Employee</h5>
            <button
              onClick={handleToggle}
              type="button"
              className="bd-btn-close"
            >
              <i className="fa-solid fa-xmark-large"></i>
            </button>
          </div>
        </DialogTitle>
        <DialogContent className="flex justify-center items-center min-h-[300px]">
          <div className="text-center">
            <div
              className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full border-primary border-t-transparent"
              role="status"
            >
              <span className="sr-only">Loading...</span>
            </div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Loading dropdown options...
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open} onClose={handleToggle} fullWidth maxWidth="md">
        <DialogTitle>
          <div className="flex justify-between">
            <h5 className="modal-title">Add New Employee</h5>
            <button
              onClick={handleToggle}
              type="button"
              className="bd-btn-close"
            >
              <i className="fa-solid fa-xmark-large"></i>
            </button>
          </div>
        </DialogTitle>
        <DialogContent className="common-scrollbar max-h-screen overflow-y-auto">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="card__wrapper mt-[5px]">
              <div className="grid grid-cols-12 gap-y-6 gap-x-6 maxXs:gap-x-0 justify-center align-center">
                {/* First Name */}
                <div className="col-span-12 md:col-span-6">
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

                {/* Last Name */}
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

                {/* Employee ID */}
                <div className="col-span-12 md:col-span-6">
                  <InputField
                    label="Employee ID"
                    id="emp_id"
                    type="text"
                    register={register("emp_id", {
                      required: "Employee ID is required",
                    })}
                    error={errors.emp_id}
                  />
                </div>

                {/* Contact Number */}
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

                {/* Official Email */}
                <div className="col-span-12 md:col-span-6">
                  <InputField
                    label="Official Email"
                    id="official_email"
                    type="text"
                    register={register("official_email", {
                      required: "Official Email is required",
                    })}
                    error={errors.official_email}
                  />
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

                {/* Employment Type - API Dropdown */}
                <div className="col-span-12 md:col-span-6">
                  <SelectBox
                    id="employment_type"
                    label="Employment Type"
                    options={employmentTypes}
                    control={control}
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

                {/* Role - API Dropdown */}
                <div className="col-span-12 md:col-span-6">
                  <SelectBox
                    id="role"
                    label="Role"
                    options={roles}
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
                        <div className="mt-4">
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            {documents.length} file(s) selected:
                          </p>
                          <ul className="space-y-2">
                            {documents.map((file, index) => (
                              <li
                                key={index}
                                className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700"
                              >
                                <div className="flex items-center gap-3 flex-1">
                                  <i className="fa-regular fa-file text-primary"></i>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                                      {file.name}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      {formatFileSize(file.size)}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveDocument(index)}
                                  className="ml-2 text-red-500 hover:text-red-700 transition"
                                  title="Remove file"
                                >
                                  <i className="fa-regular fa-trash-can"></i>
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="submit__btn text-center flex justify-center gap-3">
              <button
                className="btn btn-secondary"
                type="button"
                onClick={handleReset}
              >
                Reset
              </button>
              <button
                className="btn btn-primary"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddNewEmployeeModal;
