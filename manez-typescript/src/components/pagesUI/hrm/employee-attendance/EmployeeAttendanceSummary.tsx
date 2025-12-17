
import React from "react";

const EmployeeAttendanceSummary = () => {
  return (
    <>
      <div className="col-span-12 sm:col-span-6 xxl:col-span-3">
        <div className="card__wrapper">
          <div className="flex items-center gap-[30px] maxSm:gap-5">
            <div className="card__icon">
              <span>
                <i className="fa-sharp fa-regular fa-calendar-check"></i>
              </span>
            </div>
            <div className="card__title-wrap">
              <h6 className="card__sub-title mb-[10px]">
                
              </h6>
              <div className="card__content">
                <h3 className="card__title mb-[5px]">22</h3>
                <span className="card__desc style_two">
                  <span className="price-increase">
                    <i className="fa-light fa-arrow-up"></i> +5.15%
                  </span>{" "}
                  Than Last Month
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-span-12 sm:col-span-6 xxl:col-span-3">
        <div className="card__wrapper">
          <div className="flex items-center gap-[30px] maxSm:gap-5">
            <div className="card__icon">
              <span>
                <i className="fa-sharp fa-regular fa-clock"></i>
              </span>
            </div>
            <div className="card__title-wrap">
              <h6 className="card__sub-title mb-[10px]">Average Hours</h6>
              <div className="card__content">
                <h3 className="card__title mb-[5px]">8.5 Hrs</h3>
                <span className="card__desc style_two">
                  <span className="price-increase">
                    <i className="fa-light fa-arrow-up"></i> +2.15%
                  </span>{" "}
                  Than Last Month
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-span-12 sm:col-span-6 xxl:col-span-3">
        <div className="card__wrapper">
          <div className="flex items-center gap-[30px] maxSm:gap-5">
            <div className="card__icon">
              <span>
                <i className="fa-light fa-person-to-door"></i>
              </span>
            </div>
            <div className="card__title-wrap">
              <h6 className="card__sub-title mb-[10px]">Late Arrivals</h6>
              <div className="card__content">
                <h3 className="card__title mb-[5px]">3 Days</h3>
                <span className="card__desc style_two">
                  <span className="price-decrease">
                    <i className="fa-light fa-arrow-down"></i> -1.5%
                  </span>{" "}
                  Than Last Month
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-span-12 sm:col-span-6 xxl:col-span-3">
        <div className="card__wrapper">
          <div className="flex items-center gap-[30px] maxSm:gap-5">
            <div className="card__icon">
              <span>
                <i className="fa-sharp fa-regular fa-calendar-xmark"></i>
              </span>
            </div>
            <div className="card__title-wrap">
              <h6 className="card__sub-title mb-[10px]">Absent Days</h6>
              <div className="card__content">
                <h3 className="card__title mb-[5px]">2 Days</h3>
                <span className="card__desc style_two">
                  <span className="price-decrease">
                    <i className="fa-light fa-arrow-down"></i> -0.5%
                  </span>{" "}
                  Than Last Month
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EmployeeAttendanceSummary;