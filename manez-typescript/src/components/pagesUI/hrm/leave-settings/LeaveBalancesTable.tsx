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
import TableControls from "@/components/elements/SharedInputs/TableControls";
import AdjustLeaveBalanceModal from "./AdjustLeaveBalanceModal";

interface LeaveBalance extends RowObject {
  id: number;
  employee: number;
  employee_name: string;
  leave_type: number;
  leave_type_name: string;
  balance: string;
  year: number;
  created_at: string;
  updated_at: string;
}

interface LeaveBalancesTableProps {
  refreshTrigger?: number;
}

interface HeadCell {
  disablePadding: boolean;
  id: keyof LeaveBalance;
  label: string;
  numeric: boolean;
}

const headCells: readonly HeadCell[] = [
  {
    id: "employee_name",
    numeric: false,
    disablePadding: false,
    label: "Employee",
  },
  {
    id: "leave_type_name",
    numeric: false,
    disablePadding: false,
    label: "Leave Type",
  },
  { id: "balance", numeric: true, disablePadding: false, label: "Balance" },
  { id: "year", numeric: true, disablePadding: false, label: "Year" },
];

const LeaveBalancesTable = ({ refreshTrigger }: LeaveBalancesTableProps) => {
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedBalance, setSelectedBalance] = useState<{
    id: number;
    currentBalance: number;
    employeeName: string;
    leaveTypeName: string;
  } | null>(null);

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
  } = useMaterialTableHook<LeaveBalance>(leaveBalances, 10);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const loadLeaveBalances = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const userDataStr = localStorage.getItem("user");
      const userData = userDataStr ? JSON.parse(userDataStr) : null;
      const userRole = userData?.role?.id;

      // Determine API endpoint based on user role
      const endpoint =
        userRole === "admin"
          ? `/leave-settings/balance/`
          : `/leave-settings/balance/my-balances/`;

      const response = await axios.get(`${API_BASE_URL}${endpoint}`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data;
      const balances = Array.isArray(data)
        ? data
        : data.results && Array.isArray(data.results)
        ? data.results
        : [];

      setLeaveBalances(balances);
      setRows(balances);
    } catch (error: any) {
      console.error("Error loading leave balances:", error);
      toast.error(error?.message || "Failed to load leave balances");
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE_URL, setRows]);

  useEffect(() => {
    loadLeaveBalances();
  }, [loadLeaveBalances, refreshTrigger]);

  const handleAdjustBalance = (balance: LeaveBalance) => {
    setSelectedBalance({
      id: balance.id,
      currentBalance: parseFloat(balance.balance),
      employeeName: balance.employee_name,
      leaveTypeName: balance.leave_type_name,
    });
    setShowAdjustModal(true);
  };

  const handleAdjustSuccess = () => {
    loadLeaveBalances();
    setShowAdjustModal(false);
  };

  const startEntry = filteredRows.length ? (page - 1) * rowsPerPage + 1 : 0;
  const endEntry = filteredRows.length
    ? Math.min(page * rowsPerPage, filteredRows.length)
    : 0;

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
                            Loading leave balances...
                          </TableCell>
                        </TableRow>
                      ) : paginatedRows.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={headCells.length + 2}
                            className="text-center py-10"
                          >
                            No leave balances assigned yet.
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
                              <div className="flex flex-col">
                                <strong>{row.employee_name}</strong>
                                <span className="text-xs text-gray-500">
                                  ID: {row.employee}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-headingPrimary">
                              {row.leave_type_name}
                            </TableCell>
                            <TableCell className="text-headingPrimary">
                              <span className="bd-badge bd-status-primary">
                                {row.balance} days
                              </span>
                            </TableCell>
                            <TableCell className="text-headingPrimary">
                              <span className="bd-badge bd-status-info">
                                {row.year}
                              </span>
                            </TableCell>
                            <TableCell className="table__icon-box text-headingPrimary">
                              <button
                                type="button"
                                className="table__icon edit"
                                onClick={() => handleAdjustBalance(row)}
                                title="Adjust Balance"
                              >
                                <i className="fa-sharp fa-light fa-pen"></i>
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

      {selectedBalance && (
        <AdjustLeaveBalanceModal
          open={showAdjustModal}
          setOpen={setShowAdjustModal}
          onSuccess={handleAdjustSuccess}
          balanceId={selectedBalance.id}
          currentBalance={selectedBalance.currentBalance}
          employeeName={selectedBalance.employeeName}
          leaveTypeName={selectedBalance.leaveTypeName}
        />
      )}
    </>
  );
};

export default LeaveBalancesTable;
