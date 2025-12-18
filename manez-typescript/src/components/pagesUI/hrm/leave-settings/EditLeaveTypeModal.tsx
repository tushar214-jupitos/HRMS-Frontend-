"use client";
import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent } from "@mui/material";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "sonner";
import { statePropsType } from "@/interface/common.interface";
import FormLabel from "@/components/elements/SharedInputs/FormLabel";
import InputField from "@/components/elements/SharedInputs/InputField";

interface EditLeaveTypeModalProps extends statePropsType {
  leaveTypeId: number | null;
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

const EditLeaveTypeModal: React.FC<EditLeaveTypeModalProps> = ({
  open,
  setOpen,
  leaveTypeId,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [editData, setEditData] = useState<LeaveTypeFormData | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
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

  // Fetch leave type data when modal opens
  useEffect(() => {
    if (open && leaveTypeId) {
      fetchLeaveTypeData();
    } else if (!open) {
      reset();
    }
  }, [open, leaveTypeId]);

  const fetchLeaveTypeData = async () => {
    setFetching(true);
    try {
      const token = localStorage.getItem("accessToken");
      console.log("API_BASE_URL:", API_BASE_URL);
      console.log("Fetching leave type:", leaveTypeId, "Token:", !!token);

      // Try with proxy first
      let url = `/api/leave-settings/types/${leaveTypeId}/`;
      let headers: any = { "x-access-token": token || "" };

      console.log("Attempting fetch from:", url);

      const response = await axios.get(url, { headers });

      console.log("Fetched leave type data:", response.data);
      const data = response.data;

      // Store fetched data in state to pass as defaultValue
      if (data) {
        const formData: LeaveTypeFormData = {
          name: data.name || "",
          code: data.code || "",
          description: data.description || "",
          max_leaves_per_year: data.max_leaves_per_year
            ? parseFloat(data.max_leaves_per_year)
            : 0,
          carry_forward_allowed: !!data.carry_forward_allowed,
          is_encashable: !!data.is_encashable,
          gender_restriction: data.gender_restriction || "all",
          is_active: !!data.is_active,
        };
        setEditData(formData);

        // Also set values for form control
        Object.keys(formData).forEach((key) => {
          setValue(
            key as keyof LeaveTypeFormData,
            formData[key as keyof LeaveTypeFormData]
          );
        });

        toast.success("Leave type data loaded successfully!");
      }
    } catch (error: any) {
      console.error("Error fetching leave type:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });
      toast.error(
        error.response?.data?.detail || "Failed to load leave type data"
      );
    } finally {
      setFetching(false);
    }
  };

  const handleToggle = () => {
    setOpen(!open);
    reset();
  };

  const onSubmit = async (data: LeaveTypeFormData) => {
    setLoading(true);

    try {
      const token = localStorage.getItem("accessToken");

      const response = await axios.put(
        `${API_BASE_URL}/leave-settings/types/${leaveTypeId}/`,
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

      console.log("Leave type updated:", response.data);
      toast.success("Leave type updated successfully!");
      reset();
      if (onSuccess) onSuccess();
      handleToggle();
    } catch (err: any) {
      console.error("Error updating leave type:", err);
      toast.error(err.response?.data?.message || "Failed to update leave type");
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
      aria-labelledby="edit-leave-type-dialog"
    >
      <DialogTitle id="edit-leave-type-dialog">
        <div className="flex justify-between">
          <h5 className="modal-title">Edit Leave Type</h5>
          <button
            type="button"
            className="bd-btn-close"
            onClick={handleToggle}
            disabled={loading || fetching}
          >
            <i className="fa-solid fa-xmark-large"></i>
          </button>
        </div>
      </DialogTitle>

      <DialogContent>
        {fetching ? (
          <div className="text-center py-10">
            <p>Loading leave type data...</p>
          </div>
        ) : (
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
                        defaultValue={editData?.name}
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
                        defaultValue={editData?.code}
                        register={register("code", {
                          required: "Leave code is required",
                          maxLength: {
                            value: 10,
                            message: "Max 10 characters",
                          },
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
                        defaultValue={editData?.description}
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
                        defaultValue={editData?.max_leaves_per_year || 0}
                        register={register("max_leaves_per_year", {
                          required: "Max leaves per year is required",
                          min: { value: 0, message: "Must be 0 or greater" },
                          valueAsNumber: true,
                        })}
                        error={errors.max_leaves_per_year}
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
                            defaultValue={editData?.gender_restriction || "all"}
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
                              defaultChecked={editData?.carry_forward_allowed}
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
                              defaultChecked={editData?.is_encashable}
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
                              defaultChecked={editData?.is_active}
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
                disabled={loading || fetching}
              >
                {loading ? "Updating..." : "Update Leave Type"}
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditLeaveTypeModal;
