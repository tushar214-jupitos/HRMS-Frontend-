import Wrapper from "@/components/layouts/DefaultWrapper";
import EmploymentTypeMainArea from "@/components/pagesUI/master-data/employment-type/EmploymentTypeMainArea";
import MetaData from "@/hooks/useMetaData";
import React from "react";

const page = () => {
  return (
    <>
      <MetaData pageTitle="Employment Type">
        <Wrapper>
          <EmploymentTypeMainArea />
        </Wrapper>
      </MetaData>
    </>
  );
};

export default page;
