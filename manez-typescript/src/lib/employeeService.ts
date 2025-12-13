/**
 * Employee Module API Service
 * Handles employee CRUD and user linking
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    throw new Error("Unauthorized! Please login again.");
  }
  
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
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

export const linkUserToEmployee = async (
  employeeId: string | number,
  userId: string | number
) => {
  const response = await fetch(`${API_BASE_URL}/employee/${employeeId}/link-user/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ user_id: userId }),
  });
  await throwIfNotOk(response, "Failed to link user to employee");
  return response.json();
};

export const unlinkUserFromEmployee = async (employeeId: string | number) => {
  const response = await fetch(`${API_BASE_URL}/employee/${employeeId}/unlink-user/`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  await throwIfNotOk(response, "Failed to unlink user from employee");
  return response.json();
};

export const getUserEmails = async () => {
  const response = await fetch(`${API_BASE_URL}/dropdowns/user/emails/`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  await throwIfNotOk(response, "Failed to fetch user emails");
  return response.json();
};
