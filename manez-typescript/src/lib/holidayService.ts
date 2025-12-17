/**
 * Holiday Module API Service
 * Handles holiday CRUD operations
 */

// Type declaration for process.env in browser environment
declare const process: {
  env: {
    NEXT_PUBLIC_API_BASE_URL?: string;
  };
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const getAuthHeaders = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  if (!token) {
    throw new Error("Unauthorized! Please login again.");
  }

  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
    "ngrok-skip-browser-warning": "true",
  };
};

const throwIfNotOk = async (response: Response, fallback = "Request failed") => {
  if (response.ok) return;
  try {
    const err = await response.json();
    throw new Error(err?.message || fallback);
  } catch (_) {
    throw new Error(fallback);
  }
};

// Get all holidays
export const getHolidays = async () => {
  const response = await fetch(`${API_BASE_URL}/holidays/holidays/`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  await throwIfNotOk(response, "Failed to fetch holidays");
  return response.json();
};

// Create a new holiday
export const createHoliday = async (holidayData: any) => {
  const response = await fetch(`${API_BASE_URL}/holidays/holidays/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(holidayData),
  });
  await throwIfNotOk(response, "Failed to create holiday");
  return response.json();
};

// Update an existing holiday
export const updateHoliday = async (id: number, holidayData: any) => {
  const response = await fetch(`${API_BASE_URL}/holidays/holidays/${id}/`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(holidayData),
  });
  await throwIfNotOk(response, "Failed to update holiday");
  return response.json();
};

// Delete a holiday
export const deleteHoliday = async (id: number) => {
  const response = await fetch(`${API_BASE_URL}/holidays/holidays/${id}/`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  await throwIfNotOk(response, "Failed to delete holiday");
  return response.ok;
};