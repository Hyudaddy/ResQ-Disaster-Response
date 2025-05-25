import React, { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, rightIcon, fullWidth = true, className = '', ...props }, ref) => {
    const inputBaseClass = 'bg-white dark:bg-dark-900 border text-light-900 dark:text-dark-100 rounded-md block w-full p-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition';
    const inputStateClass = error
      ? 'border-danger-500 focus:ring-danger-500 focus:border-danger-500'
      : 'border-light-200 dark:border-dark-700';
    const inputWidthClass = fullWidth ? 'w-full' : '';
    const inputWithIconClass = leftIcon || rightIcon ? 'pl-10' : '';
    
    return (
      <div className={`mb-4 ${inputWidthClass}`}>
        {label && (
          <label className="block mb-2 text-sm font-medium text-light-700 dark:text-dark-200">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-light-500 dark:text-dark-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={`${inputBaseClass} ${inputStateClass} ${inputWithIconClass} ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-light-500 dark:text-dark-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="mt-2 text-sm text-danger-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;