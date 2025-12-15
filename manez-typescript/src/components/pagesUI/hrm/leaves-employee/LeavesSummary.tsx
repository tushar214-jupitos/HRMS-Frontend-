import React, { useState, useEffect } from "react";
import SummarySingleCard from "@/components/common/SummarySingleCard";
import { fetchLeaveApplications } from "@/utils/leave-api";

interface LeavesSummaryProps {
  refreshTrigger?: number;
}

const LeavesSummary: React.FC<LeavesSummaryProps> = ({ refreshTrigger }) => {
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    rejected: 0,
    pending: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      setIsLoading(true);
      try {
        const response = await fetchLeaveApplications(1, 1000); // Fetch all to calculate stats
        const applications = response.results;

        const approved = applications.filter(
          (app) =>
            app.status === "approved" || app.status === "manager_approved"
        ).length;
        const rejected = applications.filter(
          (app) => app.status === "rejected" || app.status === "lop"
        ).length;
        const pending = applications.filter(
          (app) => app.status === "pending"
        ).length;

        setStats({
          total: applications.length,
          approved,
          rejected,
          pending,
        });
      } catch (error) {
        console.error("Error loading leave statistics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, [refreshTrigger]);

  const leaveData = [
    {
      iconClass: "fa-light fa-ban",
      title: "Total Leave",
      value: isLoading ? "..." : stats.total.toString(),
      description: "",
      percentageChange: "",
      isIncrease: true,
    },
    {
      iconClass: "fa-light fa-badge-check",
      title: "Approve",
      value: isLoading ? "..." : stats.approved.toString(),
      description: "",
      percentageChange: "",
      isIncrease: false,
    },
    {
      iconClass: "fa-sharp fa-regular fa-user",
      title: "Rejected",
      value: isLoading ? "..." : stats.rejected.toString(),
      description: "",
      percentageChange: "",
      isIncrease: false,
    },
    {
      iconClass: "fa-sharp fa-regular fa-house-person-leave",
      title: "Pending",
      value: isLoading ? "..." : stats.pending.toString(),
      description: "",
      percentageChange: "",
      isIncrease: true,
    },
  ];

  return (
    <>
      {leaveData.map((item, index) => (
        <div className="col-span-12 sm:col-span-6 xxl:col-span-3" key={index}>
          <SummarySingleCard {...item} />
        </div>
      ))}
    </>
  );
};

export default LeavesSummary;
