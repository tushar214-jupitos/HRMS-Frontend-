/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import React, { useState, useEffect } from "react";
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
import useMaterialTableHook from "@/hooks/useMaterialTableHook";
import { adminLeaveHeadCells } from "@/data/table-head-cell/table-head";
import { useTableStatusHook } from "@/hooks/use-condition-class";
import LeavesEditModal from "./LeavesEditModal";
import Link from "next/link";
import Image from "next/image";
import DeleteModal from "@/components/common/DeleteModal";
import TableControls from "@/components/elements/SharedInputs/TableControls";
import { ILeaveApplicationAPI } from "@/interface/leave.interface";
import {
  fetchLeaveApplications,
  deleteLeaveApplication,
} from "@/utils/leave-api";
import { toast } from "sonner";
import { format } from "date-fns";

interface LeavesTableProps {
  refreshTrigger?: number;
}

const LeavesTable = ({ refreshTrigger }: LeavesTableProps) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<ILeaveApplicationAPI | null>(null);
  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number>(0);
  const [leaveApplications, setLeaveApplications] = useState<
    ILeaveApplicationAPI[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const {
    order,
    orderBy,
    selected,
    page,
    rowsPerPage,
    searchQuery,
    paginatedRows,
    filteredRows,
    handleDelete,
    handleRequestSort,
    handleClick,
    handleChangePage,
    handleChangeRowsPerPage,
    handleSearchChange,
    setRows,
  } = useMaterialTableHook<ILeaveApplicationAPI | any>(leaveApplications, 10);

  // Fetch leave applications from API
  const loadLeaveApplications = async () => {
    setIsLoading(true);
    console.log("🔍 Starting to load leave applications...");
    console.log("API Base URL:", process.env.NEXT_PUBLIC_API_BASE_URL);

    try {
      const response = await fetchLeaveApplications(1, 100);
      console.log("✅ API Response:", response);
      console.log("📊 Results count:", response.results?.length);
      console.log("📋 Results data:", response.results);

      setLeaveApplications(response.results);
      setRows(response.results); // Update the hook's internal state
      setTotalCount(response.count);

      console.log("✅ State updated with", response.results?.length, "leaves");
    } catch (error: any) {
      console.error("❌ Error loading leave applications:", error);
      console.error("Error details:", {
        message: error?.message,
        stack: error?.stack,
      });
      toast.error(error?.message || "Failed to load leave applications");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLeaveApplications();
  }, [refreshTrigger]);

  // Handle delete leave application
  const handleDeleteLeave = async (id: number) => {
    try {
      await deleteLeaveApplication(id);
      toast.success("Leave application deleted successfully!");
      loadLeaveApplications(); // Refresh the list
    } catch (error: any) {
      console.error("Error deleting leave application:", error);
      toast.error(error?.message || "Failed to delete leave application");
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy");
    } catch {
      return dateString;
    }
  };

  // Get status badge class
  const getStatusClass = (status: string) => {
    switch (status) {
      case "approved":
      case "manager_approved":
        return "bd-status-success";
      case "pending":
        return "bd-status-warning";
      case "rejected":
      case "lop":
        return "bd-status-danger";
      default:
        return "";
    }
  };

  // Format status for display
  const formatStatus = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  console.log("🔢 Current state:", {
    leaveApplicationsCount: leaveApplications.length,
    paginatedRowsCount: paginatedRows.length,
    filteredRowsCount: filteredRows.length,
    isLoading,
  });

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
                        {adminLeaveHeadCells.map((headCell) => (
                          <TableCell
                            className="table__title"
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
                              onClick={() => handleRequestSort(headCell.id)}
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
                        <TableCell>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody className="table__body">
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-10">
                            Loading leave applications...
                          </TableCell>
                        </TableRow>
                      ) : paginatedRows.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-10">
                            No leave applications found
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedRows.map((row, index) => {
                          const stausClass = useTableStatusHook(row?.status);
                          return (
                            <TableRow
                              key={index}
                              selected={selected.includes(index)}
                              onClick={() => handleClick(index)}
                            >
                              <TableCell className="sorting_1">
                                <span className="table-avatar flex justify-start items-center">
                                  <Link
                                    className="avatar-img me-[10px]"
                                    href={`/hrm/employee-profile/${index + 1}`}
                                  >
                                    <div className="img-48 border-circle bg-primary text-white flex items-center justify-center">
                                      {row.employee.first_name
                                        .charAt(0)
                                        .toUpperCase()}
                                      {row.employee.last_name
                                        .charAt(0)
                                        .toUpperCase()}
                                    </div>
                                  </Link>
                                  <Link
                                    href={`/hrm/employee-profile/${index + 1}`}
                                  >
                                    {row.employee.full_name}
                                  </Link>
                                </span>
                              </TableCell>

                              <TableCell className="table__loan-amount">
                                {row.employee.designation}
                              </TableCell>
                              <TableCell className="table__loan-amount">
                                {row.leave_type.name}
                              </TableCell>

                              <TableCell className="table__loan-date">
                                {formatDate(row.start_date)} -{" "}
                                {formatDate(row.end_date)}
                              </TableCell>
                              <TableCell className="table__loan-created">
                                {parseFloat(row.leave_days)}{" "}
                                {parseFloat(row.leave_days) === 1
                                  ? "day"
                                  : "days"}
                              </TableCell>
                              <TableCell className="table__loan-created">
                                {row.reason}
                              </TableCell>

                              <TableCell className="table__delivery">
                                <span className={`bd-badge ${stausClass}`}>
                                  {row?.status}
                                </span>
                              </TableCell>
                              <TableCell className="table__icon-box">
                                <div className="flex items-center justify-start gap-[10px]">
                                  <button
                                    type="button"
                                    className="table__icon edit"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditData(row);
                                      setModalOpen(true);
                                    }}
                                  >
                                    <i className="fa-sharp fa-light fa-pen"></i>
                                  </button>
                                  <button
                                    className="removeBtn table__icon delete"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDeleteId(row.id);
                                      setModalDeleteOpen(true);
                                    }}
                                  >
                                    <i className="fa-regular fa-trash"></i>
                                  </button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
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
        </div>
      </div>

      {modalOpen && editData && (
        <LeavesEditModal
          open={modalOpen}
          setOpen={setModalOpen}
          editData={editData}
          onSuccess={loadLeaveApplications}
        />
      )}

      {modalDeleteOpen && (
        <DeleteModal
          open={modalDeleteOpen}
          setOpen={setModalDeleteOpen}
          handleDeleteFunc={() => handleDeleteLeave(deleteId)}
          deleteId={deleteId}
        />
      )}
    </>
  );
};

export default LeavesTable;
