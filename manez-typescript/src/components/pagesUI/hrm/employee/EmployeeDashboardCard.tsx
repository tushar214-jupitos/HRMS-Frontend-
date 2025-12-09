import React from "react";

interface EmployeeDashboardCardProps {
  totalCount: number;
  activeCount: number;
  inactiveCount: number;
}

const EmployeeDashboardCard: React.FC<EmployeeDashboardCardProps> = ({
  totalCount,
  activeCount,
  inactiveCount,
}) => {
  return (
    <>
      <div className="col-span-12 sm:col-span-6 xxl:col-span-4">
        <div className="card__wrapper">
          <div className="flex tems-center gap-[10px] md:gap-[30px]">
            <div className="card__icon">
              <span>
                <i className="fa-sharp fa-regular fa-user"></i>
              </span>
            </div>
            <div className="card__title-wrap">
              <h6 className="card__sub-title mb-[10px]">Total Employees</h6>
              <div className="flex flex-wrap items-end gap-[10px]">
                <h4 className="card__title">{totalCount}</h4>
                {/* <span className="card__desc style_two">
                  <span className="price-increase">
                    <i className="fa-light fa-arrow-up"></i> +8%
                  </span>{" "}
                  Than Last Year
                </span> */}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-span-12 sm:col-span-6 xxl:col-span-4">
        <div className="card__wrapper">
          <div className="flex tems-center gap-[10px] md:gap-[30px]">
            <div className="card__icon">
              <span>
                <i className="fa-sharp fa-regular fa-house-person-leave"></i>
              </span>
            </div>
            <div className="card__title-wrap">
              <h6 className="card__sub-title mb-[10px]">Active</h6>
              <div className="flex flex-wrap items-end gap-[10px]">
                <h4 className="card__title">{activeCount}</h4>
                {/* <span className="card__desc style_two">
                  <span className="price-increase">
                    <i className="fa-light fa-arrow-up"></i> +3.5%
                  </span>{" "}
                  Than Last Month
                </span> */}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-span-12 sm:col-span-6 xxl:col-span-4">
        <div className="card__wrapper">
          <div className="flex tems-center gap-[10px] md:gap-[30px]">
            <div className="card__icon">
              <span>
                <i className="fa-sharp fa-regular fa-building"></i>
              </span>
            </div>
            <div className="card__title-wrap">
              <h6 className="card__sub-title mb-[10px]">Inactive</h6>
              <div className="flex flex-wrap items-end gap-[10px]">
                <h4 className="card__title">{inactiveCount}</h4>
                {/* <span className="card__desc style_two">
                  <span className="price-increase">
                    <i className="fa-light fa-arrow-up"></i> +2.15%
                  </span>{" "}
                  Than Last Month
                </span> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EmployeeDashboardCard;
