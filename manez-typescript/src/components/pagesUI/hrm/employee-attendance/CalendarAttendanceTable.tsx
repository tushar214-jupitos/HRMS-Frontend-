"use client"

import React, { useState, useEffect } from "react";
import { IAttendanceTableRecord } from "@/interface/attendance.interface";
import { fetchAttendance } from "@/services/attendanceService";
import { mapAttendanceRecordsToTableRecords } from "@/services/attendanceMappingService";
import { useAttendanceHook } from "@/hooks/use-condition-class";
import { FaChevronLeft, FaChevronRight, FaCircle } from "react-icons/fa";

interface CalendarDay {
  date: Date;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  attendanceStatus?: string;
  hoursWorked?: number;
}

const CalendarAttendanceTable = ({ refreshTrigger = 0 }: { refreshTrigger?: number }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState<IAttendanceTableRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch attendance data
  useEffect(() => {
    const loadAttendanceData = async () => {
      try {
        setLoading(true);
        const rawData = await fetchAttendance();
        console.log('Calendar view raw data:', rawData); // Debug log
        const transformedData = mapAttendanceRecordsToTableRecords(rawData);
        console.log('Calendar view transformed data:', transformedData); // Debug log
        setAttendanceData(transformedData);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch attendance data:", err);
        setError("Failed to load attendance data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadAttendanceData();
  }, [refreshTrigger]);

  // Generate calendar days
  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    // First day of calendar grid (Sunday of the week containing the 1st)
    const startDay = new Date(firstDay);
    startDay.setDate(firstDay.getDate() - firstDay.getDay());
    // Last day of calendar grid (Saturday of the week containing the last day)
    const endDay = new Date(lastDay);
    endDay.setDate(lastDay.getDate() + (6 - lastDay.getDay()));
    
    const days: CalendarDay[] = [];
    const currentDay = new Date(startDay);
    
    while (currentDay <= endDay) {
      const isCurrentMonth = currentDay.getMonth() === month;
      // Format date to match API format (YYYY-MM-DD) without timezone conversion
      const dateString = `${currentDay.getFullYear()}-${String(currentDay.getMonth() + 1).padStart(2, '0')}-${String(currentDay.getDate()).padStart(2, '0')}`;
      
      // Find attendance record for this date
      const attendanceRecord = attendanceData.find(record => record.date === dateString);
      
      days.push({
        date: new Date(currentDay),
        dayOfMonth: currentDay.getDate(),
        isCurrentMonth,
        attendanceStatus: attendanceRecord?.status,
        hoursWorked: attendanceRecord?.hoursWorked
      });
      
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();
  
  // Get month name
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  
  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };
  
  const goToNextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };
  
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Weekday headers
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Get status class for styling
  const getStatusClass = (status?: string) => {
    if (!status) return '';
    
    switch (status.toLowerCase()) {
      case 'present':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'absent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'late':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'half day':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'holiday':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'day off':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get status icon
  const getStatusIcon = (status?: string) => {
    if (!status) return null;
    
    switch (status.toLowerCase()) {
      case 'present':
        return <FaCircle className="text-green-500 text-xs" />;
      case 'absent':
        return <FaCircle className="text-red-500 text-xs" />;
      case 'late':
        return <FaCircle className="text-yellow-500 text-xs" />;
      case 'half day':
        return <FaCircle className="text-blue-500 text-xs" />;
      case 'holiday':
        return <FaCircle className="text-purple-500 text-xs" />;
      case 'day off':
        return <FaCircle className="text-indigo-500 text-xs" />;
      default:
        return <FaCircle className="text-gray-500 text-xs" />;
    }
  };

  // Format hours worked
  const formatHours = (hours?: number) => {
    if (hours === undefined || hours === null) return '';
    return `${hours.toFixed(1)}h`;
  };

  // Get day class for styling
  const getDayClass = (status?: string) => {
    if (!status) return '';
    
    switch (status.toLowerCase()) {
      case 'present':
        return 'border-l-4 border-l-green-500';
      case 'absent':
        return 'border-l-4 border-l-red-500';
      case 'late':
        return 'border-l-4 border-l-yellow-500';
      case 'half day':
        return 'border-l-4 border-l-blue-500';
      case 'holiday':
        return 'border-l-4 border-l-purple-500';
      case 'day off':
        return 'border-l-4 border-l-indigo-500';
      default:
        return '';
    }
  };

  // Get summary statistics
  const getSummaryStats = () => {
    const stats = {
      present: 0,
      absent: 0,
      late: 0,
      halfDay: 0,
      holiday: 0,
      dayOff: 0,
      totalHours: 0
    };
    
    calendarDays
      .filter(day => day.isCurrentMonth && day.attendanceStatus)
      .forEach(day => {
        if (day.attendanceStatus) {
          switch (day.attendanceStatus.toLowerCase()) {
            case 'present':
              stats.present++;
              break;
            case 'absent':
              stats.absent++;
              break;
            case 'late':
              stats.late++;
              break;
            case 'half day':
              stats.halfDay++;
              break;
            case 'holiday':
              stats.holiday++;
              break;
            case 'day off':
              stats.dayOff++;
              break;
          }
        }
        
        if (day.hoursWorked) {
          stats.totalHours += day.hoursWorked;
        }
      });
    
    return stats;
  };

  const summaryStats = getSummaryStats();

  if (loading) {
    return (
      <div className="col-span-12">
        <div className="card__wrapper">
          <div className="flex justify-center items-center h-64">
            <p>Loading attendance calendar...</p>
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

  return (
    <>
      <div className="col-span-12">
        <div className="card__wrapper">
          <div className="manaz-common-mat-list mat-list-without-checkbox w-full table__wrapper">
            {/* Calendar Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h5 className="card__heading-title text-xl font-semibold">Attendance Calendar</h5>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track your attendance records in a visual calendar format</p>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={goToPreviousMonth}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-600"
                  aria-label="Previous month"
                >
                  <FaChevronLeft />
                </button>
                <button 
                  onClick={goToToday}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
                >
                  Today
                </button>
                <button 
                  onClick={goToNextMonth}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-600"
                  aria-label="Next month"
                >
                  <FaChevronRight />
                </button>
                <h2 className="text-lg font-bold ml-2">{monthName}</h2>
              </div>
            </div>
            
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 mb-6">
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-100 dark:border-green-900/30">
                <div className="text-green-800 dark:text-green-200 text-sm font-medium">Present</div>
                <div className="text-green-900 dark:text-green-100 text-xl font-bold">{summaryStats.present}</div>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-900/30">
                <div className="text-red-800 dark:text-red-200 text-sm font-medium">Absent</div>
                <div className="text-red-900 dark:text-red-100 text-xl font-bold">{summaryStats.absent}</div>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-100 dark:border-yellow-900/30">
                <div className="text-yellow-800 dark:text-yellow-200 text-sm font-medium">Late</div>
                <div className="text-yellow-900 dark:text-yellow-100 text-xl font-bold">{summaryStats.late}</div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-900/30">
                <div className="text-blue-800 dark:text-blue-200 text-sm font-medium">Half Day</div>
                <div className="text-blue-900 dark:text-blue-100 text-xl font-bold">{summaryStats.halfDay}</div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-100 dark:border-purple-900/30">
                <div className="text-purple-800 dark:text-purple-200 text-sm font-medium">Holiday</div>
                <div className="text-purple-900 dark:text-purple-100 text-xl font-bold">{summaryStats.holiday}</div>
              </div>
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
                <div className="text-indigo-800 dark:text-indigo-200 text-sm font-medium">Day Off</div>
                <div className="text-indigo-900 dark:text-indigo-100 text-xl font-bold">{summaryStats.dayOff}</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-100 dark:border-gray-600">
                <div className="text-gray-800 dark:text-gray-200 text-sm font-medium">Total Hours</div>
                <div className="text-gray-900 dark:text-gray-100 text-xl font-bold">{summaryStats.totalHours.toFixed(1)}</div>
              </div>
            </div>
            
            {/* Calendar Grid */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden border border-gray-200 dark:border-gray-700">
              {/* Weekday Headers */}
              <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-700">
                {weekdays.map(day => (
                  <div 
                    key={day} 
                    className="py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider"
                  >
                    {day.substring(0, 3)}
                  </div>
                ))}
              </div>
              
              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700">
                {calendarDays.map((day, index) => {
                  const isToday = day.date.toDateString() === new Date().toDateString();
                  
                  return (
                    <div 
                      key={index}
                      className={`min-h-32 bg-white dark:bg-gray-800 p-2 ${getDayClass(day.attendanceStatus)} ${
                        !day.isCurrentMonth 
                          ? 'text-gray-400 dark:text-gray-500' 
                          : 'text-gray-900 dark:text-white'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className={`inline-flex items-center justify-center w-7 h-7 text-sm rounded-full ${
                          isToday
                            ? 'bg-primary text-white'
                            : ''
                        }`}>
                          {day.dayOfMonth}
                        </span>
                        {day.attendanceStatus && (
                          <span className="text-xs">
                            {getStatusIcon(day.attendanceStatus)}
                          </span>
                        )}
                      </div>
                      
                      {day.attendanceStatus && (
                        <div className="mt-2">
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full border ${getStatusClass(day.attendanceStatus)}`}>
                            {day.attendanceStatus}
                          </span>
                          {day.hoursWorked !== undefined && day.hoursWorked > 0 && (
                            <div className="text-xs mt-1 text-gray-500 dark:text-gray-400 flex items-center">
                              <span>{formatHours(day.hoursWorked)}</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {!day.attendanceStatus && day.isCurrentMonth && (
                        <div className="mt-2 text-xs text-gray-400 italic">
                          No data
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Legend */}
            <div className="mt-6">
              <h6 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Legend</h6>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Present</span>
                </div>
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Absent</span>
                </div>
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Late</span>
                </div>
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Half Day</span>
                </div>
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Holiday</span>
                </div>
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-indigo-500 rounded-full mr-2"></span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Day Off</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CalendarAttendanceTable;