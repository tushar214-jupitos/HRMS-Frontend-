import {
  IAttendanceRecordApiResponse,
  IAttendanceForm
} from "@/interface/attendance.interface";

// Define interface for attendance record based on API documentation
// DEPRECATED: Use IAttendanceRecordApiResponse instead
export interface IAttendanceRecord {
  id?: number;
  employee: number;
  date: string;
  shift: number | { id: number; name: string; [key: string]: any }; // Handle both number and object
  check_in_time?: string;
  check_out_time?: string;
  status: string;
  hours_worked?: number;
  overtime_hours?: number;
  remarks?: string;
  created_at?: string;
  updated_at?: string;
}

// Define interface for creating/updating attendance records
// Note: status, hours_worked, and overtime_hours are auto-calculated by the backend
// DEPRECATED: Use IAttendanceForm instead
export interface IAttendanceRecordForm {
  employee: number;
  date: string;
  shift: number;
  check_in_time?: string;
  check_out_time?: string;
  remarks?: string;
}

// Define interface for today's check-ins report
export interface ITodaysCheckInRecord {
  employee_id: number;
  emp_id: string;
  employee_name: string;
  check_in_time: string | null;
  check_out_time: string | null;
  status: string;
  shift_name: string;
}

export interface ITodaysCheckInsReport {
  date: string;
  total_employees: number;
  checked_in: number;
  not_checked_in: number;
  check_in_percentage: number;
  check_in_list: ITodaysCheckInRecord[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Type declaration for process.env in browser environment
declare const process: {
  env: {
    NEXT_PUBLIC_API_BASE_URL?: string;
  };
};

// Get authorization headers
const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem("accessToken") : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

// Fetch all attendance records with optional filters
export const fetchAttendance = async (filters?: {
  employee?: number;
  date?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
}): Promise<IAttendanceRecordApiResponse[]> => {
  try {
    // Build query string from filters
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    
    // Add cache-busting parameter
    queryParams.append('_t', Date.now().toString());
    
    const queryString = queryParams.toString();
    const url = queryString 
      ? `${API_BASE_URL}/attendance/attendance/?${queryString}`
      : `${API_BASE_URL}/attendance/attendance/?_t=${Date.now()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...getAuthHeaders(),
        "ngrok-skip-browser-warning": "true",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Debug log to see what data is being returned
    console.log('Attendance API Response:', data);
    
    // Handle both array and paginated responses
    if (Array.isArray(data)) {
      return data;
    } else if (data && typeof data === 'object' && data.results && Array.isArray(data.results)) {
      // If it's a paginated response, return the results array
      return data.results;
    } else {
      // If it's not an array, return an empty array
      console.warn('Attendance API did not return an array:', data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching attendance:', error);
    throw error;
  }
};

// Create a new attendance record
export const createAttendance = async (attendanceData: IAttendanceForm): Promise<IAttendanceRecordApiResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/attendance/attendance/`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify(attendanceData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating attendance record:', error);
    throw error;
  }
};

// Get a specific attendance record
export const getAttendanceById = async (id: number): Promise<IAttendanceRecordApiResponse> => {
  try {
    // Add cache-busting parameter
    const url = `${API_BASE_URL}/attendance/attendance/${id}/?_t=${Date.now()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...getAuthHeaders(),
        "ngrok-skip-browser-warning": "true",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Attendance record by ID:', data); // Debug log
    return data;
  } catch (error) {
    console.error('Error fetching attendance record:', error);
    throw error;
  }
};

// Update an existing attendance record
export const updateAttendance = async (id: number, attendanceData: Partial<IAttendanceForm>): Promise<IAttendanceRecordApiResponse> => {
  try {
    console.log('Updating attendance record with data:', attendanceData); // Debug log
    const response = await fetch(`${API_BASE_URL}/attendance/attendance/${id}/`, {
      method: 'PUT',
      headers: {
        ...getAuthHeaders(),
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify(attendanceData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Attendance update response:', data); // Debug log
    return data;
  } catch (error) {
    console.error('Error updating attendance record:', error);
    throw error;
  }
};

// Delete an attendance record
export const deleteAttendance = async (id: number): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/attendance/attendance/${id}/`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeaders(),
        "ngrok-skip-browser-warning": "true",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error deleting attendance record:', error);
    throw error;
  }
};

// // Fetch today's check-ins report
// export const fetchTodaysCheckIns = async (): Promise<ITodaysCheckInsReport> => {
//   try {
//     const response = await fetch(`${API_BASE_URL}/attendance/attendance/today-checkins/`, {
//       method: 'GET',
//       headers: {
//         ...getAuthHeaders(),
//         "ngrok-skip-browser-warning": "true",
//       },
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.error('Error fetching today\'s check-ins report:', error);
//     throw error;
//   }
// };

// Check-in API
export const checkIn = async (): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/attendance/attendance/check-in/`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        "ngrok-skip-browser-warning": "true",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking in:', error);
    throw error;
  }
};

// Check-out API
export const checkOut = async (): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/attendance/attendance/check-out/`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        "ngrok-skip-browser-warning": "true",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking out:', error);
    throw error;
  }
};