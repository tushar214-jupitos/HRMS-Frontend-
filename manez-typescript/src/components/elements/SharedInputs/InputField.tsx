import ErrorMessage from "@/components/error-message/ErrorMessage";
import React from "react";
import { FieldError, UseFormRegister } from "react-hook-form";

interface InputFieldProps {
  label: string;
  id?: string;
  type?: string;
  required?: boolean;
  register?: ReturnType<UseFormRegister<any>>;
  error?: FieldError | string;
  groupInput?: boolean;
  groupText?: string;
  isTextArea?: boolean;
  defaultValue?: string | number;
  placeholder?: string;
  disabled?: boolean;
  step?: number | string;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  id,
  type = "text",
  groupText = "USD",
  required = true,
  register,
  error,
  groupInput = false,
  isTextArea = false,
  defaultValue = "",
  placeholder = "",
  disabled = false,
  step,
}) => {
  return (
    <div className="form__input-box">
      <div className="form__input-title">
        <label htmlFor={id}>
          {label} {required && <span>*</span>}
        </label>
      </div>
      <>
        {!isTextArea ? (
          <>
            {!groupInput ? (
              <>
                <div className="form__input">
                  <input
                    className={`form-control ${error ? "is-invalid" : ""}`}
                    id={id}
                    type={type}
                    defaultValue={defaultValue} // Set the default value
                    disabled={disabled}
                    placeholder={placeholder}
                    step={step}
                    {...(register ? register : {})}
                  />
                </div>
                {error && (
                  <ErrorMessage
                    error={typeof error === "string" ? error : error.message}
                  />
                )}
              </>
            ) : (
              <>
                <div className="input-group">
                  <span className="input-group-text">{groupText}</span>
                  <input
                    className={`form-control ${error ? "is-invalid" : ""}`}
                    id={id}
                    type={type}
                    defaultValue={defaultValue} // Set the default value
                    disabled={disabled}
                    placeholder={placeholder}
                    step={step}
                    {...(register ? register : {})}
                  />
                </div>
                {error && (
                  <ErrorMessage
                    error={typeof error === "string" ? error : error.message}
                  />
                )}
              </>
            )}
          </>
        ) : (
          <>
            <div className="form__input">
              <textarea
                id={id}
                className={`form-control ${error ? "is-invalid" : ""}`}
                defaultValue={defaultValue} // Set the default value
                placeholder={placeholder}
                {...(register ? register : {})}
              ></textarea>
            </div>
            {error && (
              <ErrorMessage
                error={typeof error === "string" ? error : error.message}
              />
            )}
          </>
        )}
      </>
    </div>
  );
};

export default InputField;
