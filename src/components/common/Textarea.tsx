import React, { TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, fullWidth = true, className = '', ...props }, ref) => {
    const textareaBaseClass = 'bg-dark-900 border text-dark-100 rounded-md block p-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition';
    const textareaStateClass = error
      ? 'border-danger-500 focus:ring-danger-500 focus:border-danger-500'
      : 'border-dark-700';
    const textareaWidthClass = fullWidth ? 'w-full' : '';
    
    return (
      <div className={`mb-4 ${textareaWidthClass}`}>
        {label && (
          <label className="block mb-2 text-sm font-medium text-dark-200">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`${textareaBaseClass} ${textareaStateClass} ${className}`}
          {...props}
        />
        {error && <p className="mt-2 text-sm text-danger-500">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;