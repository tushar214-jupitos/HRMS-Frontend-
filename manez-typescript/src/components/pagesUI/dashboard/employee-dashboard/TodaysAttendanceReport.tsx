"use client";
import React, { useEffect, useState } from "react";
import { fetchTodaysCheckIns, ITodaysCheckInsReport } from "@/services/attendanceService";
import { toast } from "sonner";

const TodaysAttendanceReport = () => {
  const [report, setReport] = useState<ITodaysCheckInsReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadReport = async () => {
      try {
        setLoading(true);
        const data = await fetchTodaysCheckIns();
        setReport(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch today's attendance report:", err);
        setError("Failed to load today's attendance report. Please try again later.");
        toast.error("Failed to load report. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, []);

  if (loading) {
    return (
      <div className="card__wrapper">
        <div className="flex justify-center items-center h-48">
          <p>Loading today's attendance report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card__wrapper">
        <div className="flex justify-center items-center h-48">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="card__wrapper">
        <div className="flex justify-center items-center h-48">
          <p>No data available</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="card__wrapper">
        <div className="card__title-wrap mb-4">
          <h5 className="card__heading-title">Today's Attendance</h5>
        </div>
        
        <div className="grid grid-cols-12 gap-3 mb-4">
          <div className="col-span-6 sm:col-span-3">
            <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded-lg text-center">
              <h6 className="text-lg font-bold text-blue-700 dark:text-blue-300">{report.total_employees}</h6>
              <p className="text-xs text-blue-600 dark:text-blue-400">Total</p>
            </div>
          </div>
          
          <div className="col-span-6 sm:col-span-3">
            <div className="bg-green-50 dark:bg-green-900 p-3 rounded-lg text-center">
              <h6 className="text-lg font-bold text-green-700 dark:text-green-300">{report.checked_in}</h6>
              <p className="text-xs text-green-600 dark:text-green-400">Checked In</p>
            </div>
          </div>
          
          <div className="col-span-6 sm:col-span-3">
            <div className="bg-yellow-50 dark:bg-yellow-900 p-3 rounded-lg text-center">
              <h6 className="text-lg font-bold text-yellow-700 dark:text-yellow-300">{report.not_checked_in}</h6>
              <p className="text-xs text-yellow-600 dark:text-yellow-400">Not Checked</p>
            </div>
          </div>
          
          <div className="col-span-6 sm:col-span-3">
            <div className="bg-purple-50 dark:bg-purple-900 p-3 rounded-lg text-center">
              <h6 className="text-lg font-bold text-purple-700 dark:text-purple-300">
                {report.check_in_percentage.toFixed(0)}%
              </h6>
              <p className="text-xs text-purple-600 dark:text-purple-400">Rate</p>
            </div>
          </div>
        </div>
        
        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto max-h-60">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Employee
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Check-in
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {report.check_in_list.slice(0, 5).map((record) => (
                  <tr key={record.employee_id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {record.employee_name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {record.emp_id}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {record.check_in_time ? new Date(record.check_in_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "-"}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${record.status === 'present' ? 'bg-green-100 text-green-800' : 
                          record.status === 'late' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-gray-100 text-gray-800'}`}>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {report.check_in_list.length > 5 && (
          <div className="mt-3 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing 5 of {report.check_in_list.length} check-ins
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default TodaysAttendanceReport;