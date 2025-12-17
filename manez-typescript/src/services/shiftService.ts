import { IShift, IShiftForm } from "@/interface/table.interface";

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

// Fetch all shifts
export const fetchShifts = async (): Promise<IShift[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/attendance/shifts/`, {
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
    
    // Ensure we return an array
    if (Array.isArray(data)) {
      return data;
    } else if (data && typeof data === 'object' && data.results && Array.isArray(data.results)) {
      // If it's a paginated response, return the results array
      return data.results;
    } else {
      // If it's not an array, return an empty array
      console.warn('Shift API did not return an array:', data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching shifts:', error);
    throw error;
  }
};

// Create a new shift
export const createShift = async (shiftData: IShiftForm): Promise<IShift> => {
  try {
    const response = await fetch(`${API_BASE_URL}/attendance/shifts/`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify(shiftData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating shift:', error);
    throw error;
  }
};

// Update an existing shift
export const updateShift = async (id: number, shiftData: Partial<IShiftForm>): Promise<IShift> => {
  try {
    const response = await fetch(`${API_BASE_URL}/attendance/shifts/${id}/`, {
      method: 'PUT',
      headers: {
        ...getAuthHeaders(),
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify(shiftData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating shift:', error);
    throw error;
  }
};

// Delete a shift
export const deleteShift = async (id: number): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/attendance/shifts/${id}/`, {
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
    console.error('Error deleting shift:', error);
    throw error;
  }
};

// Get a specific shift
export const getShiftById = async (id: number): Promise<IShift> => {
  try {
    const response = await fetch(`${API_BASE_URL}/attendance/shifts/${id}/`, {
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
    return data;
  } catch (error) {
    console.error('Error fetching shift:', error);
    throw error;
  }
};