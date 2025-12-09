"use client";
import React, { useState } from "react";
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
      setDeleting(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const token = process.env.NEXT_PUBLIC_API_TOKEN;

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
                    const statusClass = useTableStatusHook(
                      (employee as any).employed_status
                    );
                    return (
                      <TableRow
                        key={employee.id || index}
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
    </div>
  );
};

export default EmployeeListView;
