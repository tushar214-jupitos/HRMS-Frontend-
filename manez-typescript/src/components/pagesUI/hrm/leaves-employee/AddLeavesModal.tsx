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
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
  const [selectedLeaveType, setSelectedLeaveType] = useState<number | string>(
    ""
  );
  const [isLoadingTypes, setIsLoadingTypes] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    }
  }, [open]);

  const loadLeaveTypes = async () => {
    setIsLoadingTypes(true);
    try {
      const types = await fetchLeaveTypes();
      setLeaveTypes(types);
    } catch (error: any) {
      console.error("Error fetching leave types:", error);
      toast.error(error?.message || "Failed to load leave types");
    } finally {
      setIsLoadingTypes(false);
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
      const payload = {
        leave_type: Number(selectedLeaveType),
        start_date: selectStartDate.toISOString().split("T")[0],
        end_date: selectEndDate.toISOString().split("T")[0],
        reason: data.reason,
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
                                return (
                                  leaveTypes.find(
                                    (type) => type.id === selected
                                  )?.name || selected
                                );
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
