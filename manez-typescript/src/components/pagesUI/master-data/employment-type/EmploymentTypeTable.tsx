"use client";
import React, { useEffect, useState } from "react";
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
import { employmentTypeData, IEmploymentType } from "@/data/master-data/employmentTypeData";
import useMaterialTableHook from "@/hooks/useMaterialTableHook";
import EmploymentTypeUpdateModal from "./EmploymentTypeUpdateModal";
import TableControls from "@/components/elements/SharedInputs/TableControls";
import DeleteModal from "@/components/common/DeleteModal";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const headCells = [
  { id: "name", numeric: false, disablePadding: false, label: "Employment Type" },
  { id: "description", numeric: false, disablePadding: false, label: "Description" },
];

const EmploymentTypeTable = () => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editData, setEditData] = useState<IEmploymentType | null>(null);
  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
    setRows,
  } = useMaterialTableHook<IEmploymentType | any>(employmentTypeData, 10);

  useEffect(() => {
    const fetchEmploymentTypes = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("accessToken");
        if (!token) {
          setError("Unauthorized! Please login again.");
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_BASE_URL}/api/master/employment-types/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        });

        if (!res.ok) {
          setError("Failed to load employment types");
          setLoading(false);
          return;
        }

        const data = await res.json();
        const array = Array.isArray(data)
          ? data
          : data?.results || data?.data || [];

        const mapped: IEmploymentType[] = array.map((item: any) => ({
          id: item.id,
          name: item.name,
          description: item.description,
        }));

        setRows(mapped);
      } catch {
        setError("Failed to load employment types");
      } finally {
        setLoading(false);
      }
    };

    fetchEmploymentTypes();
  }, [setRows]);

  const handleDeleteEmploymentType = async (id: number) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("Unauthorized! Please login again.");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/master/employment-types/${id}/`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (!res.ok) {
        setError("Failed to delete employment type");
        return;
      }

      setRows((prev: IEmploymentType[]) => prev.filter((row) => row.id !== id));
    } catch {
      setError("Failed to delete employment type");
    }
  };

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
                <Table aria-labelledby="tableTitle" className="whitespace-nowrap">
                  <TableHead>
                    <TableRow className="table__title">
                      {headCells.map((headCell) => (
                        <TableCell
                          className="table__title"
                          key={headCell.id}
                          sortDirection={orderBy === headCell.id ? order : false}
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
                    {loading && (
                      <TableRow>
                        <TableCell colSpan={headCells.length + 1}>
                          Loading employment types...
                        </TableCell>
                      </TableRow>
                    )}
                    {!loading && error && (
                      <TableRow>
                        <TableCell colSpan={headCells.length + 1}>
                          {error}
                        </TableCell>
                      </TableRow>
                    )}
                    {!loading &&
                      !error &&
                      paginatedRows.map((row, index) => (
                        <TableRow
                          key={index}
                          selected={selected.includes(index)}
                          onClick={() => handleClick(index)}
                        >
                          <TableCell>{row?.name}</TableCell>
                          <TableCell>{row?.description}</TableCell>
                          <TableCell className="table__icon-box">
                            <div className="flex items-center justify-start gap-[10px]">
                              <button
                                type="button"
                                className="table__icon edit"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setModalOpen(true);
                                  setEditData(row);
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
      {modalOpen && editData?.name && (
        <EmploymentTypeUpdateModal
          open={modalOpen}
          setOpen={setModalOpen}
          editData={editData}
        />
      )}
      {modalDeleteOpen && (
        <DeleteModal
          open={modalDeleteOpen}
          setOpen={setModalDeleteOpen}
          handleDeleteFunc={handleDeleteEmploymentType}
          deleteId={deleteId}
        />
      )}
    </>
  );
};

export default EmploymentTypeTable;
