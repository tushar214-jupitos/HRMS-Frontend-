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

interface DropdownOption {
  value: string;
  label: string;
  userId?: string | number | null;
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
  const [backupOptions, setBackupOptions] = useState<DropdownOption[]>([]);
  const [loadingBackupOptions, setLoadingBackupOptions] = useState(false);
  const [selectedBackupPerson, setSelectedBackupPerson] = useState<string>("");
  const [selectedBackupUserId, setSelectedBackupUserId] = useState<
    string | number | null
  >(null);
  const [loadingUserId, setLoadingUserId] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IEmployeeLeave>();
  const handleToggle = () => setOpen(!open);

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
          const numericMaybe = Number(item);
          const looksLikeEmail = item.includes("@");
          return {
            value: item,
            label: item,
            userId: looksLikeEmail
              ? null // force lookup by email
              : Number.isNaN(numericMaybe)
              ? null
              : numericMaybe,
          };
        } else if (typeof item === "object" && item !== null) {
          const value = item.email || item.value || item.name || item.id || "";
          const label =
            item.email ||
            item.label ||
            item.name ||
            item.display_name ||
            String(value);
          const rawId = item?.id ?? item?.user_id ?? item?.userId;
          const numericId = Number(rawId);
          const userId =
            rawId === undefined || rawId === null
              ? null
              : Number.isNaN(numericId)
              ? rawId
              : numericId;
          return { value, label, userId };
        }
        return { value: "", label: "", userId: null };
      })
      .filter((item) => item.value !== "");

    console.log(`${fieldName} parsed result:`, parsed);
    return parsed;
  };

  // Fetch leave types from API
  useEffect(() => {
    if (open) {
      loadLeaveTypes();
      loadBackupOptions();
    }
  }, [open]);

  // Auto-fetch User ID when backup person email is selected
  useEffect(() => {
    if (!selectedBackupPerson) {
      setSelectedBackupUserId(null);
      return;
    }
    const match = backupOptions.find(
      (opt) => opt.value === selectedBackupPerson
    );
    if (match && match.userId !== undefined && match.userId !== null) {
      const numericId = Number(match.userId);
      setSelectedBackupUserId(
        Number.isNaN(numericId) ? match.userId : numericId
      );
      return;
    }

    // Fallback: fetch user id by email if not present in dropdown data
    fetchUserIdByEmail(selectedBackupPerson).then((fetchedId) => {
      setSelectedBackupUserId(fetchedId);
    });
  }, [selectedBackupPerson, backupOptions]);

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
        console.error("Failed to fetch user emails:", res.status);
        throw new Error("Failed to fetch backup person options");
      }

      const data = await res.json();
      const parsedOptions = parseDropdownData(data, "User Emails");
      setBackupOptions(parsedOptions);
    } catch (error: any) {
      console.error("Error fetching backup options:", error);
      toast.error(error?.message || "Failed to load backup options");
    } finally {
      setLoadingBackupOptions(false);
    }
  };

  const fetchUserIdByEmail = async (email: string) => {
    if (!email) return null;
    try {
      setLoadingUserId(true);
      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast.error("Unauthorized! Please login again.");
        return null;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      } as const;

      // Use dedicated endpoint for getting user ID by email
      const res = await fetch(
        `${apiUrl}/dropdowns/user/id-by-email/?email=${encodeURIComponent(
          email
        )}`,
        { headers }
      );

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("User not found for the selected email");
        }
        throw new Error(
          `Failed to fetch user ID: ${res.status} ${res.statusText}`
        );
      }

      const data = await res.json();

      // Extract user ID from response
      let userId: string | number | null = null;

      if (typeof data === "number" || typeof data === "string") {
        // Direct numeric or string ID response
        userId = data;
      } else if (typeof data === "object" && data !== null) {
        // Response might be wrapped in an object
        userId = data.id ?? data.user_id ?? data.userId ?? null;
      }

      if (userId === null || userId === undefined) {
        throw new Error("Invalid response: no user ID found");
      }

      // Convert to number if possible
      const numericId = Number(userId);
      return Number.isNaN(numericId) ? userId : numericId;
    } catch (error) {
      console.error("Failed to fetch user id by email", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to fetch user id by email"
      );
      return null;
    } finally {
      setLoadingUserId(false);
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
      // Ensure backup user ID is resolved if an email is selected
      if (selectedBackupPerson && selectedBackupUserId === null) {
        const resolvedId = await fetchUserIdByEmail(selectedBackupPerson);
        if (!resolvedId) {
          toast.error(
            "Could not resolve backup person to a user. Please pick a different email or contact admin."
          );
          setIsSubmitting(false);
          return;
        }
        setSelectedBackupUserId(resolvedId);
      }

      const payload = {
        leave_type: Number(selectedLeaveType),
        start_date: selectStartDate.toISOString().split("T")[0],
        end_date: selectEndDate.toISOString().split("T")[0],
        reason: data.reason,
        backup_person:
          selectedBackupUserId === null
            ? undefined
            : Number(selectedBackupUserId),
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
                                  e.target.value as string
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
                                  (o) => o.value === selected
                                );
                                return sel?.label || selected;
                              }}
                              MenuProps={{
                                disableScrollLock: true,
                              }}
                            >
                              {backupOptions.length > 0 ? (
                                backupOptions.map((opt) => (
                                  <MenuItem key={opt.value} value={opt.value}>
                                    {opt.label}
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
                disabled={isSubmitting || isLoadingTypes || loadingUserId}
              >
                {isSubmitting
                  ? "Submitting..."
                  : loadingUserId
                  ? "Loading..."
                  : "Submit"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddLeavesModal;
