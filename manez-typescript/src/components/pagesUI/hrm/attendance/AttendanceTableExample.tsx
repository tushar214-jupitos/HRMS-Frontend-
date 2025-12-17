import React, { useEffect, useState } from "react";
import { 
  IAttendanceRecordApiResponse, 
  IAttendanceTableRecord,
  IAttendancePaginatedResponse 
} from "@/interface/attendance.interface";
import { 
  mapAttendanceRecordToTableRecord,
  mapAttendanceResponseToTableRecords
} from "@/services/attendanceMappingService";
import { fetchAttendance } from "@/services/attendanceService";

const AttendanceTableExample = () => {
  const [attendanceData, setAttendanceData] = useState<IAttendanceTableRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAttendanceData = async () => {
      try {
        setLoading(true);
        // Fetch attendance data using the updated service
        const rawData = await fetchAttendance();
        
        // Map the raw API data to table records
        const mappedData = rawData.map(mapAttendanceRecordToTableRecord);
        
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

  return (
    <div className="overflow-x-auto">
      <h2 className="text-xl font-bold mb-4">Attendance Records</h2>
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 border-b text-left">Employee</th>
            <th className="py-2 px-4 border-b text-left">Date</th>
            <th className="py-2 px-4 border-b text-left">Check In</th>
            <th className="py-2 px-4 border-b text-left">Check Out</th>
            <th className="py-2 px-4 border-b text-left">Status</th>
            <th className="py-2 px-4 border-b text-left">Hours Worked</th>
            <th className="py-2 px-4 border-b text-left">Overtime</th>
            <th className="py-2 px-4 border-b text-left">Shift</th>
            <th className="py-2 px-4 border-b text-left">Remarks</th>
          </tr>
        </thead>
        <tbody>
          {attendanceData.map((record) => (
            <tr key={record.id} className="hover:bg-gray-50">
              <td className="py-2 px-4 border-b">{record.employeeName}</td>
              <td className="py-2 px-4 border-b">{record.date}</td>
              <td className="py-2 px-4 border-b">
                {record.checkInTime 
                  ? new Date(record.checkInTime).toLocaleTimeString() 
                  : "-"}
              </td>
              <td className="py-2 px-4 border-b">
                {record.checkOutTime 
                  ? new Date(record.checkOutTime).toLocaleTimeString() 
                  : "-"}
              </td>
              <td className="py-2 px-4 border-b">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  record.status === "present" 
                    ? "bg-green-100 text-green-800" 
                    : record.status === "half_day" 
                      ? "bg-yellow-100 text-yellow-800" 
                      : record.status === "late" 
                        ? "bg-orange-100 text-orange-800" 
                        : "bg-red-100 text-red-800"
                }`}>
                  {record.status}
                </span>
              </td>
              <td className="py-2 px-4 border-b">{record.hoursWorked.toFixed(2)}</td>
              <td className="py-2 px-4 border-b">{record.overtimeHours.toFixed(2)}</td>
              <td className="py-2 px-4 border-b">{record.shiftName}</td>
              <td className="py-2 px-4 border-b">{record.remarks || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AttendanceTableExample;