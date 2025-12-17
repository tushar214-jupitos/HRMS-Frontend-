# Attendance API Mapping Guide

This guide explains how to use the new attendance interfaces and mapping functions to handle API responses in the HRMS Frontend project.

## New Interfaces

We've introduced new TypeScript interfaces in `src/interface/attendance.interface.ts` to accurately represent the attendance API response structure:

### IEmployeeApiResponse
Represents the employee object within an attendance record:
```typescript
interface IEmployeeApiResponse {
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
```

### IShiftApiResponse
Represents the shift object within an attendance record:
```typescript
interface IShiftApiResponse {
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
```

### IAttendanceRecordApiResponse
Represents a complete attendance record as returned by the API:
```typescript
interface IAttendanceRecordApiResponse {
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
```

### IAttendancePaginatedResponse
Represents the paginated response structure:
```typescript
interface IAttendancePaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: IAttendanceRecordApiResponse[];
}
```

### IAttendanceTableRecord
A simplified interface for displaying attendance data in tables:
```typescript
interface IAttendanceTableRecord {
  id: number;
  employeeId: number;
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
```

### IAttendanceForm
Interface for creating/updating attendance records (excludes auto-calculated fields):
```typescript
interface IAttendanceForm {
  employee: number;
  date: string;
  shift: number;
  check_in_time?: string;
  check_out_time?: string;
  remarks: string;
}
```

## Mapping Functions

We've created utility functions in `src/services/attendanceMappingService.ts` to convert API responses to table records:

### mapAttendanceRecordToTableRecord
Converts a single attendance API record to a table record:
```typescript
const mapAttendanceRecordToTableRecord = (
  record: IAttendanceRecordApiResponse
): IAttendanceTableRecord => {
  return {
    id: record.id,
    employeeId: record.employee.id,
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
```

### mapAttendanceResponseToTableRecords
Converts a paginated API response to an array of table records:
```typescript
const mapAttendanceResponseToTableRecords = (
  response: IAttendancePaginatedResponse
): IAttendanceTableRecord[] => {
  return response.results.map(mapAttendanceRecordToTableRecord);
};
```

### mapAttendanceRecordsToTableRecords
Converts an array of attendance API records to table records:
```typescript
const mapAttendanceRecordsToTableRecords = (
  records: IAttendanceRecordApiResponse[]
): IAttendanceTableRecord[] => {
  return records.map(mapAttendanceRecordToTableRecord);
};
```

## Usage Examples

### Fetching and Mapping Attendance Data
```typescript
import { fetchAttendance } from "@/services/attendanceService";
import { mapAttendanceRecordsToTableRecords } from "@/services/attendanceMappingService";

const loadAttendanceData = async () => {
  try {
    // Fetch attendance data using the updated service
    const rawData = await fetchAttendance();
    
    // Map the raw API data to table records
    const mappedData = mapAttendanceRecordsToTableRecords(rawData);
    
    // Use mappedData in your component
    setAttendanceData(mappedData);
  } catch (err) {
    console.error("Failed to fetch attendance data:", err);
  }
};
```

### Using in a Component
See `src/components/pagesUI/hrm/attendance/AttendanceTableExample.tsx` for a complete example of how to use these interfaces and mapping functions in a React component.

## Updating Existing Components

To update existing components to use the new interfaces:

1. Import the new interfaces:
```typescript
import { 
  IAttendanceRecordApiResponse, 
  IAttendanceTableRecord
} from "@/interface/attendance.interface";
import { mapAttendanceRecordToTableRecord } from "@/services/attendanceMappingService";
```

2. Update type annotations for fetched data:
```typescript
const data = await fetchAttendance(); // Type is now IAttendanceRecordApiResponse[]
```

3. Use mapping functions to transform data for display:
```typescript
const transformedData = data.map(mapAttendanceRecordToTableRecord);
```

## Key Changes from Previous Implementation

1. **Nested Objects**: The `employee` and `shift` fields are now objects rather than simple IDs
2. **Explicit Field Mapping**: We now explicitly map fields like `employee.full_name` instead of relying on flat structures
3. **Improved Type Safety**: Stronger typing prevents runtime errors
4. **Consistent Naming**: Field names now match exactly with the API response

This new approach ensures better type safety and makes it easier to work with the attendance API responses throughout the application.