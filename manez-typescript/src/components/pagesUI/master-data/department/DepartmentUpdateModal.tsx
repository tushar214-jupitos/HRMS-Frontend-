import React from "react";
import { Dialog, DialogTitle, DialogContent } from "@mui/material";
import InputField from "@/components/elements/SharedInputs/InputField";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { IDepartment } from "@/data/master-data/departmentData";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
interface UpdateModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  editData: IDepartment;
}

const DepartmentUpdateModal = ({
  open,
  setOpen,
  editData,
}: UpdateModalProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IDepartment>({
    defaultValues: editData,
  });
  const handleToggle = () => setOpen(!open);

  //handle submit form
  const onSubmit = async (data: IDepartment) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast.error("Unauthorized! Please login again.");
        return;
      }

      const res = await fetch(
        `${API_BASE_URL}/master/departments/${data.id}/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({
            name: data.name,
            description: data.description,
          }),
        }
      );

      if (!res.ok) {
        toast.error("Failed to update department. Please try again.");
        return;
      }

      toast.success("Department updated successfully! 🎉");
      setOpen(false);
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        "Failed to update department. Please try again.";
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open={open} onClose={handleToggle} maxWidth="sm" fullWidth>
      <DialogTitle>Update Department</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <InputField
            label="Department Name"
            id="name"
            type="text"
            register={register("name", {
              required: "Department name is required",
            })}
            error={errors.name}
          />
          <InputField
            label="Description"
            id="description"
            type="text"
            register={register("description")}
            error={errors.description}
          />
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={handleToggle}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Update
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
export default DepartmentUpdateModal;
