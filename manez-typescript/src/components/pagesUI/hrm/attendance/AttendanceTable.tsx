"use client";
import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { IAttendanceTableRecord } from "@/interface/attendance.interface";
import { fetchAttendance } from "@/services/attendanceService";
import { mapAttendanceRecordsToTableRecords } from "@/services/attendanceMappingService";
import { FaCheck, FaTimes, FaStar, FaCalendarAlt, FaCircle, FaEquals } from "react-icons/fa";

const AttendanceTable = () => {
  const [attendanceData, setAttendanceData] = useState<IAttendanceTableRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "list" | "monthly">("monthly");
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const loadAttendanceData = async () => {
      try {
        setLoading(true);
        const rawData = await fetchAttendance();
        const mappedData = mapAttendanceRecordsToTableRecords(rawData);
        setAttendanceData(mappedData);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch attendance data:", err);
        setError("Failed to load attendance data");
      } finally {
        setLoading(false);
      }
    };

    loadAttendanceData();
  }, []);

  if (loading) {
    return <div>Loading attendance data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const toggleViewMode = () => {
    if (viewMode === "table") {
      setViewMode("list");
    } else if (viewMode === "list") {
      setViewMode("monthly");
    } else {
      setViewMode("table");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "present":
        return <FaCheck className="text-green-500 text-lg" />;
      case "absent":
        return <FaTimes className="text-red-500 text-lg" />;
      case "holiday":
        return <FaStar className="text-purple-500 text-lg" />;
      case "day off":
      case "dayoff":
        return <FaCalendarAlt className="text-cyan-400 text-lg" />;
      case "half day":
      case "halfday":
        return <FaStar className="text-cyan-400 text-lg" />;
      case "late":
        return <FaCircle className="text-orange-500 text-lg" />;
      case "on leave":
      case "leave":
        return <FaEquals className="text-purple-500 text-lg" style={{ transform: 'rotate(90deg)' }} />;
      default:
        return status;
    }
  };

  const groupAttendanceByEmployee = () => {
    const grouped: { [key: string]: IAttendanceTableRecord[] } = {};
    attendanceData.forEach(record => {
      const employeeKey = `${record.employeeId}-${record.employeeName}`;
      if (!grouped[employeeKey]) {
        grouped[employeeKey] = [];
      }
      grouped[employeeKey].push(record);
    });
    return grouped;
  };

  const generateCalendarView = () => {
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const dates = [];
    for (let i = 1; i <= daysInMonth; i++) {
      dates.push(i);
    }
    const groupedAttendance = groupAttendanceByEmployee();
    return { dates, groupedAttendance };
  };

  const { dates, groupedAttendance } = generateCalendarView();

  const getAttendanceStatusForDate = (employeeRecords: IAttendanceTableRecord[], day: number) => {
    const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const record = employeeRecords.find(r => r.date === dateStr);
    
    if (record) {
      return getStatusIcon(record.status);
    }
    
    return <span className="text-gray-500">-</span>;
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(parseInt(e.target.value));
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(parseInt(e.target.value));
  };

  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 5; i <= currentYear + 5; i++) {
      years.push(i);
    }
    return years;
  };

  // Get initials from name
  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Filter employees by search query
  const filteredAttendance = Object.entries(groupedAttendance).filter(([employeeKey]) => {
    const [, employeeName] = employeeKey.split('-');
    return employeeName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="col-span-12">
      <div className="card__wrapper" style={{ backgroundColor: '#1e293b' }}>
        {/* Legend */}
        <div className="mb-6 p-4 rounded" style={{ backgroundColor: '#334155' }}>
          <div className="flex items-center gap-6 flex-wrap text-gray-300">
            <div className="flex items-center gap-2">
              <strong className="text-white">Note:</strong>
            </div>
            <div className="flex items-center gap-2">
              <FaStar className="text-purple-500" />
              <span className="text-sm">Holiday</span>
            </div>
            <div className="flex items-center gap-2">
              <FaCalendarAlt className="text-cyan-400" />
              <span className="text-sm">Day Off</span>
            </div>
            <div className="flex items-center gap-2">
              <FaCheck className="text-green-500" />
              <span className="text-sm">Present</span>
            </div>
            <div className="flex items-center gap-2">
              <FaStar className="text-cyan-400" />
              <span className="text-sm">Half Day</span>
            </div>
            <div className="flex items-center gap-2">
              <FaCircle className="text-orange-500" />
              <span className="text-sm">Late</span>
            </div>
            <div className="flex items-center gap-2">
              <FaTimes className="text-red-500" />
              <span className="text-sm">Absent</span>
            </div>
            <div className="flex items-center gap-2">
              <FaEquals className="text-purple-500" style={{ transform: 'rotate(90deg)' }} />
              <span className="text-sm">On Leave</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-300">
              <span>Show</span>
              <select 
                value={rowsPerPage} 
                onChange={(e) => setRowsPerPage(parseInt(e.target.value))}
                className="px-3 py-1 rounded bg-gray-700 text-white border border-gray-600"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span>Entries</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {viewMode === "monthly" && (
              <div className="flex items-center space-x-2">
                <select 
                  value={selectedMonth} 
                  onChange={handleMonthChange}
                  className="px-3 py-1 rounded bg-gray-700 text-white border border-gray-600"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(month => (
                    <option key={month} value={month}>
                      {new Date(0, month - 1).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
                <select 
                  value={selectedYear} 
                  onChange={handleYearChange}
                  className="px-3 py-1 rounded bg-gray-700 text-white border border-gray-600"
                >
                  {generateYears().map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex items-center gap-2 text-gray-300">
              <span>Search:</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-1 rounded bg-gray-700 text-white border border-gray-600"
                placeholder="Search employee..."
              />
            </div>
          </div>
        </div>
        
        {viewMode === "table" ? (
          <div className="manaz-common-mat-list mat-list-without-checkbox w-full table__wrapper">
            <Box sx={{ width: "100%" }}>
              <Paper sx={{ width: "100%", mb: 2, backgroundColor: '#1e293b' }}>
                <TableContainer>
                  <Table className="whitespace-nowrap">
                    <TableHead>
                      <TableRow className="table__title" style={{ backgroundColor: '#334155' }}>
                        <TableCell className="table_head_custom text-gray-300">Employee</TableCell>
                        <TableCell className="table_head_custom text-gray-300">Date</TableCell>
                        <TableCell className="table_head_custom text-gray-300">Check In</TableCell>
                        <TableCell className="table_head_custom text-gray-300">Check Out</TableCell>
                        <TableCell className="table_head_custom text-gray-300">Status</TableCell>
                        <TableCell className="table_head_custom text-gray-300">Hours Worked</TableCell>
                        <TableCell className="table_head_custom text-gray-300">Overtime</TableCell>
                        <TableCell className="table_head_custom text-gray-300">Shift</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody className="table__body">
                      {attendanceData.map((record) => (
                        <TableRow key={record.id} style={{ backgroundColor: '#1e293b', borderBottom: '1px solid #334155' }}>
                          <TableCell className="text-gray-300">{record.employeeName}</TableCell>
                          <TableCell className="text-gray-300">{record.date}</TableCell>
                          <TableCell className="text-gray-300">
                            {record.checkInTime 
                              ? new Date(record.checkInTime).toLocaleTimeString() 
                              : "-"}
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {record.checkOutTime 
                              ? new Date(record.checkOutTime).toLocaleTimeString() 
                              : "-"}
                          </TableCell>
                          <TableCell>
                            {getStatusIcon(record.status)}
                          </TableCell>
                          <TableCell className="text-gray-300">{record.hoursWorked.toFixed(2)}</TableCell>
                          <TableCell className="text-gray-300">{record.overtimeHours.toFixed(2)}</TableCell>
                          <TableCell className="text-gray-300">{record.shiftName}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Box>
          </div>
        ) : viewMode === "list" ? (
          <div className="manaz-common-mat-list mat-list-without-checkbox w-full">
            <Box sx={{ width: "100%" }}>
              <Paper sx={{ width: "100%", mb: 2, backgroundColor: '#1e293b' }}>
                <TableContainer>
                  <Table className="whitespace-nowrap">
                    <TableHead>
                      <TableRow className="table__title" style={{ backgroundColor: '#334155' }}>
                        <TableCell className="table_head_custom text-gray-300">Employee</TableCell>
                        <TableCell className="table_head_custom text-gray-300">Details</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody className="table__body">
                      {attendanceData.map((record) => (
                        <TableRow key={record.id} style={{ backgroundColor: '#1e293b', borderBottom: '1px solid #334155' }}>
                          <TableCell className="text-gray-300">{record.employeeName}</TableCell>
                          <TableCell>
                            <div className="flex flex-col text-gray-300">
                              <div>Date: {record.date}</div>
                              <div>Check In: {record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString() : "-"}</div>
                              <div>Check Out: {record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString() : "-"}</div>
                              <div>Status: {getStatusIcon(record.status)}</div>
                              <div>Hours Worked: {record.hoursWorked.toFixed(2)}</div>
                              <div>Overtime: {record.overtimeHours.toFixed(2)}</div>
                              <div>Shift: {record.shiftName}</div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Box>
          </div>
        ) : (
          <div className="manaz-common-mat-list mat-list-without-checkbox w-full table__wrapper overflow-x-auto">
            <Box sx={{ width: "100%" }}>
              <Paper sx={{ width: "100%", mb: 2, backgroundColor: '#1e293b' }}>
                <TableContainer>
                  <Table className="whitespace-nowrap">
                    <TableHead>
                      <TableRow className="table__title" style={{ backgroundColor: '#334155' }}>
                        <TableCell className="table_head_custom sticky left-0 z-10 text-gray-300" style={{ backgroundColor: '#334155', minWidth: '200px' }}>Employee</TableCell>
                        {dates.map(day => (
                          <TableCell key={day} className="table_head_custom text-center text-gray-300" style={{ minWidth: '50px' }}>
                            {day}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody className="table__body">
                      {filteredAttendance.slice(0, rowsPerPage).map(([employeeKey, records]) => {
                        const [employeeId, employeeName] = employeeKey.split('-');
                        return (
                          <TableRow key={employeeId} style={{ backgroundColor: '#1e293b', borderBottom: '1px solid #334155' }}>
                            <TableCell className="sticky left-0 z-10" style={{ backgroundColor: '#1e293b', borderRight: '1px solid #334155' }}>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-gray-300 font-medium">
                                  {getInitials(employeeName)}
                                </div>
                                <span className="text-gray-300 font-medium">{employeeName}</span>
                              </div>
                            </TableCell>
                            {dates.map(day => (
                              <TableCell key={day} className="text-center p-2" style={{ backgroundColor: '#1e293b' }}>
                                <div className="flex justify-center items-center h-8">
                                  {getAttendanceStatusForDate(records, day)}
                                </div>
                              </TableCell>
                            ))}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Box>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceTable;