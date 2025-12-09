"use client";
import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent } from "@mui/material";
import { employeeDesignationData } from "@/data/dropdown-data";
import { useForm } from "react-hook-form";
import InputField from "@/components/elements/SharedInputs/InputField";
import FormLabel from "@/components/elements/SharedInputs/FormLabel";
import DatePicker from "react-datepicker";
import SelectBox from "@/components/elements/SharedInputs/SelectBox";
import { toast } from "sonner";
import { IEmployee } from "@/interface";

type EmployeeFormData = {
  emp_id: string;
  first_name: string;
  last_name: string;
  mobile: string;
  official_email: string;
  date_of_birth?: string;
  father_or_husband_name?: string;
  father_age?: number | string;
  address?: string;
  permanent_address?: string;
  date_of_joining?: string;
  overall_experience?: string;
  previous_experience?: string;
  designation?: string;
  role?: string;
  department?: string;
  bank_name?: string;
  account_number?: string;
  aadhaar_number?: string;
  pan_number?: string;
  has_uan?: boolean;
  uan_number?: string;
};

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
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<EmployeeFormData>();

  const uanCheckboxValue = watch("has_uan");

  // Parse date string to Date object
  const parseDate = (dateString?: string): Date | null => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  };

  // Initialize form with employee data
  useEffect(() => {
    if (employee && open) {
      reset({
        emp_id: employee.employeeID || "",
        first_name: employee.firstName || "",
        last_name: employee.lastName || "",
        mobile: employee.phone || "",
        official_email: employee.email || "",
        address: employee.address || "",
        designation: employee.position || "",
      });
      setSelectStartDate(parseDate(employee.joiningDate));
      setBirthDate(parseDate(employee.date_of_birth));
    }
  }, [employee, open, reset]);

  const formatDate = (date: Date | null) =>
    date ? date.toISOString().split("T")[0] : "";

  const onSubmit = async (data: EmployeeFormData) => {
    if (isSubmitting) return;

    const payload = {
      emp_id: data.emp_id,
      first_name: data.first_name,
      last_name: data.last_name,
      mobile: data.mobile,
      official_email: data.official_email,
      date_of_birth: formatDate(birthDate),
      father_or_husband_name: data.father_or_husband_name ?? "",
      father_age: data.father_age ? Number(data.father_age) : undefined,
      address: data.address ?? "",
      permanent_address: data.permanent_address ?? "",
      date_of_joining: formatDate(selectStartDate),
      overall_experience: data.overall_experience ?? "",
      previous_experience: data.previous_experience ?? "",
      designation: data.designation ?? "",
      role: data.role ?? "",
      department: data.department ?? "",
      bank_name: data.bank_name ?? "",
      account_number: data.account_number ?? "",
      aadhaar_number: data.aadhaar_number ?? "",
      pan_number: data.pan_number ?? "",
      has_uan: Boolean(data.has_uan),
      uan_number: data.uan_number ?? "",
    };

    try {
      setIsSubmitting(true);

      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/employee/${employee.id}/`;
      const token = process.env.NEXT_PUBLIC_API_TOKEN;

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
              <div className="col-span-12 md:col-span-6">
                <InputField
                  label="Father / Husband Name"
                  id="father_or_husband_name"
                  type="text"
                  register={register("father_or_husband_name")}
                  error={errors.father_or_husband_name}
                />
              </div>
              <div className="col-span-12 text-center">
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
              <div className="col-span-12 text-center">
                <InputField
                  label="Permanent Address"
                  id="permanent_address"
                  isTextArea={true}
                  register={register("permanent_address")}
                  error={errors.permanent_address}
                />
              </div>
              <div className="col-span-12 md:col-span-6">
                <SelectBox
                  id="designation"
                  label="Designation"
                  options={employeeDesignationData}
                  control={control}
                  isRequired={true}
                />
              </div>
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
              <div className="col-span-12 md:col-span-6">
                <InputField
                  label="Father / Husband Age"
                  id="father_age"
                  type="number"
                  register={register("father_age")}
                  error={errors.father_age}
                />
              </div>
              <div className="col-span-12 md:col-span-6">
                <InputField
                  label="Overall Experience (years)"
                  id="overall_experience"
                  type="text"
                  register={register("overall_experience")}
                  error={errors.overall_experience}
                />
              </div>
              <div className="col-span-12 md:col-span-6">
                <InputField
                  label="Previous Experience (years)"
                  id="previous_experience"
                  type="text"
                  register={register("previous_experience")}
                  error={errors.previous_experience}
                />
              </div>
              <div className="col-span-12 md:col-span-6">
                <InputField
                  label="Role"
                  id="role"
                  type="text"
                  register={register("role")}
                  error={errors.role}
                />
              </div>
              <div className="col-span-12 md:col-span-6">
                <InputField
                  label="Department"
                  id="department"
                  type="text"
                  register={register("department")}
                  error={errors.department}
                />
              </div>
              <div className="col-span-12 md:col-span-6">
                <InputField
                  label="Bank Name"
                  id="bank_name"
                  type="text"
                  register={register("bank_name")}
                  error={errors.bank_name}
                />
              </div>
              <div className="col-span-12 md:col-span-6">
                <InputField
                  label="Account Number"
                  id="account_number"
                  type="text"
                  register={register("account_number")}
                  error={errors.account_number}
                />
              </div>
              <div className="col-span-12 md:col-span-6">
                <InputField
                  label="Aadhaar Number"
                  id="aadhaar_number"
                  type="text"
                  register={register("aadhaar_number")}
                  error={errors.aadhaar_number}
                />
              </div>
              <div className="col-span-12 md:col-span-6">
                <InputField
                  label="PAN Number"
                  id="pan_number"
                  type="text"
                  register={register("pan_number")}
                  error={errors.pan_number}
                />
              </div>
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
