"use client";
import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import Pagination from "@mui/material/Pagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Paper from "@mui/material/Paper";
import { visuallyHidden } from "@mui/utils";
import useMaterialTableHook from "@/hooks/useMaterialTableHook";
import HolidayUpdateModal from "./HolidayUpdateModal";
import { holidayHeadCells } from "@/data/table-head-cell/table-head";
import { IHoliday } from "@/interface/table.interface";
import DeleteModal from "@/components/common/DeleteModal";
import TableControls from "@/components/elements/SharedInputs/TableControls";
import { fetchHolidays, deleteHoliday } from "@/services/holidayService";
import { toast } from "sonner";

// Create a wrapper type that satisfies RowObject constraint
type HolidayRow = {
  id: number;
  date: string;
  day: string;
  holidayName: string;
  [key: string]: string | number | boolean;
};

const HolidayTable = () => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editData, setEditData] = useState<IHoliday | null>(null);
  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number>(0);
  const [holidays, setHolidays] = useState<HolidayRow[]>([]);
  const [fullHolidayData, setFullHolidayData] = useState<IHoliday[]>([]); // Store full holiday data
  const [loading, setLoading] = useState<boolean>(true);

  const {
    order,
    orderBy,
    selected,
    page,
    rowsPerPage,
    searchQuery,
    paginatedRows,
    filteredRows,
    handleRequestSort,
    handleClick,
    handleChangePage,
    handleChangeRowsPerPage,
    handleSearchChange,
    setRows, // Add this to update the rows in the hook
  } = useMaterialTableHook<HolidayRow>(holidays, 10);

  // Fetch holidays from API
  useEffect(() => {
    const loadHolidays = async () => {
      try {
        setLoading(true);
        const data = await fetchHolidays();
        
        // Store full holiday data and create display data
        const displayData: HolidayRow[] = data.map(holiday => ({
          id: holiday.id || Date.now() + Math.random(), // Generate a temporary ID if none exists
          date: holiday.date || "",
          day: holiday.date ? new Date(holiday.date).toLocaleDateString('en-US', { weekday: 'long' }) : "",
          holidayName: holiday.title || ""
        }));
        setHolidays(displayData);
        setRows(displayData); // Update the rows in the hook
        // Store the full data for editing
        setFullHolidayData(data);
      } catch (error) {
        toast.error("Failed to load holidays");
        console.error("Error fetching holidays:", error);
      } finally {
        setLoading(false);
      }
    };

    loadHolidays();
  }, []);

  // Handle delete
  const handleDelete = async (id: number) => {
    try {
      await deleteHoliday(id);
      setHolidays(prev => prev.filter(holiday => holiday.id !== id));
      toast.success("Holiday deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete holiday");
      console.error("Error deleting holiday:", error);
    }
  };

  if (loading) {
    return <div>Loading holidays...</div>;
  }

  return (
    <>
      <div className="card__wrapper">
        <div className="manaz-common-mat-list w-full table__wrapper table-responsive mat-list-without-checkbox">
          <TableControls
            rowsPerPage={rowsPerPage}
            searchQuery={searchQuery}
            handleChangeRowsPerPage={handleChangeRowsPerPage}
            handleSearchChange={handleSearchChange}
          />
          <Box sx={{ width: "100%" }} className="table-responsive">
            <Paper sx={{ width: "100%", mb: 2 }}>
              <TableContainer className="table mb-[20px] hover multiple_tables w-full">
                <Table
                  aria-labelledby="tableTitle"
                  className="whitespace-nowrap"
                >
                  <TableHead>
                    <TableRow className="table__title">
                      {holidayHeadCells.map((headCell) => (
                        <TableCell
                          className="table__title"
                          key={headCell.id}
                          sortDirection={
                            orderBy === headCell.id ? order : false
                          }
                        >
                          <TableSortLabel
                            active={orderBy === headCell.id}
                            direction={orderBy === headCell.id ? order : "asc"}
                            onClick={() => handleRequestSort(headCell.id)}
                          >
                            {headCell.label}
                            {orderBy === headCell.id ? (
                              <Box component="span" sx={visuallyHidden}>
                                {order === "desc"
                                  ? "sorted descending"
                                  : "sorted ascending"}
                              </Box>
                            ) : null}
                          </TableSortLabel>
                        </TableCell>
                      ))}
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody className="table__body">
                    {paginatedRows.map((row: HolidayRow, index) => (
                      <TableRow
                        key={row.id}
                        selected={selected.includes(index)}
                        onClick={() => handleClick(index)}
                      >
                        <TableCell className="table__designation">
                          {row?.date}
                        </TableCell>
                        <TableCell className="table__designation">
                          {row?.day}
                        </TableCell>
                        <TableCell className="table__department">
                          {row?.holidayName}
                        </TableCell>
                        <TableCell className="table__icon-box">
                          <div className="flex items-center justify-start gap-[10px]">
                            <button
                              type="button"
                              className="table__icon edit"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Find the full holiday data from our stored array
                                const fullHoliday = fullHolidayData.find(h => h.id === row.id) || {
                                  id: row.id,
                                  title: row.holidayName,
                                  date: row.date
                                } as IHoliday;
                                setModalOpen(true);
                                setEditData(fullHoliday);
                              }}
                            >
                              <i className="fa-sharp fa-light fa-pen"></i>
                            </button>
                            <button
                              className="removeBtn table__icon delete"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteId(row.id);
                                setModalDeleteOpen(true);
                              }}
                            >
                              <i className="fa-regular fa-trash"></i>
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
          <Box className="table-search-box mt-[30px]" sx={{ p: 2 }}>
            <Box>
              {`Showing ${(page - 1) * rowsPerPage + 1} to ${Math.min(
                page * rowsPerPage,
                filteredRows.length
              )} of ${filteredRows.length} entries`}
            </Box>
            <Pagination
              count={Math.ceil(filteredRows.length / rowsPerPage)}
              page={page}
              onChange={(e, value) => handleChangePage(value)}
              variant="outlined"
              shape="rounded"
              className="manaz-pagination-button"
            />
          </Box>
        </div>
      </div>
      {modalOpen && editData?.title && (
        <HolidayUpdateModal
          open={modalOpen}
          setOpen={(isOpen) => {
            setModalOpen(isOpen);
            // Refresh data when modal closes
            if (!isOpen) {
              // Re-fetch holidays to get updated data
              const loadHolidays = async () => {
                try {
                  const data = await fetchHolidays();
                  
                  const displayData: HolidayRow[] = data.map(holiday => ({
                    id: holiday.id || Date.now() + Math.random(),
                    date: holiday.date || "",
                    day: holiday.date ? new Date(holiday.date).toLocaleDateString('en-US', { weekday: 'long' }) : "",
                    holidayName: holiday.title || ""
                  }));
                  setHolidays(displayData);
                  setRows(displayData); // Update the rows in the hook
                  setFullHolidayData(data); // Update the full data
                } catch (error) {
                  toast.error("Failed to refresh holidays");
                  console.error("Error refreshing holidays:", error);
                }
              };
              loadHolidays();
            }
          }}
          editData={editData}
        />
      )}

      {modalDeleteOpen && (
        <DeleteModal
          open={modalDeleteOpen}
          setOpen={(isOpen) => {
            setModalDeleteOpen(isOpen);
            // Refresh data when modal closes after successful delete
            if (!isOpen) {
              // Re-fetch holidays to get updated data
              const loadHolidays = async () => {
                try {
                  const data = await fetchHolidays();
                  
                  const holidayRows: HolidayRow[] = data.map(holiday => ({
                    id: holiday.id || Date.now() + Math.random(),
                    date: holiday.date || "",
                    day: holiday.date ? new Date(holiday.date).toLocaleDateString('en-US', { weekday: 'long' }) : "",
                    holidayName: holiday.title || ""
                  }));
                  setHolidays(holidayRows);
                  setRows(holidayRows); // Update the rows in the hook
                } catch (error) {
                  toast.error("Failed to refresh holidays");
                  console.error("Error refreshing holidays:", error);
                }
              };
              loadHolidays();
            }
          }}
          handleDeleteFunc={handleDelete}
          deleteId={deleteId}
        />
      )}
    </>
  );
};

export default HolidayTable;