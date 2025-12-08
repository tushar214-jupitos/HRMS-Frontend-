import Wrapper from "@/components/layouts/DefaultWrapper";
import UserMainArea from "@/components/pagesUI/hrm/user/UserMainArea";
import MetaData from "@/hooks/useMetaData";
import React from "react";

const page = () => {
  return (
    <>
      <MetaData pageTitle="User">
        <Wrapper>
          <UserMainArea />
        </Wrapper>
      </MetaData>
    </>
  );
};

export default page;
