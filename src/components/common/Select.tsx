import React, { SelectHTMLAttributes, forwardRef } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  fullWidth?: boolean;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, fullWidth = true, className = '', ...props }, ref) => {
    const selectBaseClass = 'bg-dark-900 border text-dark-100 rounded-md block p-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition';
    const selectStateClass = error
      ? 'border-danger-500 focus:ring-danger-500 focus:border-danger-500'
      : 'border-dark-700';
    const selectWidthClass = fullWidth ? 'w-full' : '';
    
    return (
      <div className={`mb-4 ${selectWidthClass}`}>
        {label && (
          <label className="block mb-2 text-sm font-medium text-dark-200">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`${selectBaseClass} ${selectStateClass} ${className}`}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-2 text-sm text-danger-500">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;