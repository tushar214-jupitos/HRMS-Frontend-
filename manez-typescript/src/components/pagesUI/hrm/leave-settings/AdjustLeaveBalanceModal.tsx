"use client";
import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import { toast } from "sonner";
import { statePropsType } from "@/interface/common.interface";
import FormLabel from "@/components/elements/SharedInputs/FormLabel";

interface AdjustLeaveBalanceModalProps extends statePropsType {
  onSuccess?: () => void;
  balanceId?: number | null;
  currentBalance?: number;
  employeeName?: string;
  leaveTypeName?: string;
}

interface AdjustBalanceFormData {
  balance: number;
}

const AdjustLeaveBalanceModal: React.FC<AdjustLeaveBalanceModalProps> = ({
  open,
  setOpen,
  onSuccess,
  balanceId,
  currentBalance = 0,
  employeeName = "",
  leaveTypeName = "",
}) => {
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AdjustBalanceFormData>({
    defaultValues: {
      balance: currentBalance,
    },
  });

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const handleToggle = () => {
    setOpen(!open);
    reset();
  };

  useEffect(() => {
    if (open && currentBalance !== undefined) {
      setValue("balance", currentBalance);
    }
  }, [open, currentBalance, setValue]);

  const onSubmit = async (data: AdjustBalanceFormData) => {
    if (!balanceId) {
      toast.error("Balance ID is required");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("accessToken");

      await axios.patch(
        `${API_BASE_URL}/leave-settings/balance/${balanceId}/adjust/`,
        {
          balance: parseFloat(data.balance.toString()),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Balance adjusted successfully!");
      reset();
      if (onSuccess) onSuccess();
      handleToggle();
    } catch (err: any) {
      console.error("Error adjusting balance:", err);
      toast.error(
        err.response?.data?.message || "Failed to adjust leave balance"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleToggle}
      maxWidth="sm"
      fullWidth
      aria-labelledby="adjust-balance-dialog"
    >
      <DialogTitle id="adjust-balance-dialog" className="modal__head">
        <h5>Adjust Leave Balance</h5>
        <button
          type="button"
          className="modal__close-btn"
          onClick={handleToggle}
          disabled={loading}
        >
          <i className="fa-light fa-xmark"></i>
        </button>
      </DialogTitle>

      <DialogContent className="modal-body">
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Employee and Leave Type Info */}
          <div className="alert alert-info mb-3">
            <div className="mb-2">
              <strong>Employee:</strong> {employeeName}
            </div>
            <div>
              <strong>Leave Type:</strong> {leaveTypeName}
            </div>
          </div>

          {/* Current Balance */}
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded">
              <span className="fw-semibold">Current Balance:</span>
              <span className="badge bg-primary fs-6">
                {currentBalance} days
              </span>
            </div>
          </div>

          {/* New Balance Input */}
          <div className="mb-3">
            <FormLabel label="New Balance" id="newBalance" />
            <Controller
              name="balance"
              control={control}
              rules={{
                required: "Balance is required",
                min: { value: 0, message: "Balance must be 0 or greater" },
              }}
              render={({ field }) => (
                <input
                  {...field}
                  type="number"
                  step="0.5"
                  className={`form-control ${
                    errors.balance ? "is-invalid" : ""
                  }`}
                  placeholder="Enter new balance"
                />
              )}
            />
            {errors.balance && (
              <div className="invalid-feedback d-block">
                {errors.balance.message}
              </div>
            )}
            <small className="form-text text-muted">
              Enter the new balance value (can use half days, e.g., 15.5)
            </small>
          </div>

          <div className="modal__footer justify-content-end">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleToggle}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Adjusting..." : "Adjust Balance"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdjustLeaveBalanceModal;
