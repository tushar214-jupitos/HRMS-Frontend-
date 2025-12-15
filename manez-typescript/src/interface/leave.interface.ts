// Leave Module API Response Interfaces

export interface ILeaveEmployee {
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

export interface ILeaveTypeAPI {
  id: number;
  name: string;
  code: string;
  description: string;
  max_leaves_per_year: string;
  carry_forward_allowed: boolean;
  is_encashable: boolean;
  gender_restriction: "all" | "male" | "female";
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ILeaveApplicationAPI {
  id: number;
  employee: ILeaveEmployee;
  leave_type: ILeaveTypeAPI;
  backup_person: ILeaveEmployee | null;
  approved_by: ILeaveEmployee | null;
  start_date: string;
  end_date: string;
  leave_days: string;
  half_day: boolean;
  reason: string;
  status: "pending" | "manager_approved" | "approved" | "rejected" | "lop";
  remarks: string | null;
  created_at: string;
  updated_at: string;
}

export interface ILeaveApplicationsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ILeaveApplicationAPI[];
}

export interface ILeaveBalance {
  id: number;
  employee: ILeaveEmployee;
  leave_type: ILeaveTypeAPI;
  balance: string;
  year: number;
  created_at: string;
  updated_at: string;
}

export interface ILeaveApplicationCreate {
  leave_type: number;
  start_date: string;
  end_date: string;
  half_day?: boolean;
  reason: string;
  backup_person?: number;
}

export interface ILeaveApplicationUpdate {
  leave_type?: number;
  start_date?: string;
  end_date?: string;
  half_day?: boolean;
  reason?: string;
  backup_person?: number;
}

export interface ILeaveApprovalRequest {
  remarks?: string;
}
