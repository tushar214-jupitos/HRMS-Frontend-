/* eslint-disable react-hooks/rules-of-hooks */
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
import useMaterialTableHook from "@/hooks/useMaterialTableHook";
//import AttendanceTypeIcons from "../attendance/AttendanceTypeIcons";
import Image from "next/image";
import Link from "next/link";
// Removed static data imports
import { 
  IAttendanceRecordApiResponse,
  IAttendanceTableRecord
} from "@/interface/attendance.interface";
import { mapAttendanceRecordsToTableRecords } from "@/services/attendanceMappingService";
import { useAttendanceHook } from "@/hooks/use-condition-class";
import { adminAttendanceHeadCells } from "@/data/table-head-cell/table-head";
import TableControls from "@/components/elements/SharedInputs/TableControls";
import { fetchAttendance, deleteAttendance } from "@/services/attendanceService";
import { fetchShifts } from "@/services/shiftService";
import EditAttendanceModal from "./EditAttendanceModal";
import { toast } from "sonner";
import { IconButton } from "@mui/material";
import { FaEdit, FaTrash } from "react-icons/fa";

// Add employee interface
interface IEmployee {
  id: number;
  name: string;
  first_name?: string;
  last_name?: string;
  // Add other employee fields as needed
}

const EmployeeAttendanceTable = ({ refreshTrigger: externalRefreshTrigger = 0, onRefresh }: { refreshTrigger?: number; onRefresh?: () => void; }) => {
  const [attendanceData, setAttendanceData] = useState<IAttendanceTableRecord[]>([]);
  const [employeeData, setEmployeeData] = useState<IEmployee[]>([]); // Add employee data state
  const [shiftData, setShiftData] = useState<{[key: number]: any}>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedAttendanceId, setSelectedAttendanceId] = useState<number | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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
    handleClick,
    handleChangePage,
    handleChangeRowsPerPage,
    handleSearchChange,
    setRows, // We need this to update the hook state
  } = useMaterialTableHook<IAttendanceTableRecord>(attendanceData, 10);

  // Fetch shift data from API
  const loadShiftData = async () => {
    try {
      const data = await fetchShifts();
      const shiftLookup: {[key: number]: any} = {};
      data.forEach(shift => {
        shiftLookup[shift.id] = shift;
      });
      setShiftData(shiftLookup);
    } catch (err) {
      console.error("Error fetching shift data:", err);
    }
  };

  // Fetch employee data from API
  const loadEmployeeData = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const token = localStorage.getItem("accessToken");
      
      const response = await fetch(`${apiUrl}/employee/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch employees");
      }

      const data = await response.json();
      
      let employeeList: any[] = [];
      if (Array.isArray(data)) {
        employeeList = data;
      } else if (data.results && Array.isArray(data.results)) {
        employeeList = data.results;
      } else {
        console.warn("Unexpected employee API response structure:", data);
        return;
      }

      const transformedData: IEmployee[] = employeeList.map((emp: any) => ({
        id: emp.id || emp.emp_id,
        name: `${emp.first_name || ""} ${emp.last_name || ""}`.trim() || `Employee ${emp.id || emp.emp_id}`,
        first_name: emp.first_name,
        last_name: emp.last_name,
      }));

      setEmployeeData(transformedData);
    } catch (err) {
      console.error("Error fetching employee data:", err);
    }
  };

  // Fetch attendance data from API
  const loadAttendanceData = async () => {
    try {
      setLoading(true);
      const rawData = await fetchAttendance();
      
      // Debug log to see what data is being returned
      console.log('Raw attendance data:', rawData);
      
      // Transform API data to match table structure using the mapping service
      const transformedData = mapAttendanceRecordsToTableRecords(rawData);
      
      // Debug log to see transformed data
      console.log('Transformed attendance data:', transformedData);
      
      setAttendanceData(transformedData);
      // Update the hook state with the new data
      setRows(transformedData);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch attendance data:", err);
      setError("Failed to load attendance data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShiftData();
    loadEmployeeData();
  }, []);

  // Reload attendance data when employee data changes or refresh is triggered
  useEffect(() => {
    loadAttendanceData();
  }, [employeeData, refreshTrigger, externalRefreshTrigger]);

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this attendance record?")) {
      try {
        await deleteAttendance(id);
        toast.success("Attendance record deleted successfully!");
        // Trigger a refresh by updating the refreshTrigger state
        setRefreshTrigger(prev => prev + 1);
        // Also trigger refresh in parent component for other views
        if (onRefresh) {
          onRefresh();
        }
      } catch (error) {
        console.error("Error deleting attendance record:", error);
        toast.error("Failed to delete attendance record. Please try again.");
      }
    }
  };

  const handleEdit = (id: number) => {
    setSelectedAttendanceId(id);
    setEditModalOpen(true);
  };

  if (loading) {
    return (
      <div className="col-span-12">
        <div className="card__wrapper">
          <div className="flex justify-center items-center h-64">
            <p>Loading attendance data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="col-span-12">
        <div className="card__wrapper">
          <div className="flex justify-center items-center h-64">
            <p className="text-red-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="col-span-12">
        <div className="card__wrapper">
          {/* <AttendanceTypeIcons /> */}
          <div className="manaz-common-mat-list mat-list-without-checkbox w-full table__wrapper">
            <div className="flex flex-wrap justify-between mb-4 gap-2">
              <div className="flex gap-2">
                {/* Check-in and Check-out buttons removed as requested */}
              </div>
              <div className="flex gap-2">
                {/* Add Attendance Record button removed as requested */}
              </div>
            </div>
            
            <TableControls
              rowsPerPage={rowsPerPage}
              searchQuery={searchQuery}
              handleChangeRowsPerPage={handleChangeRowsPerPage}
              handleSearchChange={handleSearchChange}
            />

            <Box
              className="table-search-box mb-[20px] multiple_tables dataTable no-footer table-responsive"
              sx={{ width: "100%" }}
            >
              <Paper sx={{ width: "100%", mb: 2 }}>
                <TableContainer className="table mb-[20px] hover multiple_tables w-full">
                  <Table
                    aria-labelledby="tableTitle"
                    className="whitespace-nowrap"
                  >
                    <TableHead>
                      <TableRow className="table__title">
                        <TableCell className="table__title table_head_custom">Employee ID</TableCell>
                        <TableCell className="table__title table_head_custom">Emp ID</TableCell>
                        <TableCell className="table__title table_head_custom">Employee</TableCell>
                        <TableCell className="table__title table_head_custom">Date</TableCell>
                        <TableCell className="table__title table_head_custom">Shift</TableCell>
                        <TableCell className="table__title table_head_custom">Check In</TableCell>
                        <TableCell className="table__title table_head_custom">Check Out</TableCell>
                        <TableCell className="table__title table_head_custom">Hours Worked</TableCell>
                        <TableCell className="table__title table_head_custom">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody className="table__body">
                      {paginatedRows.map((row: IAttendanceTableRecord, index: number) => (
                        <TableRow
                          key={row?.id || index}
                          selected={selected.includes(index)}
                          onClick={() => handleClick(index)}
                        >
                          <TableCell>{row?.employeeId || "-"}</TableCell>
                          <TableCell>{row?.employeeEmpId || "-"}</TableCell>
                          <TableCell className="sorting_1">
                            {row?.employeeName || `Employee ${row?.employeeId || 'Unknown'}`}
                          </TableCell>
                          <TableCell>{row?.date}</TableCell>
                          <TableCell>
                            {row?.shiftName || '-'}
                          </TableCell>
                          <TableCell>{row?.checkInTime || "-"}</TableCell>
                          <TableCell>{row?.checkOutTime || "-"}</TableCell>
                          <TableCell>{row?.hoursWorked || "-"}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <IconButton 
                                size="small" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(row?.id!);
                                }}
                              >
                                <FaEdit />
                              </IconButton>
                              <IconButton 
                                size="small" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(row?.id!);
                                }}
                              >
                                <FaTrash />
                              </IconButton>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
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
      
      <EditAttendanceModal 
        open={editModalOpen} 
        setOpen={setEditModalOpen} 
        onSuccess={() => {
          // Trigger a refresh by updating the refreshTrigger state
          setRefreshTrigger(prev => prev + 1);
          // Also trigger refresh in parent component for other views
          if (onRefresh) {
            onRefresh();
          }
        }} 
        attendanceId={selectedAttendanceId}
      />
    </>
  );
};

export default EmployeeAttendanceTable;