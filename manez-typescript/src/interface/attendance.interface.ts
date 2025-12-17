import { StaticImageData } from "next/image";

// Employee interface based on API response
export interface IEmployeeApiResponse {
  id: number;
  emp_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  official_email: string;
  mobile: string;
  designation: string;
  date_of_joining: string;
  employed_status: string;
  employment_type: string;
  created_at: string;
  manager_name: string | null;
  manager_email: string | null;
  manager_designation: string | null;
  department: string;
  role: string;
}

// Shift interface based on API response
export interface IShiftApiResponse {
  id: number;
  name: string;
  start_time: string;
  end_time: string;
  grace_period_minutes: number;
  half_day_threshold_hours: number;
  standard_hours: number;
  created_at: string;
  updated_at: string;
}

// Attendance record interface based on API response
export interface IAttendanceRecordApiResponse {
  id: number;
  employee: IEmployeeApiResponse;
  shift: IShiftApiResponse;
  date: string;
  check_in_time: string | null;
  check_out_time: string | null;
  status: string;
  hours_worked: number;
  overtime_hours: number;
  remarks: string;
  created_at: string;
  updated_at: string;
}

// Paginated response interface
export interface IAttendancePaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: IAttendanceRecordApiResponse[];
}

// Interface for table display (simplified version for UI)
export interface IAttendanceTableRecord {
  id: number;
  employeeId: number;
  employeeEmpId: string;
  employeeName: string;
  employeeImg?: string | StaticImageData;
  date: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  status: string;
  hoursWorked: number;
  overtimeHours: number;
  shiftName: string;
  remarks: string;
  [key: string]: any; // Index signature to satisfy RowObject constraint
}

// Form interface for creating/updating attendance (excluding auto-calculated fields)
export interface IAttendanceForm {
  employee: number;
  date: string;
  shift: number;
  check_in_time?: string;
  check_out_time?: string;
  status?: string;
  remarks: string;
}