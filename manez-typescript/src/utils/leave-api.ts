// Leave API Service Functions

import {
  ILeaveApplicationsResponse,
  ILeaveApplicationAPI,
  ILeaveApplicationCreate,
  ILeaveApplicationUpdate,
  ILeaveApprovalRequest,
  ILeaveTypeAPI,
  ILeaveBalance,
} from "@/interface/leave.interface";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
    Authorization: `Bearer ${token}`,
  };
};

// Fetch all leave applications (with pagination)
export const fetchLeaveApplications = async (
  page: number = 1,
  pageSize: number = 10
): Promise<ILeaveApplicationsResponse> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/leave/leave-applications/?page=${page}&page_size=${pageSize}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData?.detail || "Failed to fetch leave applications"
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching leave applications:", error);
    throw error;
  }
};

// Fetch current user's leave applications
export const fetchMyLeaveApplications =
  async (): Promise<ILeaveApplicationAPI[]> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/leave/leave-applications/my-applications/`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData?.detail || "Failed to fetch your leave applications"
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching my leave applications:", error);
      throw error;
    }
  };

// Fetch team leave applications (for managers)
export const fetchTeamLeaveApplications =
  async (): Promise<ILeaveApplicationAPI[]> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/leave/leave-applications/team-applications/`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData?.detail || "Failed to fetch team leave applications"
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching team leave applications:", error);
      throw error;
    }
  };

// Get specific leave application
export const fetchLeaveApplicationById = async (
  id: number
): Promise<ILeaveApplicationAPI> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/leave/leave-applications/${id}/`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.detail || "Failed to fetch leave application");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching leave application:", error);
    throw error;
  }
};

// Create a new leave application
export const createLeaveApplication = async (
  data: ILeaveApplicationCreate
): Promise<ILeaveApplicationAPI> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/leave/leave-applications/`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData?.detail || "Failed to create leave application"
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating leave application:", error);
    throw error;
  }
};

// Update a leave application
export const updateLeaveApplication = async (
  id: number,
  data: ILeaveApplicationUpdate
): Promise<ILeaveApplicationAPI> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/leave/leave-applications/${id}/`,
      {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData?.detail || "Failed to update leave application"
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating leave application:", error);
    throw error;
  }
};

// Delete a leave application
export const deleteLeaveApplication = async (id: number): Promise<void> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/leave/leave-applications/${id}/`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData?.detail || "Failed to delete leave application"
      );
    }
  } catch (error) {
    console.error("Error deleting leave application:", error);
    throw error;
  }
};

// Manager approve leave application
export const managerApproveLeave = async (
  id: number,
  data?: ILeaveApprovalRequest
): Promise<ILeaveApplicationAPI> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/leave/leave-applications/${id}/manager-approve/`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data || {}),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.detail || "Failed to approve leave");
    }

    return await response.json();
  } catch (error) {
    console.error("Error approving leave:", error);
    throw error;
  }
};

// HR/Admin approve leave application
export const approveLeave = async (
  id: number,
  data?: ILeaveApprovalRequest
): Promise<ILeaveApplicationAPI> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/leave/leave-applications/${id}/approve/`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data || {}),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.detail || "Failed to approve leave");
    }

    return await response.json();
  } catch (error) {
    console.error("Error approving leave:", error);
    throw error;
  }
};

// Reject leave application
export const rejectLeave = async (
  id: number,
  data: ILeaveApprovalRequest
): Promise<ILeaveApplicationAPI> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/leave/leave-applications/${id}/reject/`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.detail || "Failed to reject leave");
    }

    return await response.json();
  } catch (error) {
    console.error("Error rejecting leave:", error);
    throw error;
  }
};

// Fetch leave types
export const fetchLeaveTypes = async (): Promise<ILeaveTypeAPI[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/leave/leave-types/`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.detail || "Failed to fetch leave types");
    }

    const data = await response.json();
    // Handle paginated response
    return data?.results || (Array.isArray(data) ? data : []);
  } catch (error) {
    console.error("Error fetching leave types:", error);
    throw error;
  }
};

// Fetch leave balances
export const fetchMyLeaveBalances = async (): Promise<ILeaveBalance[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/leave/leave-balances/my-balances/`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.detail || "Failed to fetch leave balances");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching leave balances:", error);
    throw error;
  }
};
