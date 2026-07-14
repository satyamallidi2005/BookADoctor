import React from 'react';

const Input = ({
  label,
  id,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  className = '',
  ...props
}) => {
  const inputId = id || `input-${name}`;

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type={type}
        id={inputId}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm transition-colors duration-200 outline-none
          ${error 
            ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
            : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
          }
          placeholder-gray-400 text-gray-900`}
        {...props}
      />
      {error && (
        <span className="text-xs text-red-500 mt-0.5" id={`${inputId}-error`}>
          {error}
        </span>
      )}
    </div>
  );
};

export default Input;
