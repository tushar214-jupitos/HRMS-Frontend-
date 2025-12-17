"use client";
import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent } from "@mui/material";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "sonner";
import { statePropsType } from "@/interface/common.interface";
import FormLabel from "@/components/elements/SharedInputs/FormLabel";
import InputField from "@/components/elements/SharedInputs/InputField";

interface AddLeaveTypeModalProps extends statePropsType {
  onSuccess?: () => void;
}

interface LeaveTypeFormData {
  name: string;
  code: string;
  description: string;
  max_leaves_per_year: number;
  carry_forward_allowed: boolean;
  is_encashable: boolean;
  gender_restriction: "all" | "male" | "female";
  is_active: boolean;
}

const AddLeaveTypeModal: React.FC<AddLeaveTypeModalProps> = ({
  open,
  setOpen,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LeaveTypeFormData>({
    defaultValues: {
      name: "",
      code: "",
      description: "",
      max_leaves_per_year: 0,
      carry_forward_allowed: false,
      is_encashable: false,
      gender_restriction: "all",
      is_active: true,
    },
  });

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const handleToggle = () => {
    setOpen(!open);
    reset();
  };

  const onSubmit = async (data: LeaveTypeFormData) => {
    setLoading(true);

    try {
      const token = localStorage.getItem("accessToken");

      const response = await axios.post(
        `${API_BASE_URL}/leave-settings/types/`,
        {
          name: data.name,
          code: data.code,
          description: data.description,
          max_leaves_per_year: parseFloat(data.max_leaves_per_year.toString()),
          carry_forward_allowed: data.carry_forward_allowed,
          is_encashable: data.is_encashable,
          gender_restriction: data.gender_restriction,
          is_active: data.is_active,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Leave type created:", response.data);
      toast.success("Leave type created successfully!");
      reset();
      if (onSuccess) onSuccess();
      handleToggle();
    } catch (err: any) {
      console.error("Error creating leave type:", err);
      toast.error(err.response?.data?.message || "Failed to create leave type");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleToggle}
      fullWidth
      maxWidth="sm"
      aria-labelledby="add-leave-type-dialog"
    >
      <DialogTitle id="add-leave-type-dialog">
        <div className="flex justify-between">
          <h5 className="modal-title">Add Leave Type</h5>
          <button
            type="button"
            className="bd-btn-close"
            onClick={handleToggle}
            disabled={loading}
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
                    <InputField
                      label="Leave Type Name"
                      id="leaveTypeName"
                      placeholder="e.g., Annual Leave"
                      register={register("name", {
                        required: "Leave type name is required",
                      })}
                      error={errors.name}
                    />
                  </div>

                  <div className="col-span-12 md:col-span-6">
                    <InputField
                      label="Leave Code"
                      id="leaveCode"
                      placeholder="e.g., AL"
                      register={register("code", {
                        required: "Leave code is required",
                        maxLength: { value: 10, message: "Max 10 characters" },
                      })}
                      error={errors.code}
                    />
                  </div>

                  <div className="col-span-12">
                    <InputField
                      label="Description"
                      id="leaveDescription"
                      required={false}
                      placeholder="Enter leave type description"
                      isTextArea
                      register={register("description")}
                      error={errors.description}
                    />
                  </div>

                  <div className="col-span-12 md:col-span-6">
                    <InputField
                      label="Max Leaves Per Year"
                      id="maxLeaves"
                      type="number"
                      step={0.5}
                      placeholder="e.g., 20"
                      register={register("max_leaves_per_year", {
                        required: "Max leaves per year is required",
                        min: { value: 0, message: "Must be 0 or greater" },
                        valueAsNumber: true,
                      })}
                      error={errors.max_leaves_per_year}
                      defaultValue={0}
                    />
                  </div>

                  <div className="col-span-12 md:col-span-6">
                    <div className="from__input-box select-wrapper">
                      <FormLabel
                        label="Gender Restriction"
                        id="genderRestriction"
                        optional
                      />
                      <div className="mz-default-select">
                        <select
                          id="genderRestriction"
                          className="form-select"
                          {...register("gender_restriction")}
                        >
                          <option value="all">All</option>
                          <option value="male">Male Only</option>
                          <option value="female">Female Only</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-12">
                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-12 sm:col-span-4">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="carryForward"
                            {...register("carry_forward_allowed")}
                          />
                          <label
                            className="form-check-label"
                            htmlFor="carryForward"
                          >
                            Carry Forward Allowed
                          </label>
                        </div>
                      </div>

                      <div className="col-span-12 sm:col-span-4">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="encashable"
                            {...register("is_encashable")}
                          />
                          <label
                            className="form-check-label"
                            htmlFor="encashable"
                          >
                            Is Encashable
                          </label>
                        </div>
                      </div>

                      <div className="col-span-12 sm:col-span-4">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="isActive"
                            {...register("is_active")}
                          />
                          <label
                            className="form-check-label"
                            htmlFor="isActive"
                          >
                            Is Active
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="submit__btn text-center">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Leave Type"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddLeaveTypeModal;
