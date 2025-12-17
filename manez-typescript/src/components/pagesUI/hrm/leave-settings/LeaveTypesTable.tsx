"use client";
import React, { useState, useEffect, useCallback } from "react";
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
import useMaterialTableHook, { RowObject } from "@/hooks/useMaterialTableHook";
import { toast } from "sonner";
import axios from "axios";
import DeleteModal from "@/components/common/DeleteModal";
import TableControls from "@/components/elements/SharedInputs/TableControls";

interface LeaveType extends RowObject {
  id: number;
  name: string;
  code: string;
  description: string;
  max_leaves_per_year: string;
  carry_forward_allowed: boolean;
  is_encashable: boolean;
  gender_restriction: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface LeaveTypesTableProps {
  refreshTrigger?: number;
}

interface HeadCell {
  disablePadding: boolean;
  id: keyof LeaveType;
  label: string;
  numeric: boolean;
}

const headCells: readonly HeadCell[] = [
  { id: "code", numeric: false, disablePadding: false, label: "Code" },
  { id: "name", numeric: false, disablePadding: false, label: "Leave Type" },
  {
    id: "max_leaves_per_year",
    numeric: true,
    disablePadding: false,
    label: "Max Days/Year",
  },
  {
    id: "carry_forward_allowed",
    numeric: false,
    disablePadding: false,
    label: "Carry Forward",
  },
  {
    id: "is_encashable",
    numeric: false,
    disablePadding: false,
    label: "Encashable",
  },
  {
    id: "gender_restriction",
    numeric: false,
    disablePadding: false,
    label: "Gender",
  },
  { id: "is_active", numeric: false, disablePadding: false, label: "Status" },
];

const LeaveTypesTable = ({ refreshTrigger }: LeaveTypesTableProps) => {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number>(0);
  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);

  const {
    order,
    orderBy,
    page,
    rowsPerPage,
    searchQuery,
    filteredRows,
    paginatedRows,
    handleRequestSort,
    handleChangePage,
    handleChangeRowsPerPage,
    handleSearchChange,
    setRows,
  } = useMaterialTableHook<LeaveType>(leaveTypes, 10);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const loadLeaveTypes = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(`/api/leave-settings/types/`, {
        headers: {
          "x-access-token": token || "",
        },
      });

      const data = response.data;
      const types = Array.isArray(data)
        ? data
        : data.results && Array.isArray(data.results)
        ? data.results
        : [];

      setLeaveTypes(types);
      setRows(types);
    } catch (error: any) {
      console.error("Error loading leave types:", error);
      toast.error(error?.message || "Failed to load leave types");
    } finally {
      setIsLoading(false);
    }
  }, [setRows]);

  useEffect(() => {
    loadLeaveTypes();
  }, [loadLeaveTypes, refreshTrigger]);

  const handleDeleteLeaveType = async (id: number) => {
    try {
      const token = localStorage.getItem("accessToken");
      await axios.delete(`${API_BASE_URL}/leave-settings/types/${id}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Leave type deleted successfully!");
      loadLeaveTypes();
    } catch (error: any) {
      console.error("Error deleting leave type:", error);
      toast.error(error?.message || "Failed to delete leave type");
    }
  };

  const startEntry = filteredRows.length ? (page - 1) * rowsPerPage + 1 : 0;
  const endEntry = filteredRows.length
    ? Math.min(page * rowsPerPage, filteredRows.length)
    : 0;

  const pillBaseClass =
    "inline-flex items-center rounded-md px-3 py-1 text-xs font-semibold";
  const neutralPillClass = `${pillBaseClass} bg-bgLightest dark:bg-bgLightest-dark text-headingPrimary dark:text-headingPrimary-dark`;
  const primaryPillClass = `${pillBaseClass} bg-primary/10 text-primary dark:text-primary`;
  const successPillClass = `${pillBaseClass} bg-success/10 text-success dark:text-success`;
  const warningPillClass = `${pillBaseClass} bg-warning/10 text-warning dark:text-warning`;
  const infoPillClass = `${pillBaseClass} bg-info/10 text-info dark:text-info`;
  const dangerPillClass = `${pillBaseClass} bg-danger/10 text-danger dark:text-danger`;

  return (
    <>
      <div className="col-span-12">
        <div className="card__wrapper">
          <div className="manaz-common-mat-list w-full table__wrapper table-responsive mat-list-without-checkbox">
            <TableControls
              rowsPerPage={rowsPerPage}
              searchQuery={searchQuery}
              handleChangeRowsPerPage={handleChangeRowsPerPage}
              handleSearchChange={handleSearchChange}
            />

            <Box sx={{ width: "100%" }} className="table-responsive">
              <Paper sx={{ width: "100%", mb: 2 }}>
                <TableContainer className="table mb-[20px] hover multiple_tables w-full">
                  <Table
                    aria-labelledby="tableTitle"
                    className="whitespace-nowrap"
                  >
                    <TableHead>
                      <TableRow className="table__title">
                        <TableCell className="table__title text-headingPrimary">
                          #
                        </TableCell>
                        {headCells.map((headCell) => (
                          <TableCell
                            className="table__title text-headingPrimary"
                            key={headCell.id}
                            sortDirection={
                              orderBy === headCell.id ? order : false
                            }
                          >
                            <TableSortLabel
                              active={orderBy === headCell.id}
                              direction={
                                orderBy === headCell.id ? order : "asc"
                              }
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
                          </TableCell>
                        ))}
                        <TableCell className="table__title text-headingPrimary">
                          Action
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody className="table__body">
                      {isLoading ? (
                        <TableRow>
                          <TableCell
                            colSpan={headCells.length + 2}
                            className="text-center py-10"
                          >
                            Loading leave types...
                          </TableCell>
                        </TableRow>
                      ) : paginatedRows.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={headCells.length + 2}
                            className="text-center py-10"
                          >
                            No leave types found. Add one to get started.
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedRows.map((row, index) => (
                          <TableRow hover tabIndex={-1} key={row.id}>
                            <TableCell
                              padding="normal"
                              className="text-headingPrimary"
                            >
                              {(page - 1) * rowsPerPage + index + 1}
                            </TableCell>
                            <TableCell className="text-headingPrimary">
                              <span className={neutralPillClass}>
                                {row.code}
                              </span>
                            </TableCell>
                            <TableCell className="text-headingPrimary">
                              <strong>{row.name}</strong>
                              {row.description && (
                                <div>
                                  <small className="text-muted">
                                    {row.description}
                                  </small>
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="text-headingPrimary">
                              <span className={primaryPillClass}>
                                {row.max_leaves_per_year} days
                              </span>
                            </TableCell>
                            <TableCell className="text-headingPrimary">
                              <span
                                className={
                                  row.carry_forward_allowed
                                    ? successPillClass
                                    : warningPillClass
                                }
                              >
                                {row.carry_forward_allowed ? "Yes" : "No"}
                              </span>
                            </TableCell>
                            <TableCell className="text-headingPrimary">
                              <span
                                className={
                                  row.is_encashable
                                    ? successPillClass
                                    : warningPillClass
                                }
                              >
                                {row.is_encashable ? "Yes" : "No"}
                              </span>
                            </TableCell>
                            <TableCell className="text-headingPrimary">
                              <span className={infoPillClass}>
                                {row.gender_restriction === "all"
                                  ? "All"
                                  : row.gender_restriction === "male"
                                  ? "Male Only"
                                  : "Female Only"}
                              </span>
                            </TableCell>
                            <TableCell className="text-headingPrimary">
                              <span
                                className={
                                  row.is_active
                                    ? successPillClass
                                    : dangerPillClass
                                }
                              >
                                {row.is_active ? "Active" : "Inactive"}
                              </span>
                            </TableCell>
                            <TableCell className="table__icon-box text-headingPrimary">
                              <button
                                type="button"
                                className="removeBtn table__icon delete"
                                onClick={() => {
                                  setDeleteId(row.id);
                                  setModalDeleteOpen(true);
                                }}
                              >
                                <i className="fa-regular fa-trash"></i>
                              </button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Box>

            <Box className="table-search-box mt-[30px]" sx={{ p: 2 }}>
              <Box>
                {filteredRows.length
                  ? `Showing ${startEntry} to ${endEntry} of ${filteredRows.length} entries`
                  : "Showing 0 entries"}
              </Box>
              <Pagination
                count={Math.ceil(filteredRows.length / rowsPerPage) || 1}
                page={Math.min(
                  page,
                  Math.max(1, Math.ceil(filteredRows.length / rowsPerPage) || 1)
                )}
                onChange={(_, value) => handleChangePage(value)}
                variant="outlined"
                shape="rounded"
                className="manaz-pagination-button"
              />
            </Box>
          </div>
        </div>
      </div>

      {modalDeleteOpen && (
        <DeleteModal
          open={modalDeleteOpen}
          setOpen={setModalDeleteOpen}
          handleDeleteFunc={() => handleDeleteLeaveType(deleteId)}
          deleteId={deleteId}
        />
      )}
    </>
  );
};

export default LeaveTypesTable;
