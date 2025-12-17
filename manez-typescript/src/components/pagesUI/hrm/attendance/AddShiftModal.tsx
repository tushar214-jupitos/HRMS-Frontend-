"use client";
import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent } from "@mui/material";
import { statePropsType } from "@/interface/common.interface";
import { useForm } from "react-hook-form";
import InputField from "@/components/elements/SharedInputs/InputField";
import { IShiftForm } from "@/interface/table.interface";
import { createShift } from "@/services/shiftService";
import { toast } from "sonner";

interface AddShiftModalProps extends statePropsType {
  onSuccess: () => void;
}

const AddShiftModal = ({ open, setOpen, onSuccess }: AddShiftModalProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<IShiftForm>();

  const [loading, setLoading] = useState(false);

  const handleToggle = () => {
    setOpen(!open);
    if (!open) {
      reset();
    }
  };

  const onSubmit = async (data: IShiftForm) => {
    try {
      setLoading(true);
      await createShift(data);
      toast.success("Shift created successfully!");
      reset();
      onSuccess();
      handleToggle();
    } catch (error) {
      console.error("Error creating shift:", error);
      toast.error("Failed to create shift. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleToggle} fullWidth maxWidth="sm">
      <DialogTitle>
        <div className="flex justify-between">
          <h5 className="modal-title">Add New Shift</h5>
          <button onClick={handleToggle} type="button" className="bd-btn-close">
            <i className="fa-solid fa-xmark-large"></i>
          </button>
        </div>
      </DialogTitle>

      <DialogContent className="common-scrollbar max-h-screen overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-12 gap-6">
            {/* Shift Name */}
            <div className="col-span-12">
              <label
                htmlFor="name"
                className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
              >
                Shift Name
              </label>
              <input
                id="name"
                type="text"
                className={`w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border ${
                  errors.name ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                {...register("name", {
                  required: "Shift name is required",
                })}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Start Time */}
            <div className="col-span-12 md:col-span-6">
              <label
                htmlFor="start_time"
                className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
              >
                Start Time
              </label>
              <input
                id="start_time"
                type="time"
                className={`w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border ${
                  errors.start_time ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                {...register("start_time", {
                  required: "Start time is required",
                })}
              />
              {errors.start_time && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.start_time.message}
                </p>
              )}
            </div>

            {/* End Time */}
            <div className="col-span-12 md:col-span-6">
              <label
                htmlFor="end_time"
                className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
              >
                End Time
              </label>
              <input
                id="end_time"
                type="time"
                className={`w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border ${
                  errors.end_time ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                {...register("end_time", {
                  required: "End time is required",
                })}
              />
              {errors.end_time && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.end_time.message}
                </p>
              )}
            </div>

            {/* Grace Period */}
            <div className="col-span-12 md:col-span-6">
              <label
                htmlFor="grace_period_minutes"
                className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
              >
                Grace Period (minutes)
              </label>
              <input
                id="grace_period_minutes"
                type="number"
                className={`w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border ${
                  errors.grace_period_minutes ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                {...register("grace_period_minutes", {
                  required: "Grace period is required",
                  min: { value: 0, message: "Grace period must be at least 0" },
                  valueAsNumber: true,
                })}
              />
              {errors.grace_period_minutes && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.grace_period_minutes.message}
                </p>
              )}
            </div>

            {/* Half Day Threshold */}
            <div className="col-span-12 md:col-span-6">
              <label
                htmlFor="half_day_threshold_hours"
                className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
              >
                Half Day Threshold (hours)
              </label>
              <input
                id="half_day_threshold_hours"
                type="number"
                step="0.1"
                className={`w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border ${
                  errors.half_day_threshold_hours ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                {...register("half_day_threshold_hours", {
                  required: "Half day threshold is required",
                  min: { value: 0, message: "Half day threshold must be at least 0" },
                  valueAsNumber: true,
                })}
              />
              {errors.half_day_threshold_hours && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.half_day_threshold_hours.message}
                </p>
              )}
            </div>

            {/* Standard Hours */}
            <div className="col-span-12">
              <label
                htmlFor="standard_hours"
                className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
              >
                Standard Hours
              </label>
              <input
                id="standard_hours"
                type="number"
                step="0.1"
                className={`w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border ${
                  errors.standard_hours ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                {...register("standard_hours", {
                  required: "Standard hours is required",
                  min: { value: 0, message: "Standard hours must be at least 0" },
                  valueAsNumber: true,
                })}
              />
              {errors.standard_hours && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.standard_hours.message}
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
              {loading ? "Saving..." : "Save Shift"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddShiftModal;