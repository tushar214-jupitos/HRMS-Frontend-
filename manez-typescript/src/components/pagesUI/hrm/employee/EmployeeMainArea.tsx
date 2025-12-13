import Breadcrumb from "@/common/Breadcrumb/breadcrumb";
import React from "react";
import EmployeeFilter from "./EmployeeFilter";
import EmployeeSingleCard from "@/components/common/EmployeeSingleCard";
import employeeData from "@/data/hrm/employee-data";

const EmployeeMainArea = () => {
  return (
    <>
      <div className="app__slide-wrapper">
        <Breadcrumb breadTitle="Employee" subTitle="Home" />
        {/* Dashboard Cards and Add Employee Button */}
        <div className="grid grid-cols-12 gap-x-6 maxXs:gap-x-0 mb-[20px] items-end">
          <div className="col-span-12 xxl:col-span-9">
            <div className="grid grid-cols-12 gap-x-6 maxXs:gap-x-0 h-full">
              <EmployeeDashboardCard
                totalCount={totalCount}
                activeCount={activeCount}
                inactiveCount={inactiveCount}
              />
            </div>
          </div>
          <div className="col-span-12 xxl:col-span-3 flex justify-end h-full">
            <div className="card__wrapper w-full xxl:w-auto">
              <button
                type="button"
                className="btn btn-primary w-full"
                data-bs-toggle="modal"
                data-bs-target="#addNewEmployee"
                onClick={() => setModalOpen(true)}
              >
                Add Employee
              </button>
            </div>
          </div>
        </div>
        {modalOpen && (
          <AddNewEmployeeModal open={modalOpen} setOpen={setModalOpen} />
        )}
        <EmployeeListFilter
          onFilterChange={setFilterParams}
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          activeFilters={filterParams}
        />{" "}
        <EmployeeFilter />
        <div className="grid grid-cols-12 gap-x-6 maxXs:gap-x-0">
          {employeeData?.map((employee, index) => (
            <EmployeeSingleCard key={index} employee={employee} />
          ))}
        </div>

                <div className="flex justify-center mt-[20px] mb-[20px]">
                  <button type="button" className="btn btn-primary">
                    Load More
                  </button>
                </div>
              </>
            ) : (
              <EmployeeListView
                employees={employees}
                onEmployeeDeleted={() => {
                  // Refresh employee list
                  window.location.reload();
                }}
                onEmployeeUpdated={() => {
                  // Refresh employee list
                  window.location.reload();
                }}
              />
            )}
          </>
        )}
      </div>
    </>
  );
};

export default EmployeeMainArea;
