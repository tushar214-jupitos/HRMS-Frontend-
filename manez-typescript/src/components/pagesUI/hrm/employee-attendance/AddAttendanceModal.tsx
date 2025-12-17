"use client";
import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent } from "@mui/material";
import { statePropsType } from "@/interface/common.interface";
import { useForm } from "react-hook-form";
import { IAttendanceForm } from "@/interface/attendance.interface";
import { createAttendance } from "@/services/attendanceService";
import { toast } from "sonner";

interface AddAttendanceModalProps extends statePropsType {
  onSuccess: () => void;
}

const AddAttendanceModal = ({ open, setOpen, onSuccess }: AddAttendanceModalProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<IAttendanceForm>({
    defaultValues: {
      remarks: ""
    }
  });

  const [loading, setLoading] = useState(false);

  const handleToggle = () => {
    setOpen(!open);
    if (!open) {
      reset({
        remarks: ""
      });
    }
  };

  const onSubmit = async (data: IAttendanceForm) => {
    try {
      setLoading(true);
      await createAttendance(data);
      toast.success("Attendance record created successfully!");
      reset({
        remarks: ""
      });
      onSuccess();
      handleToggle();
    } catch (error) {
      console.error("Error creating attendance record:", error);
      toast.error("Failed to create attendance record. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleToggle} fullWidth maxWidth="sm">
      <DialogTitle>
        <div className="flex justify-between">
          <h5 className="modal-title">Add Attendance Record</h5>
          <button onClick={handleToggle} type="button" className="bd-btn-close">
            <i className="fa-solid fa-xmark-large"></i>
          </button>
        </div>
      </DialogTitle>

      <DialogContent className="common-scrollbar max-h-screen overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-12 gap-6">
            {/* Employee ID */}
            <div className="col-span-12 md:col-span-6">
              <label
                htmlFor="employee"
                className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
              >
                Employee ID
              </label>
              <input
                id="employee"
                type="number"
                className={`w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border ${
                  errors.employee ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                {...register("employee", {
                  required: "Employee ID is required",
                  valueAsNumber: true,
                })}
              />
              {errors.employee && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.employee.message}
                </p>
              )}
            </div>

            {/* Date */}
            <div className="col-span-12 md:col-span-6">
              <label
                htmlFor="date"
                className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
              >
                Date
              </label>
              <input
                id="date"
                type="date"
                className={`w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border ${
                  errors.date ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                {...register("date", {
                  required: "Date is required",
                })}
              />
              {errors.date && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.date.message}
                </p>
              )}
            </div>

            {/* Shift */}
            <div className="col-span-12 md:col-span-6">
              <label
                htmlFor="shift"
                className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
              >
                Shift ID
              </label>
              <input
                id="shift"
                type="number"
                className={`w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border ${
                  errors.shift ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                {...register("shift", {
                  required: "Shift ID is required",
                  valueAsNumber: true,
                })}
              />
              {errors.shift && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.shift.message}
                </p>
              )}
            </div>

            {/* Status - Auto-calculated, removed from form */}

            {/* Check In Time */}
            <div className="col-span-12 md:col-span-6">
              <label
                htmlFor="check_in_time"
                className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
              >
                Check In Time (Optional)
              </label>
              <input
                id="check_in_time"
                type="datetime-local"
                className={`w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border ${
                  errors.check_in_time ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                {...register("check_in_time")}
              />
              {errors.check_in_time && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.check_in_time.message}
                </p>
              )}
            </div>

            {/* Check Out Time */}
            <div className="col-span-12 md:col-span-6">
              <label
                htmlFor="check_out_time"
                className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
              >
                Check Out Time (Optional)
              </label>
              <input
                id="check_out_time"
                type="datetime-local"
                className={`w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border ${
                  errors.check_out_time ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                {...register("check_out_time")}
              />
              {errors.check_out_time && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.check_out_time.message}
                </p>
              )}
            </div>

            {/* Hours Worked - Auto-calculated, removed from form */}
            {/* Overtime Hours - Auto-calculated, removed from form */}

            {/* Remarks */}
            <div className="col-span-12">
              <label
                htmlFor="remarks"
                className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
              >
                Remarks (Required)
              </label>
              <textarea
                id="remarks"
                rows={3}
                className={`w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border ${
                  errors.remarks ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                {...register("remarks", {
                  required: "Remarks are required",
                })}
              />
              {errors.remarks && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.remarks.message}
                </p>
              )}
            </div>
          </div>

          <div className="submit__btn text-center mt-6">
            <button 
              className="btn btn-primary" 
              type="submit"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Attendance"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddAttendanceModal;