import {
  IAttendanceRecordApiResponse,
  IAttendanceTableRecord,
  IAttendancePaginatedResponse
} from "@/interface/attendance.interface";

/**
 * Maps a single attendance API response record to a table record
 * @param record The attendance record from the API
 * @returns Mapped record for table display
 */
export const mapAttendanceRecordToTableRecord = (
  record: IAttendanceRecordApiResponse
): IAttendanceTableRecord => {
  return {
    id: record.id,
    employeeId: record.employee.id,
    employeeEmpId: record.employee.emp_id,
    employeeName: record.employee.full_name,
    date: record.date,
    checkInTime: record.check_in_time,
    checkOutTime: record.check_out_time,
    status: record.status,
    hoursWorked: record.hours_worked,
    overtimeHours: record.overtime_hours,
    shiftName: record.shift.name,
    remarks: record.remarks,
  };
};

/**
 * Maps a paginated attendance API response to table records
 * @param response The paginated response from the API
 * @returns Array of mapped records for table display
 */
export const mapAttendanceResponseToTableRecords = (
  response: IAttendancePaginatedResponse
): IAttendanceTableRecord[] => {
  return response.results.map(mapAttendanceRecordToTableRecord);
};

/**
 * Maps an array of attendance API response records to table records
 * @param records Array of attendance records from the API
 * @returns Array of mapped records for table display
 */
export const mapAttendanceRecordsToTableRecords = (
  records: IAttendanceRecordApiResponse[]
): IAttendanceTableRecord[] => {
  return records.map(mapAttendanceRecordToTableRecord);
};