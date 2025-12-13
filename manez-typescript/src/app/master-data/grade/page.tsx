import Wrapper from "@/components/layouts/DefaultWrapper";
import GradeMainArea from "@/components/pagesUI/master-data/grade/GradeMainArea";
import MetaData from "@/hooks/useMetaData";
import React from "react";

const page = () => {
  return (
    <>
      <MetaData pageTitle="Grade">
        <Wrapper>
          <GradeMainArea />
        </Wrapper>
      </MetaData>
    </>
  );
};

export default page;
