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
    const selectBaseClass = 'bg-dark-900 border text-dark-100 rounded-md block p-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition appearance-none';
    const selectStateClass = error
      ? 'border-danger-500 focus:ring-danger-500 focus:border-danger-500'
      : 'border-dark-700';
    const selectWidthClass = fullWidth ? 'w-full' : '';
    
    return (
      <div className={`mb-4 ${selectWidthClass} relative`}>
        {label && (
          <label className="block mb-2 text-sm font-medium text-dark-200">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={`${selectBaseClass} ${selectStateClass} ${className} pr-8 box-border text-ellipsis overflow-hidden whitespace-nowrap min-w-0 text-sm`}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-dark-400">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
        {error && <p className="mt-2 text-sm text-danger-500">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;