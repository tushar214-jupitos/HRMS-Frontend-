"use client";
import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { IShift } from "@/interface/table.interface";
import { fetchShifts, deleteShift } from "@/services/shiftService";
import { toast } from "sonner";
import AddShiftModal from "./AddShiftModal";
import EditShiftModal from "./EditShiftModal";

const ShiftManagementTable = () => {
  const [shifts, setShifts] = useState<IShift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedShift, setSelectedShift] = useState<IShift | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const loadShifts = async () => {
    try {
      setLoading(true);
      const data = await fetchShifts();
      setShifts(data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch shifts:", err);
      setError("Failed to load shifts. Please try again later.");
      toast.error("Failed to load shifts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShifts();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this shift?")) {
      try {
        await deleteShift(id);
        toast.success("Shift deleted successfully");
        loadShifts(); // Reload the shifts
      } catch (err) {
        console.error("Failed to delete shift:", err);
        toast.error("Failed to delete shift");
      }
    }
  };

  const handleEdit = (shift: IShift) => {
    setSelectedShift(shift);
    setIsEditModalOpen(true);
  };

  const handleAddSuccess = () => {
    loadShifts();
    toast.success("Shift added successfully");
  };

  const handleEditSuccess = () => {
    loadShifts();
    toast.success("Shift updated successfully");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500 text-center">
          <p>{error}</p>
          <button 
            onClick={loadShifts}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="col-span-12">
      <div className="card__wrapper">
        <div className="flex justify-between items-center mb-4">
          <h3 className="card__heading-title">Shift Management</h3>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn btn-primary"
          >
            Add New Shift
          </button>
        </div>
        
        <div className="manaz-common-mat-list mat-list-without-checkbox w-full table__wrapper">
          <Box sx={{ width: "100%" }}>
            <Paper sx={{ width: "100%", mb: 2 }}>
              <TableContainer>
                <Table className="whitespace-nowrap">
                  <TableHead>
                    <TableRow className="table__title">
                      <TableCell className="table_head_custom">Name</TableCell>
                      <TableCell className="table_head_custom">Start Time</TableCell>
                      <TableCell className="table_head_custom">End Time</TableCell>
                      <TableCell className="table_head_custom">Grace Period (min)</TableCell>
                      <TableCell className="table_head_custom">Half Day Threshold (hrs)</TableCell>
                      <TableCell className="table_head_custom">Standard Hours</TableCell>
                      <TableCell className="table_head_custom">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody className="table__body">
                    {shifts.map((shift) => (
                      <TableRow key={shift.id}>
                        <TableCell>{shift.name}</TableCell>
                        <TableCell>{shift.start_time}</TableCell>
                        <TableCell>{shift.end_time}</TableCell>
                        <TableCell>{shift.grace_period_minutes}</TableCell>
                        <TableCell>{shift.half_day_threshold_hours}</TableCell>
                        <TableCell>{shift.standard_hours}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(shift)}
                              className="btn btn-outline-primary btn-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(shift.id)}
                              className="btn btn-outline-danger btn-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>
        </div>
      </div>
      
      <AddShiftModal 
        open={isAddModalOpen} 
        setOpen={setIsAddModalOpen}
        onSuccess={handleAddSuccess}
      />
      
      {selectedShift && (
        <EditShiftModal 
          open={isEditModalOpen} 
          setOpen={setIsEditModalOpen}
          shift={selectedShift}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
};

export default ShiftManagementTable;