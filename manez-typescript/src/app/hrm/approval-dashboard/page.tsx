import Wrapper from "@/components/layouts/DefaultWrapper";
import LeavesApprovalDashboard from "@/components/pagesUI/hrm/leaves-approval/leavesApprovalDashboard";
import MetaData from "@/hooks/useMetaData";
import React from "react";

const page = () => {
  return (
    <>
      <MetaData pageTitle="Employee">
        <Wrapper>
          <LeavesApprovalDashboard />
        </Wrapper>
      </MetaData>
    </>
  );
};

export default page;
