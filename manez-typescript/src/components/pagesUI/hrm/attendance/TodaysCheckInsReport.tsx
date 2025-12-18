"use client";
import React, { useEffect, useState } from "react";
import {  ITodaysCheckInsReport } from "@/services/attendanceService";
import { toast } from "sonner";

const TodaysCheckInsReport = () => {
  const [report, setReport] = useState<ITodaysCheckInsReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadReport = async () => {
      try {
        setLoading(true);
       // const data = await fetchTodaysCheckIns();
        //setReport(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch today's check-ins report:", err);
        setError("Failed to load today's check-ins report. Please try again later.");
        toast.error("Failed to load report. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, []);

  if (loading) {
    return (
      <div className="col-span-12">
        <div className="card__wrapper">
          <div className="flex justify-center items-center h-64">
            <p>Loading today's check-ins report...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="col-span-12">
        <div className="card__wrapper">
          <div className="flex justify-center items-center h-64">
            <p className="text-red-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="col-span-12">
        <div className="card__wrapper">
          <div className="flex justify-center items-center h-64">
            <p>No data available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="col-span-12">
        <div className="card__wrapper">
          <div className="card__title-wrap mb-5">
            <h3 className="card__heading-title">Today's Check-ins Report</h3>
            <p className="text-muted">Date: {report.date}</p>
          </div>
          
          <div className="grid grid-cols-12 gap-4 mb-6">
            <div className="col-span-12 sm:col-span-6 lg:col-span-4">
              <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg text-center">
                <h4 className="text-2xl font-bold text-blue-700 dark:text-blue-300">{report.total_employees}</h4>
                <p className="text-blue-600 dark:text-blue-400">Total Employees</p>
              </div>
            </div>
            
            <div className="col-span-12 sm:col-span-6 lg:col-span-4">
              <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg text-center">
                <h4 className="text-2xl font-bold text-green-700 dark:text-green-300">{report.checked_in}</h4>
                <p className="text-green-600 dark:text-green-400">Checked In</p>
              </div>
            </div>
            
            <div className="col-span-12 sm:col-span-6 lg:col-span-4">
              <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg text-center">
                <h4 className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {report.check_in_percentage.toFixed(1)}%
                </h4>
                <p className="text-purple-600 dark:text-purple-400">Check-in Rate</p>
              </div>
            </div>
          </div>
          
          <div className="table__wrapper">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Employee
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Check-in Time
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Check-out Time
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Shift
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {report.check_in_list.map((record) => (
                    <tr key={record.employee_id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {record.employee_name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {record.emp_id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {record.check_in_time ? new Date(record.check_in_time).toLocaleTimeString() : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {record.check_out_time ? new Date(record.check_out_time).toLocaleTimeString() : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${record.status === 'present' ? 'bg-green-100 text-green-800' : 
                            record.status === 'late' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-gray-100 text-gray-800'}`}>
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {record.shift_name}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TodaysCheckInsReport;