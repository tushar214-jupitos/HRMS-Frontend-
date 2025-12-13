import Wrapper from "@/components/layouts/DefaultWrapper";
import DesignationMainArea from "@/components/pagesUI/master-data/designation/DesignationMainArea";
import MetaData from "@/hooks/useMetaData";
import React from "react";

const page = () => {
  return (
    <>
      <MetaData pageTitle="Designation">
        <Wrapper>
          <DesignationMainArea />
        </Wrapper>
      </MetaData>
    </>
  );
};

export default page;
