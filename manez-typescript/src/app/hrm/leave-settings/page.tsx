import Wrapper from "@/components/layouts/DefaultWrapper";
import LeaveSettingsMainArea from "@/components/pagesUI/hrm/leave-settings/LeaveSettingsMainArea";
import MetaData from "@/hooks/useMetaData";
import React from "react";

const page = () => {
  return (
    <>
      <MetaData pageTitle="Leave Settings">
        <Wrapper>
          <LeaveSettingsMainArea />
        </Wrapper>
      </MetaData>
    </>
  );
};

export default page;
