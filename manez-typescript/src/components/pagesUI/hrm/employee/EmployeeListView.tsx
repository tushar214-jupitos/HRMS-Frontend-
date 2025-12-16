"use client";
import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import Pagination from "@mui/material/Pagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Paper from "@mui/material/Paper";
import { visuallyHidden } from "@mui/utils";
import {
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { IEmployee } from "@/interface";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useMaterialTableHook from "@/hooks/useMaterialTableHook";
import TableControls from "@/components/elements/SharedInputs/TableControls";
import EditEmployeeModal from "./EditEmployeeModal";
import { useTableStatusHook } from "@/hooks/use-condition-class";
import { toast } from "sonner";
import { getUserEmails, linkUserToEmployee } from "@/lib/employeeService";
import { useForm } from "react-hook-form";
import SelectBox from "@/components/elements/SharedInputs/SelectBox";

interface EmployeeListViewProps {
  employees: IEmployee[];
  onEmployeeDeleted?: () => void;
  onEmployeeUpdated?: () => void;
}

interface HeadCell {
  id: keyof IEmployee | "action";
  label: string;
}

const headCells: HeadCell[] = [
  { id: "name", label: "Name" },
  { id: "employeeID", label: "Employee ID" },
  { id: "position", label: "Designation" },
  { id: "email", label: "Email" },
  { id: "phone", label: "Phone" },
  { id: "joiningDate", label: "Joining Date" },
  { id: "action", label: "Status" },
  { id: "action", label: "Action" },
];

const EmployeeListView = ({
  employees,
  onEmployeeDeleted,
  onEmployeeUpdated,
}: EmployeeListViewProps) => {
  const router = useRouter();
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<IEmployee | null>(
    null
  );
  const [deleting, setDeleting] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<IEmployee | null>(null);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [employeeToLink, setEmployeeToLink] = useState<IEmployee | null>(null);
  const [userEmailOptions, setUserEmailOptions] = useState<
    { value: string; label: string; userId: string | number }[]
  >([]);
  const [linking, setLinking] = useState(false);
  const [loadingUserEmails, setLoadingUserEmails] = useState(false);
  const [loadingUserId, setLoadingUserId] = useState(false);

  const isEmployeeLinked = (employee: IEmployee | null) => {
    if (!employee) return false;
    const raw =
      (employee as any).user_id ??
      (employee as any).userId ??
      (employee as any).user?.id ??
      (employee as any).user;
    return Boolean(raw);
  };

  const {
    control: linkControl,
    reset: resetLinkForm,
    watch: watchLinkForm,
  } = useForm<{ user_email: string }>({
    defaultValues: { user_email: "" },
  });

  const [selectedUserId, setSelectedUserId] = useState<string | number | null>(
    null
  );

  const {
    order,
    orderBy,
    selected,
    page,
    rowsPerPage,
    searchQuery,
    paginatedRows,
    filteredRows,
    handleRequestSort,
    handleSelectAllClick,
    handleClick,
    handleChangePage,
    handleChangeRowsPerPage,
    handleSearchChange,
  } = useMaterialTableHook<IEmployee>(employees, 10);

  const handleViewEmployee = (id: number) => {
    router.push(`/hrm/employee-profile/${id}`);
  };

  const handleDeleteClick = (employee: IEmployee) => {
    setEmployeeToDelete(employee);
    setDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!employeeToDelete) return;

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast.error("Unauthorized! Please login again.");
        return;
      }

      setDeleting(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

      const response = await fetch(
        `${apiUrl}/employee/${employeeToDelete.id}/`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete employee");
      }

      // Show success message
      alert(`Employee ${employeeToDelete.name} deleted successfully`);

      // Call callback to refresh employee list
      if (onEmployeeDeleted) {
        onEmployeeDeleted();
      }

      setDeleteConfirm(false);
      setEmployeeToDelete(null);
    } catch (err) {
      console.error("Error deleting employee:", err);
      alert(err instanceof Error ? err.message : "Failed to delete employee");
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirm(false);
    setEmployeeToDelete(null);
  };

  const handleEditClick = (employee: IEmployee) => {
    setEmployeeToEdit(employee);
    setEditModalOpen(true);
  };

  const fetchUserEmails = async () => {
    try {
      setLoadingUserEmails(true);
      const data = await getUserEmails();

      const unwrapToArray = (val: any): any[] => {
        if (Array.isArray(val)) return val;
        if (val && typeof val === "object") {
          // Look for the first array inside the object recursively
          for (const child of Object.values(val)) {
            const arr = unwrapToArray(child);
            if (arr.length) return arr;
          }
        }
        return [];
      };

      const arrayData = unwrapToArray(data);

      const options = arrayData
        .map((item: any) => {
          if (typeof item === "string") {
            const numericMaybe = Number(item);
            const looksLikeEmail = item.includes("@");
            return {
              value: item,
              label: item,
              userId: looksLikeEmail
                ? null // force lookup by email so we don't show the email as ID
                : Number.isNaN(numericMaybe)
                ? null
                : numericMaybe,
            };
          }

          const email = item?.email || item?.value || item?.user_email || "";
          const rawId = item?.id ?? item?.user_id ?? item?.userId;
          if (!email) return null;
          const numericId = Number(rawId);
          const userId =
            rawId === undefined || rawId === null
              ? null
              : Number.isNaN(numericId)
              ? rawId
              : numericId;
          return {
            value: email,
            label: email,
            userId,
          };
        })
        .filter(Boolean) as {
        value: string;
        label: string;
        userId: string | number;
      }[];

      if (!options.length) {
        toast.error("No user emails found");
      }

      setUserEmailOptions(options);
    } catch (error) {
      console.error("Failed to load user emails", error);
      toast.error("Failed to load user emails");
    } finally {
      setLoadingUserEmails(false);
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
      const res = await fetch(
        `${apiUrl}/dropdowns/user/id-by-email/?email=${encodeURIComponent(
          email
        )}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch user id for email");
      }

      const json = await res.json();
      const numericId = Number(json?.id);
      return Number.isNaN(numericId) ? json?.id : numericId;
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

  const handleLinkClick = (employee: IEmployee) => {
    if (isEmployeeLinked(employee)) {
      toast.info("Already linked to a user");
      return;
    }
    setEmployeeToLink(employee);
    resetLinkForm({ user_email: "" });
    setSelectedUserId(null);
    setLinkModalOpen(true);
    fetchUserEmails();
  };

  const handleCloseLinkModal = () => {
    setLinkModalOpen(false);
    setEmployeeToLink(null);
    resetLinkForm({ user_email: "" });
    setSelectedUserId(null);
  };

  const handleLinkUser = async () => {
    if (!employeeToLink || !selectedUserId) {
      toast.error("Select a user email to link");
      return;
    }

    try {
      setLinking(true);
      await linkUserToEmployee(employeeToLink.id, selectedUserId);
      toast.success("User linked to employee");
      handleCloseLinkModal();
      if (onEmployeeUpdated) {
        onEmployeeUpdated();
      }
    } catch (error) {
      console.error("Link user failed", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to link user to employee"
      );
    } finally {
      setLinking(false);
    }
  };

  const handleEditModalClose = () => {
    setEditModalOpen(false);
    setEmployeeToEdit(null);
  };

  const handleEditSuccess = () => {
    handleEditModalClose();
    if (onEmployeeUpdated) {
      onEmployeeUpdated();
    }
  };

  const selectedEmail = watchLinkForm("user_email");

  useEffect(() => {
    if (!selectedEmail) {
      setSelectedUserId(null);
      return;
    }
    const match = userEmailOptions.find((opt) => opt.value === selectedEmail);
    if (match && match.userId !== undefined && match.userId !== null) {
      const numericId = Number(match.userId);
      setSelectedUserId(Number.isNaN(numericId) ? match.userId : numericId);
      return;
    }

    // Fallback: fetch user id by email if not present in dropdown data
    fetchUserIdByEmail(selectedEmail).then((fetchedId) => {
      setSelectedUserId(fetchedId);
    });
  }, [selectedEmail, userEmailOptions]);

  return (
    <div className="card__wrapper">
      <div className="manaz-common-mat-list w-full">
        <TableControls
          rowsPerPage={rowsPerPage}
          searchQuery={searchQuery}
          handleChangeRowsPerPage={handleChangeRowsPerPage}
          handleSearchChange={handleSearchChange}
        />
        <Box sx={{ width: "100%" }} className="table-responsive">
          <Paper sx={{ width: "100%", mb: 2 }}>
            <TableContainer className="table mb-[20px] hover">
              <Table aria-labelledby="tableTitle">
                <TableHead>
                  <TableRow className="table__title">
                    <TableCell padding="checkbox">
                      <Checkbox
                        className="custom-checkbox checkbox-small"
                        color="primary"
                        indeterminate={
                          selected.length > 0 &&
                          selected.length < filteredRows.length
                        }
                        checked={
                          filteredRows.length > 0 &&
                          selected.length === filteredRows.length
                        }
                        onChange={(e) =>
                          handleSelectAllClick(e.target.checked, filteredRows)
                        }
                        size="small"
                      />
                    </TableCell>
                    {headCells.map((headCell) => (
                      <TableCell
                        className="table__title"
                        key={headCell.id}
                        sortDirection={orderBy === headCell.id ? order : false}
                      >
                        {headCell.id !== "action" ? (
                          <TableSortLabel
                            active={orderBy === headCell.id}
                            direction={orderBy === headCell.id ? order : "asc"}
                            onClick={() =>
                              handleRequestSort(headCell.id as string)
                            }
                          >
                            {headCell.label}
                            {orderBy === headCell.id ? (
                              <Box component="span" sx={visuallyHidden}>
                                {order === "desc"
                                  ? "sorted descending"
                                  : "sorted ascending"}
                              </Box>
                            ) : null}
                          </TableSortLabel>
                        ) : (
                          headCell.label
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody className="table__body">
                  {paginatedRows.map((employee, index) => {
                    const isItemSelected = selected.includes(index);
                    // Move hook call outside of callback by using a helper function or computed value
                    const getStatusClass = (status: string) => {
                      // Simple status class logic without using hook
                      return status === "active"
                        ? "text-green-600"
                        : "text-red-600";
                    };
                    const statusClass = getStatusClass(
                      (employee as any).employed_status
                    );

                    return (
                      <TableRow
                        key={employee.id || index}
                        className={`table__row ${statusClass}`}
                        selected={isItemSelected}
                        onClick={() => handleClick(index)}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            className="custom-checkbox checkbox-small"
                            checked={isItemSelected}
                            size="small"
                            onChange={() => handleClick(index)}
                          />
                        </TableCell>
                        <TableCell className="sorting_1">
                          <span className="table-avatar flex justify-start items-center">
                            <Link
                              className="company__thumb me-[10px]"
                              href={`/hrm/employee-profile/${employee.id}`}
                            >
                              <Image
                                src={employee.image}
                                alt={employee.name}
                                width={40}
                                height={40}
                                className="rounded-full"
                              />
                            </Link>
                            <Link href={`/hrm/employee-profile/${employee.id}`}>
                              {employee.name}
                            </Link>
                          </span>
                        </TableCell>
                        <TableCell>{employee.employeeID || "N/A"}</TableCell>
                        <TableCell>{employee.position}</TableCell>
                        <TableCell>{employee.email || "N/A"}</TableCell>
                        <TableCell>{employee.phone}</TableCell>
                        <TableCell>
                          {employee.joiningDate
                            ? new Date(
                                employee.joiningDate
                              ).toLocaleDateString()
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          <span className={`bd-badge ${statusClass}`}>
                            {(employee as any).employed_status || "Inactive"}
                          </span>
                        </TableCell>
                        <TableCell className="table__icon-box">
                          <div className="flex items-center justify-start gap-[10px]">
                            <button
                              type="button"
                              className="table__icon download"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewEmployee(employee.id);
                              }}
                              title="View"
                            >
                              <i className="fa-regular fa-eye"></i>
                            </button>
                            <button
                              type="button"
                              className="table__icon edit"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditClick(employee);
                              }}
                              title="Edit"
                            >
                              <i className="fa-sharp fa-light fa-pen"></i>
                            </button>
                            <button
                              type="button"
                              className="table__icon download"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLinkClick(employee);
                              }}
                              title="Link User"
                            >
                              <i className="fa-solid fa-link"></i>
                            </button>
                            <button
                              className="removeBtn table__icon delete"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(employee);
                              }}
                              title="Delete"
                            >
                              <i className="fa-regular fa-trash"></i>
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
        <Box className="table-search-box mt-[30px]" sx={{ p: 2 }}>
          <Box>
            {`Showing ${(page - 1) * rowsPerPage + 1} to ${Math.min(
              page * rowsPerPage,
              filteredRows.length
            )} of ${filteredRows.length} entries`}
          </Box>
          <Pagination
            count={Math.ceil(filteredRows.length / rowsPerPage)}
            page={page}
            onChange={(e, value) => handleChangePage(value)}
            variant="outlined"
            shape="rounded"
            className="manaz-pagination-button"
          />
        </Box>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirm} onClose={handleCancelDelete}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <p>
            Are you sure you want to delete{" "}
            <strong>{employeeToDelete?.name}</strong>? This action cannot be
            undone.
          </p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} disabled={deleting}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Employee Modal */}
      {employeeToEdit && (
        <EditEmployeeModal
          open={editModalOpen}
          employee={employeeToEdit}
          onClose={handleEditModalClose}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Link User To Employee Modal */}
      <Dialog open={linkModalOpen} onClose={handleCloseLinkModal} fullWidth>
        <DialogTitle>Link User to Employee</DialogTitle>
        <DialogContent className="space-y-4">
          <div className="from__input-box">
            <div className="form__input-title">
              <label className="input__label">Employee ID</label>
            </div>
            <div className="form__input">
              <input
                className="form-control"
                value={employeeToLink?.employeeID || employeeToLink?.id || ""}
                readOnly
              />
            </div>
          </div>

          <SelectBox
            id="user_email"
            label={loadingUserEmails ? "Loading emails" : "User Email"}
            options={userEmailOptions.map((opt) => ({
              value: opt.value,
              label: opt.label,
            }))}
            control={linkControl}
            isRequired={true}
          />

          <div className="from__input-box">
            <div className="form__input-title">
              <label className="input__label">User ID</label>
            </div>
            <div className="form__input">
              <input
                className="form-control"
                value={selectedUserId ?? ""}
                readOnly
                placeholder="Auto-filled after selecting email"
              />
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseLinkModal} disabled={linking}>
            Cancel
          </Button>
          <Button
            onClick={handleLinkUser}
            variant="contained"
            disabled={linking || !selectedUserId}
          >
            {linking ? "Linking..." : "Link"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default EmployeeListView;
