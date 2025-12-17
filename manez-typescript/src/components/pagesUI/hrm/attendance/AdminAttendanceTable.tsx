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
import AttendanceTypeIcons from "./AttendanceTypeIcons";
import Image from "next/image";
import Link from "next/link";
// Removed static data imports
import { IAdminAttendance } from "@/interface/table.interface";
import { useAttendanceHook } from "@/hooks/use-condition-class";
import { adminAttendanceHeadCells } from "@/data/table-head-cell/table-head";
import TableControls from "@/components/elements/SharedInputs/TableControls";
import { fetchAttendance } from "@/services/attendanceService";
import { 
  IAttendanceRecordApiResponse,
  IAttendanceTableRecord
} from "@/interface/attendance.interface";
import { mapAttendanceRecordToTableRecord } from "@/services/attendanceMappingService";

// Add employee interface
interface IEmployee {
  id: number;
  name: string;
  first_name?: string;
  last_name?: string;
}

// Extend the interface to include employee data and index signature
interface IAdminAttendanceWithEmployee extends IAdminAttendance {
  id?: number; // Add id property to match API data
  employeeId?: number;
  employeeName?: string;
  employeeImg?: string | any; // Allow both string paths and StaticImageData
  [key: string]: any; // Add index signature to satisfy RowObject constraint
}

const AdminAttendanceTable = () => {
  const [attendanceData, setAttendanceData] = useState<IAdminAttendanceWithEmployee[]>([]);
  const [employeeData, setEmployeeData] = useState<IEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Generate date keys dynamically
  const dateKeys = Array.from({ length: 31 }, (_, i) => `date${i + 1}`);

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
  } = useMaterialTableHook<IAdminAttendanceWithEmployee>(attendanceData, 10);

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
  useEffect(() => {
    const loadAttendanceData = async () => {
      try {
        setLoading(true);
        const data = await fetchAttendance();
        
        // Transform API data to match table structure and include employee data
        const transformedData = data.map((record) => {
          // For admin attendance, we'll use the actual employee ID from the record
          const employeeId = record.employee.id;
          const employee = employeeData.find(emp => emp.id === employeeId);
          const employeeName = employee ? employee.name : `Employee ${employeeId}`;
          
          // Create an object that matches IAdminAttendance structure
          const adminAttendanceRecord: IAdminAttendanceWithEmployee = {
            id: record.id, // Include the record ID
            employeeImg: "/default-avatar.png",
            name: employeeName,
            date1: record.date || "",
            date2: "",
            date3: "",
            date4: "",
            date5: "",
            date6: "",
            date7: "",
            date8: "",
            date9: "",
            date10: "",
            date11: "",
            date12: "",
            date13: "",
            date14: "",
            date15: "",
            date16: "",
            date17: "",
            date18: "",
            date19: "",
            date20: "",
            date21: "",
            date22: "",
            date23: "",
            date24: "",
            date25: "",
            date26: "",
            date27: "",
            date28: "",
            date29: "",
            date30: "",
            date31: "",
            employeeId: employeeId,
            employeeName: employeeName,
          };
          
          return adminAttendanceRecord;
        });
        
        setAttendanceData(transformedData);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch attendance data:", err);
        setError("Failed to load attendance data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    // Load both employee and attendance data
    loadEmployeeData();
    loadAttendanceData();
  }, []);

  // Reload attendance data when employee data changes
  useEffect(() => {
    if (employeeData.length > 0) {
      const loadAttendanceData = async () => {
        try {
          setLoading(true);
          const data = await fetchAttendance();
          
          // Transform API data to match table structure and include employee data
          const transformedData = data.map((record) => {
            // For admin attendance, we'll use the actual employee ID from the record
            const employeeId = record.employee.id;
            const employee = employeeData.find(emp => emp.id === employeeId);
            const employeeName = employee ? employee.name : `Employee ${employeeId}`;
            
            // Create an object that matches IAdminAttendance structure
            const adminAttendanceRecord: IAdminAttendanceWithEmployee = {
              id: record.id, // Include the record ID
              employeeImg: "/default-avatar.png",
              name: employeeName,
              date1: record.date || "",
              date2: "",
              date3: "",
              date4: "",
              date5: "",
              date6: "",
              date7: "",
              date8: "",
              date9: "",
              date10: "",
              date11: "",
              date12: "",
              date13: "",
              date14: "",
              date15: "",
              date16: "",
              date17: "",
              date18: "",
              date19: "",
              date20: "",
              date21: "",
              date22: "",
              date23: "",
              date24: "",
              date25: "",
              date26: "",
              date27: "",
              date28: "",
              date29: "",
              date30: "",
              date31: "",
              employeeId: employeeId,
              employeeName: employeeName,
            };
            
            return adminAttendanceRecord;
          });
          
          setAttendanceData(transformedData);
          setError(null);
        } catch (err) {
          console.error("Failed to fetch attendance data:", err);
          setError("Failed to load attendance data. Please try again later.");
        } finally {
          setLoading(false);
        }
      };

      loadAttendanceData();
    }
  }, [employeeData]);

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
          <AttendanceTypeIcons />
          <div className="manaz-common-mat-list mat-list-without-checkbox w-full table__wrapper">
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
                        {adminAttendanceHeadCells.map((headCell) => (
                          <TableCell
                            className="table__title table_head_custom"
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
                      </TableRow>
                    </TableHead>
                    <TableBody className="table__body">
                      {paginatedRows.map((row, index) => {
                        // Use map to loop through date keys and render the cells
                        return (
                          <TableRow
                            key={index}
                            selected={selected.includes(index)}
                            onClick={() => handleClick(index)}
                          >
                            <TableCell className="sorting_1">
                              <span className="table-avatar flex justify-start items-center">
                                <Link
                                  className="me-2.5 avatar-img"
                                  href={`/hrm/employee-profile/${row['id'] || (typeof row['employeeId'] === 'object' ? (row['employeeId']?.['id'] || index + 1) : (row['employeeId'] || index + 1))}`}
                                >
                                  <Image
                                    className=" border-circle"
                                    src={row.employeeImg}
                                    alt="User Image"
                                    width={40}
                                    height={40}
                                  />
                                </Link>
                                <Link
                                  href={`/hrm/employee-profile/${row['id'] || (typeof row['employeeId'] === 'object' ? (row['employeeId']?.['id'] || index + 1) : (row['employeeId'] || index + 1))}`}
                                  className="avatar-name"
                                >
                                  {row.employeeName || row.name || `Employee ${row.employeeId || 'Unknown'}`}
                                </Link>
                              </span>
                            </TableCell>
                            {dateKeys.map((dateKey) => {
                              // Dynamically call the useAttendanceHook for each dateKey
                              const attendanceStatus = useAttendanceHook(
                                row[dateKey]
                              );

                              return (
                                <TableCell key={dateKey}>
                                  <button>
                                    <i className={attendanceStatus}></i>
                                  </button>
                                </TableCell>
                              );
                            })}
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
        </div>
      </div>
    </>
  );
};

export default AdminAttendanceTable;