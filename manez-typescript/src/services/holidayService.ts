import { IHoliday } from "@/interface/table.interface";

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

// Fetch all holidays
export const fetchHolidays = async (): Promise<IHoliday[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/holidays/holidays/`, {
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
    // console.log('Holiday API response:', data); // Debug log
    
    // Ensure we return an array
    if (Array.isArray(data)) {
      return data;
    } else if (data && typeof data === 'object' && data.results && Array.isArray(data.results)) {
      // If it's a paginated response, return the results array
      return data.results;
    } else {
      // If it's not an array, return an empty array
      console.warn('Holiday API did not return an array:', data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching holidays:', error);
    throw error;
  }
};

// Create a new holiday
export const createHoliday = async (holiday: Omit<IHoliday, 'id'>): Promise<IHoliday> => {
  try {
    console.log('Creating holiday with data:', holiday); // Debug log
    const response = await fetch(`${API_BASE_URL}/holidays/holidays/`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify(holiday)
    });

    if (!response.ok) {
      // Try to get error details from response
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = `HTTP error! status: ${response.status}, message: ${JSON.stringify(errorData)}`;
      } catch (e) {
        // If we can't parse the error response, use the status text
        errorMessage = `HTTP error! status: ${response.status}, statusText: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating holiday:', error);
    throw error;
  }
};

// Update an existing holiday
export const updateHoliday = async (id: number, holiday: Partial<IHoliday>): Promise<IHoliday> => {
  try {
    console.log('Updating holiday with data:', holiday); // Debug log
    const response = await fetch(`${API_BASE_URL}/holidays/holidays/${id}/`, {
      method: 'PUT',
      headers: {
        ...getAuthHeaders(),
        "ngrok-skip-browser-warning": "true",
      }, 
      body: JSON.stringify(holiday)
    });

    if (!response.ok) {
      // Try to get error details from response
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = `HTTP error! status: ${response.status}, message: ${JSON.stringify(errorData)}`;
      } catch (e) {
        // If we can't parse the error response, use the status text
        errorMessage = `HTTP error! status: ${response.status}, statusText: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating holiday:', error);
    throw error;
  }
};

// Delete a holiday
export const deleteHoliday = async (id: number): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/holidays/holidays/${id}/`, {
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
    console.error('Error deleting holiday:', error);
    throw error;
  }
};