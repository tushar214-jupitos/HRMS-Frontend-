"use client";
import React, { useState } from "react";
import AddNewEmployeeModal from "./AddNewEmployeeModal";
import {
  FormControl,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import { employeeDesignationData } from "@/data/dropdown-data";

const EmployeeFilter = () => {
  const [selectedOptions, setSelectedOptions] = useState<string>("");
  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    setSelectedOptions(event.target.value);
  };
  return (
    <>
      <div className="grid grid-cols-12 gap-x-5 maxXs:gap-x-0 mb-[20px]">
        {/* Filter fields commented out */}
      </div>
    </>
  );
};

export default EmployeeFilter;
