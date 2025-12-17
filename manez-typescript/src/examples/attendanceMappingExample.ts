/**
 * Example usage of the attendance mapping functions
 * This file demonstrates how to use the new attendance interfaces and mapping functions
 */

import {
  IAttendanceRecordApiResponse,
  IAttendancePaginatedResponse,
  IAttendanceTableRecord
} from "@/interface/attendance.interface";
import {
  mapAttendanceRecordToTableRecord,
  mapAttendanceResponseToTableRecords,
  mapAttendanceRecordsToTableRecords
} from "@/services/attendanceMappingService";

// Example API response data (as provided in the task)
const exampleApiResponse: IAttendancePaginatedResponse = {
  "count": 4,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 13,
      "employee": {
        "id": 8,
        "emp_id": "EMP1001",
        "first_name": "John",
        "last_name": "Doe",
        "full_name": "John Doe",
        "official_email": "jupitos@jupitostech.com",
        "mobile": "+1234567890",
        "designation": "Senior Software Engineer",
        "date_of_joining": "2023-01-15",
        "employed_status": "Active",
        "employment_type": "full_time",
        "created_at": "2025-12-12T10:44:11.232626Z",
        "manager_name": null,
        "manager_email": null,
        "manager_designation": null,
        "department": "IT",
        "role": "admin"
      },
      "shift": {
        "id": 2,
        "name": "Day Shift",
        "start_time": "09:00:00",
        "end_time": "18:00:00",
        "grace_period_minutes": 15,
        "half_day_threshold_hours": 4.0,
        "standard_hours": 8.0,
        "created_at": "2025-12-15T14:51:18.999974Z",
        "updated_at": "2025-12-15T14:51:19.000145Z"
      },
      "date": "2025-12-16",
      "check_in_time": "2025-12-16T09:10:43.322697Z",
      "check_out_time": "2025-12-16T09:30:57.627663Z",
      "status": "half_day",
      "hours_worked": 0.337306935,
      "overtime_hours": 0.0,
      "remarks": "",
      "created_at": "2025-12-16T09:10:43.311731Z",
      "updated_at": "2025-12-16T09:30:57.642259Z"
    },
    {
      "id": 7,
      "employee": {
        "id": 8,
        "emp_id": "EMP1001",
        "first_name": "John",
        "last_name": "Doe",
        "full_name": "John Doe",
        "official_email": "jupitos@jupitostech.com",
        "mobile": "+1234567890",
        "designation": "Senior Software Engineer",
        "date_of_joining": "2023-01-15",
        "employed_status": "Active",
        "employment_type": "full_time",
        "created_at": "2025-12-12T10:44:11.232626Z",
        "manager_name": null,
        "manager_email": null,
        "manager_designation": null,
        "department": "IT",
        "role": "admin"
      },
      "shift": {
        "id": 2,
        "name": "Day Shift",
        "start_time": "09:00:00",
        "end_time": "18:00:00",
        "grace_period_minutes": 15,
        "half_day_threshold_hours": 4.0,
        "standard_hours": 8.0,
        "created_at": "2025-12-15T14:51:18.999974Z",
        "updated_at": "2025-12-15T14:51:19.000145Z"
      },
      "date": "2025-12-15",
      "check_in_time": "2025-12-16T09:20:00Z",
      "check_out_time": null,
      "status": "late",
      "hours_worked": 0.0,
      "overtime_hours": 0.0,
      "remarks": "Late check-in test",
      "created_at": "2025-12-16T08:27:00.350167Z",
      "updated_at": "2025-12-16T08:27:00.350174Z"
    }
  ]
};

// Example 1: Mapping a single attendance record
const singleRecord: IAttendanceRecordApiResponse = exampleApiResponse.results[0];
const mappedSingleRecord: IAttendanceTableRecord = mapAttendanceRecordToTableRecord(singleRecord);

console.log("Mapped single record:");
console.log(mappedSingleRecord);

// Example 2: Mapping a paginated response
const mappedPaginatedResponse: IAttendanceTableRecord[] = mapAttendanceResponseToTableRecords(exampleApiResponse);

console.log("\nMapped paginated response:");
console.log(mappedPaginatedResponse);

// Example 3: Mapping an array of records
const arrayOfRecords: IAttendanceRecordApiResponse[] = exampleApiResponse.results;
const mappedArrayOfRecords: IAttendanceTableRecord[] = mapAttendanceRecordsToTableRecords(arrayOfRecords);

console.log("\nMapped array of records:");
console.log(mappedArrayOfRecords);

// Export for potential use in other files
export {
  exampleApiResponse,
  mappedSingleRecord,
  mappedPaginatedResponse,
  mappedArrayOfRecords
};