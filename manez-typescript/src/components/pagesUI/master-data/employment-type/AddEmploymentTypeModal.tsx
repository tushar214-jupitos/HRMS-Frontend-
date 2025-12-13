import React from "react";
import { Dialog, DialogTitle, DialogContent } from "@mui/material";
import InputField from "@/components/elements/SharedInputs/InputField";
import { useForm } from "react-hook-form";
import { statePropsType } from "@/interface/common.interface";
import { toast } from "sonner";
import { IEmploymentType } from "@/data/master-data/employmentTypeData";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type EmploymentTypeFormValues = Omit<IEmploymentType, "id">;

const AddEmploymentTypeModal = ({ open, setOpen }: statePropsType) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmploymentTypeFormValues>();

  const handleToggle = () => setOpen(!open);

  const onSubmit = async (data: EmploymentTypeFormValues) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast.error("Unauthorized! Please login again.");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/master/employment-types/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
        }),
      });

      if (!res.ok) {
        toast.error("Failed to add employment type. Please try again.");
        return;
      }

      toast.success("Employment type added successfully! 🎉");
      setOpen(false);
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        "Failed to add employment type. Please try again.";
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleToggle}
      fullWidth
      maxWidth="sm"
      sx={{ "& .MuiDialog-paper": { width: "500px" } }}
    >
      <DialogTitle>
        <div className="flex justify-between">
          <h5 className="modal-title">Add New Employment Type</h5>
          <button onClick={handleToggle} type="button" className="bd-btn-close">
            <i className="fa-solid fa-xmark-large"></i>
          </button>
        </div>
      </DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="card__wrapper">
            <div className="grid grid-cols-12 gap-y-3 gap-x-3">
              <div className="col-span-12">
                <InputField
                  label="Employment Type Name"
                  id="name"
                  type="text"
                  register={register("name", { required: "Name is required" })}
                  error={errors.name}
                />
              </div>
              <div className="col-span-12">
                <InputField
                  label="Description"
                  id="description"
                  type="text"
                  register={register("description")}
                  error={errors.description}
                />
              </div>
            </div>
          </div>
          <div className="submit__btn text-center">
            <button className="btn btn-primary" type="submit">
              Submit
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEmploymentTypeModal;
