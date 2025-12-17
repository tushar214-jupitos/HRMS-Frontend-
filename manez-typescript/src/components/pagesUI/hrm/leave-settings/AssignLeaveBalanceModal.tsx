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
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import { toast } from "sonner";
import { statePropsType } from "@/interface/common.interface";
import FormLabel from "@/components/elements/SharedInputs/FormLabel";

interface AssignLeaveBalanceModalProps extends statePropsType {
  onSuccess?: () => void;
}

interface LeaveBalanceFormData {
  employee: number | string;
  leave_type: number | string;
  balance: number;
  year: number;
}

interface Employee {
  id: number;
  name: string;
  emp_id: string;
}

interface LeaveType {
  id: number;
  name: string;
  code: string;
}

const AssignLeaveBalanceModal: React.FC<AssignLeaveBalanceModalProps> = ({
  open,
  setOpen,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [assignMode, setAssignMode] = useState<"single" | "all">("single");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LeaveBalanceFormData>({
    defaultValues: {
      employee: "",
      leave_type: "",
      balance: 0,
      year: new Date().getFullYear(),
    },
  });

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const handleToggle = () => {
    setOpen(!open);
    reset();
  };

  useEffect(() => {
    if (open) {
      fetchEmployees();
      fetchLeaveTypes();
    }
  }, [open]);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(`${API_BASE_URL}/employees/employee/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data;
      const normalizedEmployees = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
        ? data.results
        : Array.isArray(data?.data)
        ? data.data
        : [];

      setEmployees(normalizedEmployees);
    } catch (err) {
      console.error("Error fetching employees:", err);
      setEmployees([]);
    }
  };

  const fetchLeaveTypes = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(
        `${API_BASE_URL}/leave-settings/types/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = response.data;
      setLeaveTypes(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error("Error fetching leave types:", err);
    }
  };

  const onSubmitSingle = async (data: LeaveBalanceFormData) => {
    setLoading(true);

    try {
      const token = localStorage.getItem("accessToken");

      await axios.post(
        `${API_BASE_URL}/leave-settings/balance/assign/`,
        {
          employee: parseInt(data.employee.toString()),
          leave_type: parseInt(data.leave_type.toString()),
          balance: parseFloat(data.balance.toString()),
          year: parseInt(data.year.toString()),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Leave balance assigned successfully!");
      reset();
      if (onSuccess) onSuccess();
      handleToggle();
    } catch (err: any) {
      console.error("Error assigning leave balance:", err);
      toast.error(
        err.response?.data?.message || "Failed to assign leave balance"
      );
    } finally {
      setLoading(false);
    }
  };

  const onSubmitAll = async () => {
    const employeeId = (
      document.getElementById("employee-all") as HTMLSelectElement
    )?.value;
    const year = (document.getElementById("year-all") as HTMLInputElement)
      ?.value;

    if (!employeeId) {
      toast.error("Please select an employee");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("accessToken");

      await axios.post(
        `${API_BASE_URL}/leave-settings/balance/assign-all-to-employee/`,
        {
          employee: parseInt(employeeId),
          year: parseInt(year),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("All leave types assigned successfully!");
      if (onSuccess) onSuccess();
      handleToggle();
    } catch (err: any) {
      console.error("Error assigning all leave types:", err);
      toast.error(
        err.response?.data?.message || "Failed to assign leave types"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleToggle}
      maxWidth="md"
      fullWidth
      aria-labelledby="assign-balance-dialog"
    >
      <DialogTitle id="assign-balance-dialog" className="modal__head">
        <h5>Assign Leave Balance</h5>
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
        {/* Mode Selection */}
        <div className="mb-4">
          <div className="btn-group w-100" role="group">
            <button
              type="button"
              className={`btn ${
                assignMode === "single" ? "btn-primary" : "btn-outline-primary"
              }`}
              onClick={() => setAssignMode("single")}
            >
              Assign Single Leave Type
            </button>
            <button
              type="button"
              className={`btn ${
                assignMode === "all" ? "btn-primary" : "btn-outline-primary"
              }`}
              onClick={() => setAssignMode("all")}
            >
              Assign All Leave Types
            </button>
          </div>
        </div>

        {/* Single Assignment Form */}
        {assignMode === "single" && (
          <form onSubmit={handleSubmit(onSubmitSingle)}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <FormLabel label="Employee" required />
                <Controller
                  name="employee"
                  control={control}
                  rules={{ required: "Employee is required" }}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <Select {...field} displayEmpty>
                        <MenuItem value="">Select Employee</MenuItem>
                        {employees.map((emp) => (
                          <MenuItem key={emp.id} value={emp.id}>
                            {emp.name} ({emp.emp_id})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
                {errors.employee && (
                  <div className="text-danger small mt-1">
                    {errors.employee.message}
                  </div>
                )}
              </div>

              <div className="col-md-6 mb-3">
                <FormLabel label="Leave Type" required />
                <Controller
                  name="leave_type"
                  control={control}
                  rules={{ required: "Leave type is required" }}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <Select {...field} displayEmpty>
                        <MenuItem value="">Select Leave Type</MenuItem>
                        {leaveTypes.map((type) => (
                          <MenuItem key={type.id} value={type.id}>
                            {type.name} ({type.code})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
                {errors.leave_type && (
                  <div className="text-danger small mt-1">
                    {errors.leave_type.message}
                  </div>
                )}
              </div>

              <div className="col-md-6 mb-3">
                <FormLabel label="Balance" required />
                <Controller
                  name="balance"
                  control={control}
                  rules={{
                    required: "Balance is required",
                    min: { value: 0, message: "Must be 0 or greater" },
                  }}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      step="0.5"
                      className="form-control"
                      placeholder="e.g., 15"
                    />
                  )}
                />
                {errors.balance && (
                  <div className="text-danger small mt-1">
                    {errors.balance.message}
                  </div>
                )}
              </div>

              <div className="col-md-6 mb-3">
                <FormLabel label="Year" required />
                <Controller
                  name="year"
                  control={control}
                  rules={{ required: "Year is required" }}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      className="form-control"
                      placeholder="e.g., 2025"
                    />
                  )}
                />
                {errors.year && (
                  <div className="text-danger small mt-1">
                    {errors.year.message}
                  </div>
                )}
              </div>
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
                {loading ? "Assigning..." : "Assign Balance"}
              </button>
            </div>
          </form>
        )}

        {/* Assign All Form */}
        {assignMode === "all" && (
          <div>
            <div className="alert alert-info mb-4">
              <i className="fa fa-info-circle me-2"></i>
              This will assign all active leave types to the selected employee
              with their default balances.
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <FormLabel label="Employee" required />
                <select id="employee-all" className="form-select">
                  <option value="">Select Employee</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.emp_id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-6 mb-3">
                <FormLabel label="Year" required />
                <input
                  id="year-all"
                  type="number"
                  className="form-control"
                  defaultValue={new Date().getFullYear()}
                  placeholder="e.g., 2025"
                />
              </div>
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
                type="button"
                onClick={onSubmitAll}
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "Assigning..." : "Assign All Leave Types"}
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AssignLeaveBalanceModal;
