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
import InputField from "@/components/elements/SharedInputs/InputField";

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
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingLeaveTypes, setLoadingLeaveTypes] = useState(false);
  const [assignAllEmployee, setAssignAllEmployee] = useState<string | number>(
    ""
  );
  const [assignAllYear, setAssignAllYear] = useState<number>(
    new Date().getFullYear()
  );

  const {
    control,
    handleSubmit,
    reset,
    register,
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
    setAssignAllEmployee("");
    setAssignAllYear(new Date().getFullYear());
  };

  // Helper function to parse dropdown data
  const parseDropdownData = (data: any, fieldName: string = ""): any[] => {
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

    console.log(`${fieldName} parsed result:`, items);
    return items;
  };

  useEffect(() => {
    if (open) {
      fetchEmployees();
      fetchLeaveTypes();
    }
  }, [open]);

  const fetchEmployees = async () => {
    setLoadingEmployees(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(
        `${API_BASE_URL}/dropdowns/employee/official-emails/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      const data = response.data;
      console.log("Raw employee data:", data);

      const parsedData = parseDropdownData(data, "Employees");

      // Map the parsed data to Employee interface
      const normalizedEmployees: Employee[] = parsedData.map(
        (item: any, index: number) => {
          // Handle string items (just emails)
          if (typeof item === "string") {
            return {
              id: index + 1,
              name: item,
              emp_id: "",
            };
          }

          // Handle object items
          const id = item.id || item.user_id || item.employee_id || index + 1;
          const name =
            item.name ||
            item.full_name ||
            item.display_name ||
            item.email ||
            item.official_email ||
            `Employee ${id}`;
          const empId =
            item.emp_id || item.employee_id || item.employee_code || "";

          return {
            id: id,
            name: name,
            emp_id: empId,
          };
        }
      );

      console.log("Normalized employees:", normalizedEmployees);
      setEmployees(normalizedEmployees);
    } catch (err) {
      console.error("Error fetching employees:", err);
      toast.error("Failed to load employees");
      setEmployees([]);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const fetchLeaveTypes = async () => {
    setLoadingLeaveTypes(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(
        `${API_BASE_URL}/dropdowns/leave/types/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      const data = response.data;
      console.log("Raw leave types data:", data);

      const parsedData = parseDropdownData(data, "Leave Types");

      // Map the parsed data to LeaveType interface
      const normalizedLeaveTypes: LeaveType[] = parsedData.map(
        (item: any, index: number) => {
          // Handle string items
          if (typeof item === "string") {
            return {
              id: index + 1,
              name: item,
              code: "",
            };
          }

          // Handle object items
          return {
            id: item.id || index + 1,
            name:
              item.name ||
              item.leave_type ||
              item.type ||
              `Leave Type ${item.id || index + 1}`,
            code: item.code || item.leave_code || item.type_code || "",
          };
        }
      );

      console.log("Normalized leave types:", normalizedLeaveTypes);
      setLeaveTypes(normalizedLeaveTypes);
    } catch (err) {
      console.error("Error fetching leave types:", err);
      toast.error("Failed to load leave types");
      setLeaveTypes([]);
    } finally {
      setLoadingLeaveTypes(false);
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
    if (!assignAllEmployee) {
      toast.error("Please select an employee");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("accessToken");

      await axios.post(
        `${API_BASE_URL}/leave-settings/balance/assign-all-to-employee/`,
        {
          employee: parseInt(assignAllEmployee.toString()),
          year: parseInt(assignAllYear.toString()),
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
            <div className="grid grid-cols-12">
              <div className="col-span-12">
                <div className="card__wrapper mb-20">
                  <div className="grid grid-cols-12 gap-x-5 gap-y-5 maxXs:gap-x-0">
                    <div className="col-span-12 md:col-span-6">
                      <FormLabel label="Employee" id="employee" />
                      <div className="from__input-box select-wrapper">
                        <div className="mz-default-select">
                          <Controller
                            name="employee"
                            control={control}
                            rules={{ required: "Employee is required" }}
                            render={({ field }) => (
                              <FormControl fullWidth>
                                <Select
                                  {...field}
                                  displayEmpty
                                  disabled={loadingEmployees || loading}
                                  renderValue={(selected) => {
                                    if (!selected) {
                                      return loadingEmployees
                                        ? "Loading..."
                                        : "Select Employee";
                                    }
                                    const emp = employees.find(
                                      (e) => e.id === selected
                                    );
                                    if (!emp) return selected;
                                    return emp.emp_id
                                      ? `${emp.name} (${emp.emp_id})`
                                      : emp.name;
                                  }}
                                  MenuProps={{ disableScrollLock: true }}
                                >
                                  {employees.length === 0 ? (
                                    <MenuItem disabled>
                                      {loadingEmployees
                                        ? "Loading..."
                                        : "No employees found"}
                                    </MenuItem>
                                  ) : (
                                    employees.map((emp) => (
                                      <MenuItem key={emp.id} value={emp.id}>
                                        {emp.emp_id
                                          ? `${emp.name} (${emp.emp_id})`
                                          : emp.name}
                                      </MenuItem>
                                    ))
                                  )}
                                </Select>
                              </FormControl>
                            )}
                          />
                        </div>
                      </div>
                      {errors.employee && (
                        <div className="text-danger small mt-1">
                          {errors.employee.message}
                        </div>
                      )}
                    </div>

                    <div className="col-span-12 md:col-span-6">
                      <FormLabel label="Leave Type" id="leaveType" />
                      <div className="from__input-box select-wrapper">
                        <div className="mz-default-select">
                          <Controller
                            name="leave_type"
                            control={control}
                            rules={{ required: "Leave type is required" }}
                            render={({ field }) => (
                              <FormControl fullWidth>
                                <Select
                                  {...field}
                                  displayEmpty
                                  disabled={loadingLeaveTypes || loading}
                                  renderValue={(selected) => {
                                    if (!selected) {
                                      return loadingLeaveTypes
                                        ? "Loading..."
                                        : "Select Leave Type";
                                    }
                                    const type = leaveTypes.find(
                                      (t) => t.id === selected
                                    );
                                    if (!type) return selected;
                                    return type.code
                                      ? `${type.name} (${type.code})`
                                      : type.name;
                                  }}
                                  MenuProps={{ disableScrollLock: true }}
                                >
                                  {leaveTypes.length === 0 ? (
                                    <MenuItem disabled>
                                      {loadingLeaveTypes
                                        ? "Loading..."
                                        : "No leave types found"}
                                    </MenuItem>
                                  ) : (
                                    leaveTypes.map((type) => (
                                      <MenuItem key={type.id} value={type.id}>
                                        {type.code
                                          ? `${type.name} (${type.code})`
                                          : type.name}
                                      </MenuItem>
                                    ))
                                  )}
                                </Select>
                              </FormControl>
                            )}
                          />
                        </div>
                      </div>
                      {errors.leave_type && (
                        <div className="text-danger small mt-1">
                          {errors.leave_type.message}
                        </div>
                      )}
                    </div>

                    <div className="col-span-12 md:col-span-6">
                      <InputField
                        label="Balance"
                        id="balance"
                        type="number"
                        step={0.5}
                        placeholder="e.g., 15"
                        register={register("balance", {
                          required: "Balance is required",
                          min: { value: 0, message: "Must be 0 or greater" },
                          valueAsNumber: true,
                        })}
                        error={errors.balance}
                      />
                    </div>

                    <div className="col-span-12 md:col-span-6">
                      <InputField
                        label="Year"
                        id="year"
                        type="number"
                        placeholder="e.g., 2025"
                        register={register("year", {
                          required: "Year is required",
                          valueAsNumber: true,
                        })}
                        error={errors.year}
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
                <FormLabel label="Employee" id="employeeAll" />
                <div className="from__input-box select-wrapper">
                  <div className="mz-default-select">
                    <FormControl fullWidth>
                      <Select
                        id="employee-all"
                        value={assignAllEmployee}
                        onChange={(e) => setAssignAllEmployee(e.target.value)}
                        displayEmpty
                        disabled={loadingEmployees || loading}
                        renderValue={(selected) => {
                          if (!selected) {
                            return loadingEmployees
                              ? "Loading..."
                              : "Select Employee";
                          }
                          const emp = employees.find(
                            (item) => item.id === selected
                          );
                          if (!emp) return selected as any;
                          return emp.emp_id
                            ? `${emp.name} (${emp.emp_id})`
                            : emp.name;
                        }}
                        MenuProps={{ disableScrollLock: true }}
                      >
                        {employees.length === 0 ? (
                          <MenuItem disabled>
                            {loadingEmployees
                              ? "Loading..."
                              : "No employees found"}
                          </MenuItem>
                        ) : (
                          employees.map((emp) => (
                            <MenuItem key={emp.id} value={emp.id}>
                              {emp.emp_id
                                ? `${emp.name} (${emp.emp_id})`
                                : emp.name}
                            </MenuItem>
                          ))
                        )}
                      </Select>
                    </FormControl>
                  </div>
                </div>
              </div>

              <div className="col-md-6 mb-3">
                <FormLabel label="Year" id="yearAll" />
                <input
                  id="year-all"
                  type="number"
                  className="form-control"
                  placeholder="e.g., 2025"
                  value={assignAllYear}
                  onChange={(e) => setAssignAllYear(Number(e.target.value))}
                  disabled={loading}
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
