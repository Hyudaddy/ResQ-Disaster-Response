import React, { InputHTMLAttributes, forwardRef, useState, useEffect } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  showPasswordToggle?: boolean;
  showPasswordStrength?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, rightIcon, fullWidth = true, className = '', showPasswordToggle, showPasswordStrength, type, value, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);

    const inputBaseClass = 'bg-white dark:bg-dark-900 border text-light-900 dark:text-dark-100 rounded-md block w-full p-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition';
    const inputStateClass = error
      ? 'border-danger-500 focus:ring-danger-500 focus:border-danger-500'
      : 'border-light-200 dark:border-dark-700';
    const inputWidthClass = fullWidth ? 'w-full' : '';
    const inputWithIconClass = leftIcon ? 'pl-10' : '';
    const inputWithRightElementClass = showPasswordToggle || rightIcon ? 'pr-10' : '';
    
    // Calculate password strength
    const calculatePasswordStrength = (password: string) => {
      let strength = 0;
      if (password.length >= 8) strength += 1;
      if (/[A-Z]/.test(password)) strength += 1;
      if (/[a-z]/.test(password)) strength += 1;
      if (/[0-9]/.test(password)) strength += 1;
      if (/[^A-Za-z0-9]/.test(password)) strength += 1;
      return strength;
    };

    // Update password strength when value changes
    useEffect(() => {
      if (showPasswordStrength && type === 'password' && value) {
        const strength = calculatePasswordStrength(value as string);
        setPasswordStrength(strength);
      }
    }, [value, showPasswordStrength, type]);

    // Handle password change
    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (showPasswordStrength && type === 'password') {
        const strength = calculatePasswordStrength(e.target.value);
        setPasswordStrength(strength);
      }
      props.onChange?.(e);
    };

    // Get password strength color
    const getStrengthColor = (strength: number) => {
      switch (strength) {
        case 0:
        case 1:
          return 'bg-danger-500';
        case 2:
        case 3:
          return 'bg-warning-500';
        case 4:
        case 5:
          return 'bg-success-500';
        default:
          return 'bg-dark-700';
      }
    };

    // Get password strength text and color
    const getStrengthText = (strength: number) => {
      switch (strength) {
        case 0:
        case 1:
          return { text: 'Very Weak', color: 'text-danger-500' };
        case 2:
        case 3:
          return { text: 'Medium', color: 'text-warning-500' };
        case 4:
        case 5:
          return { text: 'Strong', color: 'text-success-500' };
        default:
          return { text: '', color: '' };
      }
    };

    // Get password suggestions
    const getPasswordSuggestions = (strength: number) => {
      const suggestions = [];
      if (strength < 5) {
        if (strength < 1) suggestions.push('Use at least 8 characters');
        if (strength < 2) suggestions.push('Add uppercase letters');
        if (strength < 3) suggestions.push('Add lowercase letters');
        if (strength < 4) suggestions.push('Add numbers');
        if (strength < 5) suggestions.push('Add special characters');
      }
      return suggestions;
    };
    
    return (
      <div className={`mb-4 ${inputWidthClass}`}>
        {label && (
          <label className="block mb-2 text-sm font-medium text-light-700 dark:text-dark-200">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-light-500 dark:text-dark-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            type={showPasswordToggle && type === 'password' ? (showPassword ? 'text' : 'password') : type}
            className={`${inputBaseClass} ${inputStateClass} ${inputWithIconClass} ${inputWithRightElementClass} ${className} box-border text-sm placeholder-text-sm`}
            onChange={handlePasswordChange}
            value={value}
            {...props}
          />
          {showPasswordToggle && type === 'password' && (
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-light-500 dark:text-dark-400 hover:text-light-700 dark:hover:text-dark-200"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
          {rightIcon && !showPasswordToggle && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-light-500 dark:text-dark-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="mt-2 text-sm text-danger-500">{error}</p>}
        {showPasswordStrength && type === 'password' && value && (
          <div className="mt-2">
            <div className="h-1 w-full bg-dark-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${getStrengthColor(passwordStrength)}`}
                style={{ width: `${(passwordStrength / 5) * 100}%` }}
              />
            </div>
            <div className="mt-2 space-y-1">
              <p className={`text-xs font-medium ${getStrengthText(passwordStrength).color}`}>
                Password Strength: {getStrengthText(passwordStrength).text}
              </p>
              {passwordStrength < 5 && (
                <div className="text-xs text-dark-300 space-y-1">
                  <p className="flex items-center gap-1">
                    <AlertCircle size={12} className="text-warning-500" />
                    Suggestions to improve:
                  </p>
                  <ul className="list-disc list-inside ml-2 space-y-0.5">
                    {getPasswordSuggestions(passwordStrength).map((suggestion, index) => (
                      <li key={index} className="text-dark-400">{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;