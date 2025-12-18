"use client";

import { useEffect, useMemo, useState } from "react";
import Breadcrumb from "@/common/Breadcrumb/breadcrumb";
import {
  fetchTeamLeaveApplications,
  managerApproveLeave,
  rejectLeave,
} from "@/utils/leave-api";
import { ILeaveApplicationAPI } from "@/interface/leave.interface";

export default function ApprovalDashboardPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [requests, setRequests] = useState<ILeaveApplicationAPI[]>([]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchTeamLeaveApplications();
        if (!active) return;

        // Handle both direct array and paginated response formats
        let applications: ILeaveApplicationAPI[] = [];
        if (Array.isArray(data)) {
          applications = data;
        } else if (
          data &&
          typeof data === "object" &&
          "results" in data &&
          Array.isArray((data as any).results)
        ) {
          applications = (data as any).results;
        }

        setRequests(applications.filter((r) => r.status === "pending"));
      } catch (e: any) {
        if (!active) return;
        setError(e?.message || "Failed to load pending requests");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const pendingCount = useMemo(() => requests.length, [requests]);

  const handleApprove = async (id: number) => {
    const remarks = window.prompt(
      "Add remarks (optional)",
      "Approved via dashboard"
    );
    try {
      await managerApproveLeave(id, remarks ? { remarks } : {});
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (e: any) {
      alert(e?.message || "Failed to approve leave");
    }
  };

  const handleReject = async (id: number) => {
    const remarks = window.prompt(
      "Reason for rejection",
      "Cannot approve at this time"
    );
    if (!remarks) return;
    try {
      await rejectLeave(id, { remarks });
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (e: any) {
      alert(e?.message || "Failed to reject leave");
    }
  };

  return (
    <div className="p-6">
      <Breadcrumb breadTitle="Leave Approval" subTitle="Home" />
      <h1 className="text-2xl font-semibold mb-6">Leave Approval</h1>

      <div className="bg-white dark:bg-gray-900 shadow-sm rounded-lg overflow-hidden border border-gray-100 dark:border-gray-800">
        <div className="px-4 sm:px-6 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-lg font-medium">
            Pending Requests {pendingCount ? `(${pendingCount})` : ""}
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th
                  scope="col"
                  className="px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                >
                  Employee
                </th>
                <th
                  scope="col"
                  className="px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                >
                  Leave Type
                </th>
                <th
                  scope="col"
                  className="px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                >
                  From
                </th>
                <th
                  scope="col"
                  className="px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                >
                  To
                </th>
                <th
                  scope="col"
                  className="px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                >
                  Days
                </th>
                <th
                  scope="col"
                  className="px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                >
                  Reason
                </th>
                <th
                  scope="col"
                  className="px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                >
                  Backup Person
                </th>
                <th
                  scope="col"
                  className="px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 sm:px-6 py-8 text-center text-gray-500"
                  >
                    Loading pending requests...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 sm:px-6 py-8 text-center text-red-500"
                  >
                    {error}
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 sm:px-6 py-8 text-center text-gray-500"
                  >
                    No pending requests
                  </td>
                </tr>
              ) : (
                requests.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                  >
                    <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                      {r.employee?.full_name ||
                        `${r.employee?.first_name || ""} ${
                          r.employee?.last_name || ""
                        }`}
                    </td>
                    <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                      {r.leave_type?.name} ({r.leave_type?.code})
                    </td>
                    <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                      {new Date(r.start_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                      {new Date(r.end_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                      {r.leave_days}
                    </td>
                    <td className="px-4 sm:px-6 py-3">{r.reason}</td>
                    <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                      {r.backup_person ? (
                        <div className="text-sm">
                          <div className="font-medium">
                            {r.backup_person.full_name ||
                              `${r.backup_person.first_name || ""} ${
                                r.backup_person.last_name || ""
                              }`}
                          </div>
                          <div className="text-gray-500 dark:text-gray-400">
                            {r.backup_person.designation}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleApprove(r.id)}
                          aria-label="Approve"
                          className="inline-flex items-center justify-center h-9 w-9 rounded-md bg-green-50 text-green-600 hover:bg-green-100 border border-green-100"
                          title="Approve"
                        >
                          <span role="img" aria-hidden>
                            ✅
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReject(r.id)}
                          aria-label="Reject"
                          className="inline-flex items-center justify-center h-9 w-9 rounded-md bg-red-50 text-red-600 hover:bg-red-100 border border-red-100"
                          title="Reject"
                        >
                          <span role="img" aria-hidden>
                            ❌
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
