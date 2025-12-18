"use client";

import Wrapper from "@/components/layouts/DefaultWrapper";
import EmployeeProfileMainArea from "@/components/pagesUI/hrm/employee-profile/EmployeeProfileMainArea";
import MetaData from "@/hooks/useMetaData";
import React, { useEffect, useState } from "react";

const Page = () => {
  const [resolvedId, setResolvedId] = useState<number | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;
    const derivedId = user?.employee_id ?? user?.id;
    const parsedId = Number(derivedId);
    setResolvedId(Number.isFinite(parsedId) ? parsedId : null);
  }, []);

  if (resolvedId === null) {
    return null;
  }

  return (
    <>
      <MetaData pageTitle="Employee Profile">
        <Wrapper>
          <EmployeeProfileMainArea id={resolvedId} />
        </Wrapper>
      </MetaData>
    </>
  );
};

export default Page;
