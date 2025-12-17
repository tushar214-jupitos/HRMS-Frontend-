"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import { IEmployeeLeave } from "@/interface/table.interface";
import { useForm } from "react-hook-form";
import InputField from "@/components/elements/SharedInputs/InputField";
import FormLabel from "@/components/elements/SharedInputs/FormLabel";
import DatePicker from "react-datepicker";
import { statePropsType } from "@/interface/common.interface";
import { toast } from "sonner";
import { fetchLeaveTypes, createLeaveApplication } from "@/utils/leave-api";

interface AddLeavesModalProps extends statePropsType {
  onSuccess?: () => void;
}

const AddLeavesModal = ({ open, setOpen, onSuccess }: AddLeavesModalProps) => {
  const [selectStartDate, setSelectStartDate] = useState<Date | null>(
    new Date()
  );
  const [selectEndDate, setSelectEndDate] = useState<Date | null>(new Date());
  const [leaveTypes, setLeaveTypes] = useState<{ id: number; name: string }[]>(
    []
  );
  const [selectedLeaveType, setSelectedLeaveType] = useState<number | string>(
    ""
  );
  const [isLoadingTypes, setIsLoadingTypes] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [backupOptions, setBackupOptions] = useState<
    { id: number; email: string }[]
  >([]);
  const [loadingBackupOptions, setLoadingBackupOptions] = useState(false);
  const [selectedBackupPerson, setSelectedBackupPerson] = useState<number | "">(
    ""
  );
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IEmployeeLeave>();
  const handleToggle = () => setOpen(!open);

  // Fetch leave types from API
  useEffect(() => {
    if (open) {
      loadLeaveTypes();
      loadBackupOptions();
    }
  }, [open]);

  const loadLeaveTypes = async () => {
    setIsLoadingTypes(true);
    try {
      const types = await fetchLeaveTypes();
      // Map string array to objects with id (index+1) and name
      const mappedTypes = types.map((name, index) => ({
        id: index + 1,
        name: name,
      }));
      setLeaveTypes(mappedTypes);
    } catch (error: any) {
      console.error("Error fetching leave types:", error);
      toast.error(error?.message || "Failed to load leave types");
    } finally {
      setIsLoadingTypes(false);
    }
  };

  const loadBackupOptions = async () => {
    setLoadingBackupOptions(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast.error("Unauthorized! Please login again.");
        return;
      }
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const res = await fetch(`${apiUrl}/dropdowns/user/emails/`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      });
      if (!res.ok) {
        throw new Error("Failed to fetch backup person options");
      }
      const data = await res.json();

      // Handle array of email strings
      const emailArray = Array.isArray(data) ? data : [];
      const options = emailArray
        .map((email: string, index: number) => {
          if (typeof email === "string" && email.includes("@")) {
            return { id: index + 1, email };
          }
          return null;
        })
        .filter(Boolean) as { id: number; email: string }[];
      setBackupOptions(options);
    } catch (error: any) {
      console.error("Error fetching backup options:", error);
      toast.error(error?.message || "Failed to load backup options");
    } finally {
      setLoadingBackupOptions(false);
    }
  };

  // Handle added leave
  const onSubmit = async (data: IEmployeeLeave) => {
    if (!selectedLeaveType || selectedLeaveType === "") {
      toast.error("Please select a leave type");
      return;
    }

    if (!selectStartDate || !selectEndDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedBackupEmail =
        selectedBackupPerson === ""
          ? null
          : backupOptions.find((o) => o.id === Number(selectedBackupPerson))
              ?.email || null;

      const payload = {
        leave_type: Number(selectedLeaveType),
        start_date: selectStartDate.toISOString().split("T")[0],
        end_date: selectEndDate.toISOString().split("T")[0],
        reason: data.reason,
        backup_person: selectedBackupEmail,
      };

      await createLeaveApplication(payload);
      toast.success("Leave application submitted successfully!");

      // Trigger refresh callback
      if (onSuccess) {
        onSuccess();
      }

      // Close modal after submission
      setTimeout(() => setOpen(false), 1500);
    } catch (error: any) {
      console.error("Error submitting leave application:", error);
      toast.error(error?.message || "Failed to submit leave application");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={handleToggle} fullWidth maxWidth="sm">
        <DialogTitle>
          <div className="flex justify-between">
            <h5 className="modal-title">Add Employee Leave</h5>
            <button
              onClick={handleToggle}
              type="button"
              className="bd-btn-close"
            >
              <i className="fa-solid fa-xmark-large"></i>
            </button>
          </div>
        </DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-12">
              <div className="col-span-12">
                <div className="card__wrapper mb-20">
                  <div className="grid grid-cols-12 gap-x-5 gap-y-5 maxXs:gap-x-0">
                    <div className="col-span-12 md:col-span-6">
                      <div className="from__input-box select-wrapper">
                        <div className="form__input-title">
                          <label htmlFor="leaveType" className="form-label">
                            Leave Type
                          </label>
                        </div>
                        <div className="mz-default-select">
                          <FormControl fullWidth>
                            <Select
                              id="leaveType"
                              value={selectedLeaveType}
                              onChange={(e) =>
                                setSelectedLeaveType(
                                  e.target.value as number | string
                                )
                              }
                              displayEmpty
                              disabled={isLoadingTypes}
                              renderValue={(selected) => {
                                if (selected === "") {
                                  return isLoadingTypes
                                    ? "Loading..."
                                    : "Select Leave Type";
                                }
                                const selectedType = leaveTypes.find(
                                  (type) => type.id === selected
                                );
                                return selectedType?.name || selected;
                              }}
                              MenuProps={{
                                disableScrollLock: true,
                              }}
                            >
                              {leaveTypes.map((type) => (
                                <MenuItem key={type.id} value={type.id}>
                                  {type.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </div>
                      </div>
                    </div>

                    <div className="col-span-12 md:col-span-6">
                      <div className="from__input-box select-wrapper">
                        <div className="form__input-title">
                          <label htmlFor="backupPerson" className="form-label">
                            Backup person
                          </label>
                        </div>
                        <div className="mz-default-select">
                          <FormControl fullWidth>
                            <Select
                              id="backupPerson"
                              value={selectedBackupPerson}
                              onChange={(e) =>
                                setSelectedBackupPerson(
                                  e.target.value as number | ""
                                )
                              }
                              displayEmpty
                              disabled={loadingBackupOptions}
                              renderValue={(selected) => {
                                if (selected === "") {
                                  return loadingBackupOptions
                                    ? "Loading..."
                                    : "Select Backup Person";
                                }
                                const sel = backupOptions.find(
                                  (o) => o.id === selected
                                );
                                return sel?.email || selected;
                              }}
                              MenuProps={{
                                disableScrollLock: true,
                              }}
                            >
                              {backupOptions.length > 0 ? (
                                backupOptions.map((opt) => (
                                  <MenuItem key={opt.id} value={opt.id}>
                                    {opt.email}
                                  </MenuItem>
                                ))
                              ) : (
                                <MenuItem disabled>
                                  No options available
                                </MenuItem>
                              )}
                            </Select>
                          </FormControl>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-12 md:col-span-6">
                      <FormLabel label="Start Date" id="selectStartDate" />
                      <div className="datepicker-style">
                        <DatePicker
                          id="selectStartDate"
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
                          placeholderText="Start date"
                          className="w-full"
                        />
                      </div>
                    </div>
                    <div className="col-span-12 md:col-span-6">
                      <FormLabel label="End Date" id="selectEndDate" />
                      <div className="datepicker-style">
                        <DatePicker
                          id="selectEndDate"
                          selected={selectEndDate}
                          onChange={(date) => setSelectEndDate(date)}
                          showYearDropdown
                          showMonthDropdown
                          useShortMonthInDropdown
                          showPopperArrow={false}
                          peekNextMonth
                          dropdownMode="select"
                          isClearable
                          dateFormat="dd/MM/yyyy"
                          placeholderText="End date"
                          className="w-full"
                        />
                      </div>
                    </div>

                    <div className="col-span-12">
                      <InputField
                        label="Reason"
                        id="reason"
                        isTextArea={true}
                        required={true}
                        register={register("reason", {
                          required: "Reason is required",
                        })}
                        error={errors.reason}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="submit__btn text-center">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting || isLoadingTypes}
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

export default AddLeavesModal;
