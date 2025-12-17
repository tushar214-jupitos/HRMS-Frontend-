"use client";
import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent } from "@mui/material";
import { holidayDates } from "@/data/dropdown-data";
import { IHoliday } from "@/interface/table.interface";
import { useForm } from "react-hook-form";
import InputField from "@/components/elements/SharedInputs/InputField";
import SelectBox from "@/components/elements/SharedInputs/SelectBox";
import FormLabel from "@/components/elements/SharedInputs/FormLabel";
import DatePicker from "react-datepicker";
import { statePropsType } from "@/interface/common.interface";
import { toast } from "sonner";
import { createHoliday } from "@/services/holidayService";

const AddNewHoliday = ({ open, setOpen }: statePropsType) => {
  const [selectHolidayDate, setSelectHolidayDate] = useState<Date | null>(
    new Date()
  );
  const { register, handleSubmit, control, formState: { errors }, reset } = useForm<IHoliday>();
  const handleToggle = () => setOpen(!open);

  //handle submit form
  const onSubmit = async (data: IHoliday) => {
    try {
      // Prepare holiday data
      const holidayData = {
        title: data.holidayName || "",
        date: selectHolidayDate ? selectHolidayDate.toISOString().split('T')[0] : "",
        holiday_type: "public", // Default type, can be made configurable
        is_optional: false, // Default value, can be made configurable
        description: data.holidayName || ""
      };

      // Call API to create holiday
      await createHoliday(holidayData);
      
      toast.success("Holiday added successfully!");
      
      // Reset form and close modal
      reset();
      setOpen(false);
    } catch (error: any) {
      // Show error toast message
      toast.error(
        error?.message || "An error occurred while adding the holiday. Please try again!"
      );
    }
  };

  return (
    <>
      <Dialog open={open} onClose={handleToggle} fullWidth maxWidth="sm" 
      sx={{
        "& .MuiDialog-paper": {
          width: "500px",
        },
      }}
      >
        <DialogTitle>
          <div className="flex justify-between">
            <h5 className="modal-title">New Holidays</h5>
            <button
              onClick={handleToggle}
              type="button"
              className="bd-btn-close"
            >
              <i className="fa-solid fa-xmark-large"></i>
            </button>
          </div>
        </DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="card__wrapper">
              <div className="grid grid-cols-12 items-center justify-center gap-y-6 gap-x-6 maxXs:gap-x-0">
                <div className="col-span-12">
                  <FormLabel label="Holiday Date" id="selectHolidayDate" />
                  <div className="datepicker-style">
                    <DatePicker
                      id="selectHolidayDate"
                      selected={selectHolidayDate}
                      onChange={(date) => setSelectHolidayDate(date)}
                      showYearDropdown
                      showMonthDropdown
                      useShortMonthInDropdown
                      showPopperArrow={false}
                      peekNextMonth
                      dropdownMode="select"
                      isClearable
                      dateFormat="dd/MM/yyyy"
                      placeholderText="Holiday date"
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="col-span-12">
                  <SelectBox
                    id="holidayDay"
                    label="Holiday Day"
                    options={holidayDates}
                    control={control} // Validation rule
                    error={errors.day}
                  />
                </div>

                <div className="col-span-12">
                  <InputField
                    label="Holiday Name"
                    id="holidayName"
                    isTextArea={true}
                    register={register("holidayName", {
                      required: "Holiday Name is required",
                    })}
                    error={errors.holidayName}
                  />
                </div>
              </div>
            </div>
            <div className="submit__btn text-center">
              <button type="submit" className="btn btn-primary">
                Submit
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddNewHoliday;